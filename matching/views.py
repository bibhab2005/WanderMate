import json
import os
from datetime import date
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from .models import UserProfile, TravelPreference, Itinerary, TravelRequest, Message, AIItinerary
from .engine import get_ranked_matches, compute_match_score
from .serializers import serialize_profile, serialize_itinerary, serialize_match, serialize_travel_request, serialize_ai_itinerary
# pyrefly: ignore [missing-import]
import google.generativeai as genai


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
@require_http_methods(['POST'])
def onboarding_complete(request):
    data = json.loads(request.body)
    profile = request.user.profile
    prefs = request.user.preferences
    user = request.user
    
    if 'full_name' in data:
        parts = data['full_name'].split(' ', 1)
        user.first_name = parts[0]
        user.last_name = parts[1] if len(parts) > 1 else ''
        user.save(update_fields=['first_name', 'last_name'])
        
    if 'email' in data:
        user.email = data['email']
        user.save(update_fields=['email'])

    profile.age = data.get('age')
    profile.gender = data.get('gender', '')
    profile.pace = data.get('pace', 'moderate')
    profile.bio = data.get('bio', '')
    profile.languages = data.get('languages', [])
    profile.onboarding_complete = True
    profile.save()
    prefs.style_tags = data.get('style_tags', [])
    prefs.save()
    return JsonResponse({'success': True, 'redirect': '/dashboard/'})


@login_required
def dashboard_feed(request):
    return redirect('http://localhost:5174/dashboard')


@login_required
def api_matches(request):
    min_score = float(request.GET.get('min_score', 0))
    destination = request.GET.get('destination', '').strip().lower()
    ranked = get_ranked_matches(request.user, min_score=min_score)
    results = []
    for candidate, score, breakdown in ranked:
        if destination:
            dest_match = any(
                destination in i.destination_city.lower() or destination in i.destination_country.lower()
                for i in candidate.itineraries.all()
            )
            if not dest_match:
                continue
        results.append(serialize_match(candidate, score, breakdown))
    return JsonResponse({'matches': results})


@login_required
def api_match_detail(request, user_id):
    candidate = get_object_or_404(User, id=user_id)
    score, breakdown = compute_match_score(request.user, candidate)
    data = serialize_match(candidate, score, breakdown)
    return JsonResponse(data)


@login_required
def profile_view(request):
    return redirect('http://localhost:5174/profile')


@login_required
@require_http_methods(['POST'])
def profile_update(request):
    data = json.loads(request.body)
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

    return JsonResponse({'success': True, 'profile': serialize_profile(request.user)})


@login_required
def itineraries_view(request):
    return redirect('http://localhost:5174/trips')



@login_required
def api_itineraries(request):
    q = request.GET.get('q', '').strip().lower()
    start = request.GET.get('start_date', '')
    end = request.GET.get('end_date', '')
    itins = request.user.itineraries.all()
    if q:
        itins = itins.filter(
            Q(destination_city__icontains=q) | Q(destination_country__icontains=q)
        )
    if start:
        itins = itins.filter(start_date__gte=start)
    if end:
        itins = itins.filter(end_date__lte=end)

    return JsonResponse({'itineraries': [serialize_itinerary(i) for i in itins]})


@login_required
@require_http_methods(['POST'])
def api_itinerary_create(request):
    data = json.loads(request.body)
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
    return JsonResponse({'success': True, 'itinerary': serialize_itinerary(itin)}, status=201)

@login_required
@require_http_methods(['POST'])
def api_generate_itinerary(request):
    data = json.loads(request.body)
    destination = data.get('destination', '')
    days = data.get('days', 1)
    min_budget = data.get('minBudget', '')
    max_budget = data.get('maxBudget', '')
    group_size = data.get('group_size', 'Solo')

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return JsonResponse({'error': 'Gemini API key not configured.'}, status=500)

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
            itinerary_data=itinerary_data
        )

        return JsonResponse({'success': True, 'itinerary': serialize_ai_itinerary(itin)}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_http_methods(['GET'])
def api_ai_itineraries_list(request):
    itins = request.user.ai_itineraries.all().order_by('-created_at')
    return JsonResponse({'itineraries': [serialize_ai_itinerary(i) for i in itins]})


@login_required
def api_itinerary_detail(request, pk):
    itin = get_object_or_404(Itinerary, pk=pk, user=request.user)
    if request.method == 'GET':
        return JsonResponse({'itinerary': serialize_itinerary(itin)})
    if request.method in ('PUT', 'PATCH'):
        data = json.loads(request.body)
        for field in ('destination_city', 'destination_country', 'start_date', 'end_date', 'activities', 'flexible_dates'):
            if field in data:
                setattr(itin, field, data[field])
        itin.save()
        itin.refresh_from_db()
        return JsonResponse({'success': True, 'itinerary': serialize_itinerary(itin)})
    if request.method == 'DELETE':
        itin.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Method not allowed'}, status=405)



@login_required
@require_http_methods(['POST'])
def api_travel_request_send(request):
    data = json.loads(request.body)
    receiver_id = data.get('receiver_id')
    message = data.get('message', '')
    receiver = get_object_or_404(User, id=receiver_id)
    if receiver == request.user:
        return JsonResponse({'error': 'Cannot send request to yourself.'}, status=400)
    req, created = TravelRequest.objects.get_or_create(
        sender=request.user,
        receiver=receiver,
        defaults={'message': message, 'status': 'pending'}
    )
    if not created:
        return JsonResponse({'error': 'Request already sent.', 'status': req.status}, status=409)
    return JsonResponse({'success': True, 'status': 'pending'}, status=201)


@login_required
@require_http_methods(['POST'])
def api_travel_request_respond(request, req_id):
    data = json.loads(request.body)
    action = data.get('action')
    travel_req = get_object_or_404(TravelRequest, id=req_id, receiver=request.user)
    if action == 'accept':
        travel_req.status = 'accepted'
    elif action == 'decline':
        travel_req.status = 'declined'
    else:
        return JsonResponse({'error': 'Invalid action.'}, status=400)
    travel_req.save()
    return JsonResponse({'success': True, 'status': travel_req.status})


@login_required
def api_travel_requests(request):
    sent = request.user.sent_requests.select_related('receiver', 'receiver__profile').all()
    received = request.user.received_requests.select_related('sender', 'sender__profile').all()
    return JsonResponse({
        'sent': [serialize_travel_request(r, request.user) for r in sent],
        'received': [serialize_travel_request(r, request.user) for r in received],
    })


@login_required
def api_request_status(request, user_id):
    try:
        req = TravelRequest.objects.get(sender=request.user, receiver_id=user_id)
        return JsonResponse({'status': req.status, 'direction': 'sent'})
    except TravelRequest.DoesNotExist:
        pass
    try:
        req = TravelRequest.objects.get(sender_id=user_id, receiver=request.user)
        return JsonResponse({'status': req.status, 'direction': 'received', 'req_id': req.id})
    except TravelRequest.DoesNotExist:
        pass
    return JsonResponse({'status': None})


from django.middleware.csrf import get_token

def api_csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})


def api_me(request):
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False}, status=401)
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        # Create user profile if it does not exist for some reason
        profile = UserProfile.objects.create(user=request.user)
    return JsonResponse({
        'authenticated': True,
        'onboarding_complete': profile.onboarding_complete,
        'profile': serialize_profile(request.user),
    })


@login_required
@require_http_methods(['GET', 'POST'])
def api_chat(request, receiver_id):
    if request.method == 'GET':
        messages = Message.objects.filter(
            Q(sender=request.user, receiver_id=receiver_id) |
            Q(sender_id=receiver_id, receiver=request.user)
        )
        data = [
            {
                'id': msg.id,
                'sender': msg.sender_id,
                'sender_name': msg.sender.username,
                'receiver': msg.receiver_id,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat()
            }
            for msg in messages
        ]
        return JsonResponse(data, safe=False)
    elif request.method == 'POST':
        data = json.loads(request.body)
        content = data.get('content', '').strip()
        if not content:
            return JsonResponse({'success': False, 'error': 'Empty content'}, status=400)
        receiver = get_object_or_404(User, id=receiver_id)
        msg = Message.objects.create(
            sender=request.user,
            receiver=receiver,
            content=content
        )
        return JsonResponse({
            'id': msg.id,
            'sender': msg.sender_id,
            'sender_name': msg.sender.username,
            'receiver': msg.receiver_id,
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat()
        }, status=201)


@login_required
def api_accepted_matches(request):
    reqs = TravelRequest.objects.filter(
        Q(sender=request.user, status='accepted') |
        Q(receiver=request.user, status='accepted')
    ).select_related('sender', 'sender__profile', 'receiver', 'receiver__profile')
    
    connected_users = []
    for r in reqs:
        other = r.receiver if r.sender == request.user else r.sender
        connected_users.append(serialize_profile(other))
        
    return JsonResponse(connected_users, safe=False)
