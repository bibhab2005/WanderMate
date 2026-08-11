from django.contrib import admin
from .models import UserProfile, TravelPreference, Itinerary, TravelRequest


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'age', 'gender', 'pace', 'onboarding_complete', 'created_at')
    list_filter = ('pace', 'onboarding_complete', 'gender')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at',)


@admin.register(TravelPreference)
class TravelPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user',)
    search_fields = ('user__username',)


@admin.register(Itinerary)
class ItineraryAdmin(admin.ModelAdmin):
    list_display = ('user', 'destination_city', 'destination_country', 'start_date', 'end_date', 'flexible_dates')
    list_filter = ('flexible_dates', 'destination_country')
    search_fields = ('user__username', 'destination_city', 'destination_country')
    date_hierarchy = 'start_date'
    ordering = ('-created_at',)


@admin.register(TravelRequest)
class TravelRequestAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('sender__username', 'receiver__username')
    ordering = ('-created_at',)
