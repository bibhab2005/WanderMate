from django.db import models
from django.contrib.auth.models import User


PACE_CHOICES = [
    ('relaxed', 'Relaxed'),
    ('moderate', 'Moderate'),
    ('fast', 'Fast-paced'),
]


STYLE_TAGS = [
    ('backpacking', 'Backpacking'),
    ('foodie', 'Foodie'),
    ('nature', 'Nature'),
    ('nightlife', 'Nightlife'),
    ('culture', 'Culture'),
    ('adventure', 'Adventure'),
    ('wellness', 'Wellness'),
    ('photography', 'Photography'),
    ('solo', 'Solo-traveler'),
    ('family', 'Family'),
    ('beach', 'Beach'),
    ('mountains', 'Mountains'),
]

REQUEST_STATUS = [
    ('pending', 'Pending'),
    ('accepted', 'Accepted'),
    ('declined', 'Declined'),
]


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, default='')
    age = models.PositiveIntegerField(blank=True, null=True)
    gender = models.CharField(max_length=30, blank=True, default='')
    home_city = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    pace = models.CharField(max_length=20, choices=PACE_CHOICES, default='moderate')
    languages = models.JSONField(default=list)
    onboarding_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}"

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]


class TravelPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    style_tags = models.JSONField(default=list)

    def __str__(self):
        return f"Prefs({self.user.username})"

    def style_set(self):
        return set(self.style_tags)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]


class Itinerary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='itineraries')
    destination_city = models.CharField(max_length=100)
    destination_country = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    activities = models.JSONField(default=list)
    flexible_dates = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.destination_city} ({self.user.username})"

    def date_range_set(self):
        from datetime import timedelta
        dates = set()
        current = self.start_date
        while current <= self.end_date:
            dates.add(current.isoformat())
            current += timedelta(days=1)
        return dates

    def activities_set(self):
        return set(a.lower().strip() for a in self.activities if a)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['destination_city']),
        ]
        ordering = ['-created_at']


class TravelRequest(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    status = models.CharField(max_length=20, choices=REQUEST_STATUS, default='pending')
    message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} [{self.status}]"

    class Meta:
        unique_together = ('sender', 'receiver')
        indexes = [
            models.Index(fields=['sender']),
            models.Index(fields=['receiver']),
            models.Index(fields=['status']),
        ]


class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender.username} to {self.receiver.username}"

class AIItinerary(models.Model):
    GROUP_CHOICES = [
        ('Solo', 'Solo Backpacker'),
        ('Couple', 'Couple'),
        ('Small Group', 'Small Group (3-5)'),
        ('Event Squad', 'Event Squad (6+)')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_itineraries')
    destination = models.CharField(max_length=255, db_index=True)
    days = models.PositiveIntegerField(default=1)
    min_budget = models.PositiveIntegerField(null=True, blank=True)
    max_budget = models.PositiveIntegerField(null=True, blank=True)
    group_size = models.CharField(max_length=50, choices=GROUP_CHOICES, default='Solo')
    applied_travel_styles = models.JSONField(default=list, blank=True)
    itinerary_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} -> {self.destination} ({self.days} days)"
