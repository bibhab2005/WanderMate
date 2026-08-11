from datetime import date
from allauth.socialaccount.models import SocialAccount


def serialize_profile(user):
    profile = getattr(user, 'profile', None)
    prefs = getattr(user, 'preferences', None)
    
    avatar_url = ''
    social_account = SocialAccount.objects.filter(user=user, provider='google').first()
    if social_account and social_account.extra_data:
        avatar_url = social_account.extra_data.get('picture', '')
        
    if not avatar_url and profile and profile.avatar:
        try:
            avatar_url = profile.avatar.url
        except Exception:
            avatar_url = ''
            
    if not avatar_url:
        avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.username}"

    return {
        'id': user.id,
        'username': user.username,
        'full_name': user.get_full_name() or user.username,
        'email': user.email,
        'avatar': avatar_url,
        'bio': profile.bio if profile else '',
        'home_city': profile.home_city if profile else '',
        'age': profile.age if profile else None,
        'gender': profile.gender if profile else '',
        'pace': profile.pace if profile else 'moderate',
        'languages': profile.languages if profile else [],
        'style_tags': prefs.style_tags if prefs else [],
        'onboarding_complete': profile.onboarding_complete if profile else False,
    }


def serialize_itinerary(itin):
    return {
        'id': itin.id,
        'destination_city': itin.destination_city,
        'destination_country': itin.destination_country,
        'start_date': itin.start_date.isoformat(),
        'end_date': itin.end_date.isoformat(),
        'activities': itin.activities,
        'flexible_dates': itin.flexible_dates,
        'duration_days': (itin.end_date - itin.start_date).days + 1,
        'created_at': itin.created_at.isoformat(),
    }


def serialize_match(user, score, breakdown):
    profile_data = serialize_profile(user)
    profile_data['match_score'] = score
    profile_data['breakdown'] = breakdown
    itineraries = user.itineraries.all()[:3]
    profile_data['sample_itineraries'] = [serialize_itinerary(i) for i in itineraries]
    return profile_data


def serialize_travel_request(req, perspective_user):
    is_sender = req.sender_id == perspective_user.id
    other = req.receiver if is_sender else req.sender
    return {
        'id': req.id,
        'other_user': serialize_profile(other),
        'status': req.status,
        'message': req.message,
        'is_sender': is_sender,
        'created_at': req.created_at.isoformat(),
    }


def serialize_ai_itinerary(itin):
    return {
        'id': itin.id,
        'destination': itin.destination,
        'days': itin.days,
        'min_budget': itin.min_budget,
        'max_budget': itin.max_budget,
        'group_size': itin.group_size,
        'itinerary_data': itin.itinerary_data,
        'created_at': itin.created_at.isoformat(),
    }
