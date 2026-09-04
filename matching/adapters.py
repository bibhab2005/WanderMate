from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.core.exceptions import ImmediateHttpResponse
from django.shortcuts import redirect
from .models import UserProfile, TravelPreference


class CustomAccountAdapter(DefaultAccountAdapter):
    """Custom account adapter to route users based on onboarding completion status."""
    def get_login_redirect_url(self, request):
        user = request.user
        if user and user.is_authenticated:
            try:
                if not user.profile.onboarding_complete:
                    return 'http://localhost:5174/onboarding'
            except Exception:
                pass
        return 'http://localhost:5174/dashboard'

    def get_signup_redirect_url(self, request):
        return 'http://localhost:5174/onboarding'

    def add_message(self, request, level, message_template=None, message_context=None, extra_tags='', message=None):
        # Suppress Django flash messages to prevent stale messages accumulating in the session
        pass


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """Custom social account adapter to sync Google profile details and route appropriately."""
    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        extra = sociallogin.account.extra_data or {}

        # Ensure first_name and last_name are populated from Google details
        if not user.first_name and not user.last_name:
            name = (extra.get('name') or data.get('name') or '').strip()
            given = (extra.get('given_name') or data.get('first_name') or '').strip()
            family = (extra.get('family_name') or data.get('last_name') or '').strip()
            if given or family:
                user.first_name = given
                user.last_name = family
            elif name:
                parts = name.split(' ', 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ''

        if not user.email and extra.get('email'):
            user.email = extra.get('email')

        return user

    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form=form)
        UserProfile.objects.get_or_create(user=user)
        TravelPreference.objects.get_or_create(user=user)
        return user

    def pre_social_login(self, request, sociallogin):
        user = sociallogin.user
        if user and user.pk:
            extra = sociallogin.account.extra_data or {}
            updated = []
            if not user.first_name and not user.last_name:
                name = (extra.get('name') or '').strip()
                given = (extra.get('given_name') or '').strip()
                family = (extra.get('family_name') or '').strip()
                if given or family:
                    user.first_name = given
                    user.last_name = family
                    updated.extend(['first_name', 'last_name'])
                elif name:
                    parts = name.split(' ', 1)
                    user.first_name = parts[0]
                    user.last_name = parts[1] if len(parts) > 1 else ''
                    updated.extend(['first_name', 'last_name'])
            if not user.email and extra.get('email'):
                user.email = extra.get('email')
                updated.append('email')
            if updated:
                user.save(update_fields=updated)

    def on_authentication_error(self, request, provider, error=None, exception=None, extra_context=None):
        """
        Handle errors during social login (e.g. state replay, expired session, user browser back button).
        Never strand the user on a raw Django 401 'Third-Party Login Failure' page.
        """
        from django.contrib.messages import get_messages
        # Consume any accumulated messages
        list(get_messages(request))

        # If the user is already authenticated (e.g. hit back button after successful login), redirect them into the app!
        if request.user and request.user.is_authenticated:
            try:
                if not request.user.profile.onboarding_complete:
                    raise ImmediateHttpResponse(redirect('http://localhost:5174/onboarding'))
            except Exception:
                pass
            raise ImmediateHttpResponse(redirect('http://localhost:5174/dashboard'))

        # If unauthenticated, redirect gracefully back to the React login page
        raise ImmediateHttpResponse(redirect('http://localhost:5174/login?error=oauth_failed'))

