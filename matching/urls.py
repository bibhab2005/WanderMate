from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('auth/login/', views.auth_login, name='auth_login'),
    path('auth/signup/', views.auth_signup, name='auth_signup'),
    path('auth/logout/', views.auth_logout, name='auth_logout'),
    path('onboarding/', views.onboarding, name='onboarding'),
    path('onboarding/complete/', views.onboarding_complete, name='onboarding_complete'),
    path('api/onboarding/complete/', views.onboarding_complete, name='api_onboarding_complete'),
    path('dashboard/', views.dashboard_feed, name='dashboard_feed'),
    path('dashboard/profile/', views.profile_view, name='profile_view'),
    path('dashboard/itineraries/', views.itineraries_view, name='itineraries_view'),

    path('api/csrf/', views.api_csrf, name='api_csrf'),
    path('api/me/', views.api_me, name='api_me'),
    path('api/matches/', views.api_matches, name='api_matches'),
    path('api/matches/accepted/', views.api_accepted_matches, name='api_accepted_matches'),
    path('api/matches/<int:user_id>/', views.api_match_detail, name='api_match_detail'),
    path('api/profile/update/', views.profile_update, name='profile_update'),
    path('api/itineraries/', views.api_itineraries, name='api_itineraries'),
    path('api/itineraries/generate/', views.api_generate_itinerary, name='api_generate_itinerary'),
    path('api/itineraries/ai/', views.api_ai_itineraries_list, name='api_ai_itineraries_list'),
    path('api/itineraries/create/', views.api_itinerary_create, name='api_itinerary_create'),
    path('api/itineraries/<int:pk>/', views.api_itinerary_detail, name='api_itinerary_detail'),
    path('api/itineraries/ai/<int:pk>/toggle_privacy/', views.api_ai_itinerary_toggle_privacy, name='api_ai_itinerary_toggle_privacy'),
    path('api/requests/send/', views.api_travel_request_send, name='api_travel_request_send'),
    path('api/requests/<int:req_id>/respond/', views.api_travel_request_respond, name='api_travel_request_respond'),
    path('api/requests/', views.api_travel_requests, name='api_travel_requests'),
    path('api/requests/status/<int:user_id>/', views.api_request_status, name='api_request_status'),
    path('api/chat/<int:receiver_id>/', views.api_chat, name='api_chat'),
    path('api/account/delete/', views.api_delete_account, name='api_delete_account'),
]
