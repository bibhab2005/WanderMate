from rest_framework import serializers
from django.contrib.auth.models import User
from allauth.socialaccount.models import SocialAccount
from .models import UserProfile, TravelPreference, Itinerary, TravelRequest, Message, AIItinerary


class TravelPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelPreference
        fields = ['style_tags']


class UserProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)
    avatar = serializers.SerializerMethodField()
    style_tags = serializers.SerializerMethodField()
    onboarding_complete = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'full_name', 'email', 'avatar',
            'bio', 'home_city', 'age', 'gender', 'pace', 'languages',
            'style_tags', 'onboarding_complete',
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_avatar(self, obj):
        user = obj.user
        avatar_url = ''
        social_account = SocialAccount.objects.filter(user=user, provider='google').first()
        if social_account and social_account.extra_data:
            avatar_url = social_account.extra_data.get('picture', '')

        if not avatar_url and obj.avatar:
            try:
                avatar_url = obj.avatar.url
            except Exception:
                avatar_url = ''

        if not avatar_url:
            avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.username}"

        return avatar_url

    def get_style_tags(self, obj):
        prefs = getattr(obj.user, 'preferences', None)
        return prefs.style_tags if prefs else []


class ItinerarySerializer(serializers.ModelSerializer):
    duration_days = serializers.SerializerMethodField()

    class Meta:
        model = Itinerary
        fields = [
            'id', 'destination_city', 'destination_country',
            'start_date', 'end_date', 'activities', 'flexible_dates',
            'duration_days', 'created_at',
        ]

    def get_duration_days(self, obj):
        return (obj.end_date - obj.start_date).days + 1


class AIItinerarySerializer(serializers.ModelSerializer):
    class Meta:
        model = AIItinerary
        fields = [
            'id', 'destination', 'days', 'min_budget', 'max_budget',
            'group_size', 'itinerary_data', 'is_public', 'created_at',
        ]


class TravelRequestSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    is_sender = serializers.SerializerMethodField()

    class Meta:
        model = TravelRequest
        fields = ['id', 'other_user', 'status', 'message', 'is_sender', 'created_at']

    def get_other_user(self, obj):
        perspective_user = self.context.get('perspective_user')
        is_sender = obj.sender_id == perspective_user.id
        other = obj.receiver if is_sender else obj.sender
        return serialize_profile(other)

    def get_is_sender(self, obj):
        perspective_user = self.context.get('perspective_user')
        return obj.sender_id == perspective_user.id


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'receiver', 'content', 'timestamp']


# ─── Helper functions that use the DRF serializers ───
# These maintain the same function signatures used throughout views.py
# so the refactor is seamless.

def serialize_profile(user):
    """Serialize a User into the profile dict via DRF serializer."""
    profile = getattr(user, 'profile', None)
    if profile is None:
        # Fallback for users without a profile
        return {
            'id': user.id,
            'username': user.username,
            'full_name': user.get_full_name() or user.username,
            'email': user.email,
            'avatar': f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.username}",
            'bio': '', 'home_city': '', 'age': None, 'gender': '',
            'pace': 'moderate', 'languages': [], 'style_tags': [],
            'onboarding_complete': False,
        }
    return UserProfileSerializer(profile).data


def serialize_itinerary(itin):
    """Serialize an Itinerary via DRF serializer."""
    return ItinerarySerializer(itin).data


def serialize_match(user, score, breakdown):
    """Serialize a match candidate — profile + score + breakdown + sample itineraries."""
    profile_data = serialize_profile(user)
    profile_data['match_score'] = score
    profile_data['breakdown'] = breakdown
    
    manual_itins = list(user.itineraries.all()[:3])
    ai_itins = list(user.ai_itineraries.filter(is_public=True)[:3])
    
    serialized_manual = ItinerarySerializer(manual_itins, many=True).data
    serialized_ai = AIItinerarySerializer(ai_itins, many=True).data
    
    combined = serialized_manual + serialized_ai
    profile_data['sample_itineraries'] = combined[:3]
    
    return profile_data


def serialize_travel_request(req, perspective_user):
    """Serialize a TravelRequest via DRF serializer."""
    return TravelRequestSerializer(req, context={'perspective_user': perspective_user}).data


def serialize_ai_itinerary(itin):
    """Serialize an AIItinerary via DRF serializer."""
    return AIItinerarySerializer(itin).data
