import json
import os
from datetime import date
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from allauth.socialaccount.models import SocialAccount
from .models import UserProfile, TravelPreference, Itinerary, TravelRequest, Message, AIItinerary
from .engine import get_ranked_matches, compute_match_score
from .serializers import (
    serialize_profile, serialize_itinerary, serialize_match,
    serialize_travel_request, serialize_ai_itinerary,
    ItinerarySerializer, AIItinerarySerializer, MessageSerializer,
)
# pyrefly: ignore [missing-import]
import google.generativeai as genai


# ─── Plain Django views (auth / redirects — not API) ───

def landing(request):
    if request.user.is_authenticated:
        return redirect('http://localhost:5174/dashboard')
    return redirect('http://localhost:5174/')


def auth_login(request):
    if request.method == 'GET' and request.user.is_authenticated:
        return redirect('http://localhost:5174/dashboard')
    if request.method == 'POST':
        data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        try:
            user_obj = User.objects.get(email__iexact=email)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None
        if user:
            login(request, user)
            if request.content_type == 'application/json':
                return JsonResponse({'success': True, 'redirect': 'http://localhost:5174/dashboard' if user.profile.onboarding_complete else 'http://localhost:5174/onboarding'})
            return redirect('http://localhost:5174/dashboard')
        if request.content_type == 'application/json':
            return JsonResponse({'success': False, 'error': 'Invalid email or password.'}, status=400)
        return redirect('http://localhost:5174/login?error=invalid')
    return redirect('http://localhost:5174/login')


def auth_signup(request):
    if request.method == 'GET' and request.user.is_authenticated:
        return redirect('http://localhost:5174/dashboard')
    if request.method == 'POST':
        data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        full_name = data.get('full_name', '').strip()
        if User.objects.filter(email__iexact=email).exists():
            if request.content_type == 'application/json':
                return JsonResponse({'success': False, 'error': 'Email already registered.'}, status=400)
            return redirect('http://localhost:5174/signup?error=exists')
        username = email.split('@')[0]
        base = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1
        parts = full_name.split(' ', 1)
        first = parts[0] if parts else ''
        last = parts[1] if len(parts) > 1 else ''
        user = User.objects.create_user(username=username, email=email, password=password, first_name=first, last_name=last)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        if request.content_type == 'application/json':
            return JsonResponse({'success': True, 'redirect': 'http://localhost:5174/onboarding'})
        return redirect('http://localhost:5174/onboarding')
    return redirect('http://localhost:5174/signup')


def auth_logout(request):
    logout(request)
    return redirect('http://localhost:5174/')


@login_required
def onboarding(request):
    return redirect('http://localhost:5174/onboarding')


@login_required
def dashboard_feed(request):
    return redirect('http://localhost:5174/dashboard')


@login_required
def profile_view(request):
    return redirect('http://localhost:5174/profile')


@login_required
def itineraries_view(request):
    return redirect('http://localhost:5174/trips')


# ─── DRF API Views ───

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def onboarding_complete(request):
    data = request.data
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    prefs, _ = TravelPreference.objects.get_or_create(user=user)
    
    if 'full_name' in data and data['full_name']:
        parts = data['full_name'].strip().split(' ', 1)
        user.first_name = parts[0]
        user.last_name = parts[1] if len(parts) > 1 else ''
        user.save(update_fields=['first_name', 'last_name'])
        
    if 'email' in data and data['email']:
        user.email = data['email'].strip()
        user.save(update_fields=['email'])

    age_raw = data.get('age')
    if age_raw is not None and age_raw != '':
        try:
            age_int = int(age_raw)
            if age_int < 1 or age_int > 120:
                return Response({'success': False, 'error': 'Please enter a valid age between 1 and 120.'}, status=status.HTTP_400_BAD_REQUEST)
            profile.age = age_int
        except (ValueError, TypeError):
            return Response({'success': False, 'error': 'Invalid age format.'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        profile.age = None

    if 'home_city' in data or 'location' in data:
        loc = (data.get('home_city') or data.get('location') or '').strip()
        profile.home_city = loc if loc else None

    profile.gender = data.get('gender', '')
    profile.pace = data.get('pace', 'moderate')
    profile.bio = data.get('bio', '')
    profile.languages = data.get('languages', [])
    profile.onboarding_complete = True
    try:
        profile.save()
    except Exception as e:
        return Response({'success': False, 'error': f'Failed to save profile: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    prefs.style_tags = data.get('style_tags', [])
    prefs.save()
    return Response({'success': True, 'redirect': '/dashboard/'})


@api_view(['GET'])
@permission_classes([AllowAny])
def api_csrf(request):
    from django.middleware.csrf import get_token
    return Response({'csrfToken': get_token(request)})


@api_view(['GET'])
@permission_classes([AllowAny])
def api_me(request):
    if not request.user.is_authenticated:
        return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)
    user = request.user

    # Sync name and email from Google SocialAccount if missing
    social_account = SocialAccount.objects.filter(user=user, provider='google').first()
    if social_account and social_account.extra_data:
        extra = social_account.extra_data
        updated_fields = []
        if not user.first_name and not user.last_name:
            name = (extra.get('name') or '').strip()
            given = (extra.get('given_name') or '').strip()
            family = (extra.get('family_name') or '').strip()
            if given or family:
                user.first_name = given
                user.last_name = family
                updated_fields.extend(['first_name', 'last_name'])
            elif name:
                parts = name.split(' ', 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ''
                updated_fields.extend(['first_name', 'last_name'])

        if not user.email and extra.get('email'):
            user.email = extra.get('email')
            updated_fields.append('email')

        if updated_fields:
            user.save(update_fields=updated_fields)

    profile, _ = UserProfile.objects.get_or_create(user=user)
    return Response({
        'authenticated': True,
        'onboarding_complete': profile.onboarding_complete,
        'profile': serialize_profile(user),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_matches(request):
    min_score = float(request.query_params.get('min_score', 0))
    destination = request.query_params.get('destination', '').strip().lower()
    ranked = get_ranked_matches(request.user, min_score=min_score, destination=destination)
    results = []
    for candidate, score, breakdown in ranked:
        if destination:
            dest_match = any(
                destination in i.destination_city.lower() or i.destination_city.lower() in destination or destination in i.destination_country.lower()
                for i in candidate.itineraries.all()
            ) or any(
                destination in ai.destination.lower() or ai.destination.lower() in destination
                for ai in candidate.ai_itineraries.filter(is_public=True)
            ) or (
                hasattr(candidate, 'profile') and candidate.profile.home_city and (
                    destination in candidate.profile.home_city.lower() or candidate.profile.home_city.lower() in destination
                )
            )
            if not dest_match:
                continue
        results.append(serialize_match(candidate, score, breakdown))
    return Response({'matches': results})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_match_detail(request, user_id):
    candidate = get_object_or_404(User, id=user_id)
    score, breakdown = compute_match_score(request.user, candidate)
    data = serialize_match(candidate, score, breakdown)
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def profile_update(request):
    data = request.data
    profile = request.user.profile
    prefs = request.user.preferences
    user = request.user

    if 'full_name' in data:
        parts = data['full_name'].split(' ', 1)
        user.first_name = parts[0]
        user.last_name = parts[1] if len(parts) > 1 else ''
        user.save(update_fields=['first_name', 'last_name'])

    if 'bio' in data:
        profile.bio = data['bio']
    if 'age' in data:
        profile.age = data['age']
    if 'gender' in data:
        profile.gender = data['gender']
    if 'home_city' in data:
        profile.home_city = data['home_city']
    if 'pace' in data:
        profile.pace = data['pace']
    if 'languages' in data:
        profile.languages = data['languages']
    profile.save()

    if 'style_tags' in data:
        prefs.style_tags = data['style_tags']
    prefs.save()

    return Response({'success': True, 'profile': serialize_profile(request.user)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_itineraries(request):
    q = request.query_params.get('q', '').strip().lower()
    start = request.query_params.get('start_date', '')
    end = request.query_params.get('end_date', '')
    itins = request.user.itineraries.all()
    if q:
        itins = itins.filter(
            Q(destination_city__icontains=q) | Q(destination_country__icontains=q)
        )
    if start:
        itins = itins.filter(start_date__gte=start)
    if end:
        itins = itins.filter(end_date__lte=end)

    return Response({'itineraries': ItinerarySerializer(itins, many=True).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_itinerary_create(request):
    data = request.data
    itin = Itinerary.objects.create(
        user=request.user,
        destination_city=data.get('destination_city', ''),
        destination_country=data.get('destination_country', ''),
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        activities=data.get('activities', []),
        flexible_dates=data.get('flexible_dates', False),
    )
    itin.refresh_from_db()
    return Response({'success': True, 'itinerary': serialize_itinerary(itin)}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_generate_itinerary(request):
    data = request.data
    destination = data.get('destination', '')
    days = data.get('days', 1)
    min_budget = data.get('minBudget', '')
    max_budget = data.get('maxBudget', '')
    group_size = data.get('group_size', 'Solo')
    is_public = data.get('is_public', False)

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return Response({'error': 'Gemini API key not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    genai.configure(api_key=api_key)

    budget_prompt = f" with a budget between ₹{min_budget} and ₹{max_budget}" if min_budget and max_budget else ""
    prompt = f"""
    You are an expert travel planner. Create a {days}-day itinerary for {destination} for a {group_size} group{budget_prompt}.
    Output ONLY a valid JSON object matching exactly this schema, without markdown formatting or code blocks:
    {{
      "trip_summary": {{
        "destination": "{destination}",
        "days": {days},
        "estimated_total_cost": "₹..."
      }},
      "days": [
        {{
          "day": 1,
          "title": "...",
          "morning": {{ "place": "...", "description": "...", "estimated_cost": "₹..." }},
          "afternoon": {{ "place": "...", "description": "...", "estimated_cost": "₹..." }},
          "evening": {{ "place": "...", "description": "...", "estimated_cost": "₹..." }}
        }}
      ]
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.endswith('```'):
            text = text[:-3]
        itinerary_data = json.loads(text.strip())
        
        itin = AIItinerary.objects.create(
            user=request.user,
            destination=destination,
            days=int(days),
            min_budget=int(min_budget) if min_budget else None,
            max_budget=int(max_budget) if max_budget else None,
            group_size=group_size,
            itinerary_data=itinerary_data,
            is_public=is_public
        )

        return Response({'success': True, 'itinerary': serialize_ai_itinerary(itin)}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_ai_itineraries_list(request):
    itins = request.user.ai_itineraries.all().order_by('-created_at')
    return Response({'itineraries': AIItinerarySerializer(itins, many=True).data})


@api_view(['PATCH', 'POST'])
@permission_classes([IsAuthenticated])
def api_ai_itinerary_toggle_privacy(request, pk):
    itin = get_object_or_404(AIItinerary, pk=pk, user=request.user)
    itin.is_public = not itin.is_public
    itin.save(update_fields=['is_public'])
    return Response({'success': True, 'is_public': itin.is_public})


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def api_itinerary_detail(request, pk):
    itin = get_object_or_404(Itinerary, pk=pk, user=request.user)
    if request.method == 'GET':
        return Response({'itinerary': serialize_itinerary(itin)})
    if request.method in ('PUT', 'PATCH'):
        data = request.data
        for field in ('destination_city', 'destination_country', 'start_date', 'end_date', 'activities', 'flexible_dates'):
            if field in data:
                setattr(itin, field, data[field])
        itin.save()
        itin.refresh_from_db()
        return Response({'success': True, 'itinerary': serialize_itinerary(itin)})
    if request.method == 'DELETE':
        itin.delete()
        return Response({'success': True})
    return Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_travel_request_send(request):
    data = request.data
    receiver_id = data.get('receiver_id')
    message = data.get('message', '')
    receiver = get_object_or_404(User, id=receiver_id)
    if receiver == request.user:
        return Response({'error': 'Cannot send request to yourself.'}, status=status.HTTP_400_BAD_REQUEST)
    req, created = TravelRequest.objects.get_or_create(
        sender=request.user,
        receiver=receiver,
        defaults={'message': message, 'status': 'pending'}
    )
    if not created:
        return Response({'error': 'Request already sent.', 'status': req.status}, status=status.HTTP_409_CONFLICT)
    return Response({'success': True, 'status': 'pending'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_travel_request_respond(request, req_id):
    data = request.data
    action = data.get('action')
    travel_req = get_object_or_404(TravelRequest, id=req_id, receiver=request.user)
    if action == 'accept':
        travel_req.status = 'accepted'
    elif action == 'decline':
        travel_req.status = 'declined'
    else:
        return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)
    travel_req.save()
    return Response({'success': True, 'status': travel_req.status})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_travel_requests(request):
    sent = request.user.sent_requests.select_related('receiver', 'receiver__profile').all()
    received = request.user.received_requests.select_related('sender', 'sender__profile').all()
    return Response({
        'sent': [serialize_travel_request(r, request.user) for r in sent],
        'received': [serialize_travel_request(r, request.user) for r in received],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_request_status(request, user_id):
    try:
        req = TravelRequest.objects.get(sender=request.user, receiver_id=user_id)
        return Response({'status': req.status, 'direction': 'sent'})
    except TravelRequest.DoesNotExist:
        pass
    try:
        req = TravelRequest.objects.get(sender_id=user_id, receiver=request.user)
        return Response({'status': req.status, 'direction': 'received', 'req_id': req.id})
    except TravelRequest.DoesNotExist:
        pass
    return Response({'status': None})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_chat(request, receiver_id):
    if request.method == 'GET':
        messages = Message.objects.filter(
            Q(sender=request.user, receiver_id=receiver_id) |
            Q(sender_id=receiver_id, receiver=request.user)
        )
        return Response(MessageSerializer(messages, many=True).data)
    elif request.method == 'POST':
        data = request.data
        content = data.get('content', '').strip()
        if not content:
            return Response({'success': False, 'error': 'Empty content'}, status=status.HTTP_400_BAD_REQUEST)
        receiver = get_object_or_404(User, id=receiver_id)
        msg = Message.objects.create(
            sender=request.user,
            receiver=receiver,
            content=content
        )
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_accepted_matches(request):
    reqs = TravelRequest.objects.filter(
        Q(sender=request.user, status='accepted') |
        Q(receiver=request.user, status='accepted')
    ).select_related('sender', 'sender__profile', 'receiver', 'receiver__profile')
    
    connected_users = []
    for r in reqs:
        other = r.receiver if r.sender == request.user else r.sender
        connected_users.append(serialize_profile(other))
        
    return Response(connected_users)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_delete_account(request):
    request.user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
