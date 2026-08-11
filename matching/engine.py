from datetime import date


def jaccard_index(set_a, set_b):
    if not set_a and not set_b:
        return 1.0
    union = set_a | set_b
    if not union:
        return 0.0
    return len(set_a & set_b) / len(union)


def preference_similarity(user_a, user_b):
    try:
        pref_a = user_a.preferences
    except Exception:
        return 0.0
    try:
        pref_b = user_b.preferences
    except Exception:
        return 0.0

    tags_a = set(pref_a.style_tags)
    tags_b = set(pref_b.style_tags)
    tag_score = jaccard_index(tags_a, tags_b)

    return tag_score


def itinerary_overlap(user_a, user_b):
    itins_a = list(user_a.itineraries.all())
    itins_b = list(user_b.itineraries.all())

    if not itins_a or not itins_b:
        return 0.0

    dest_a = set(f"{i.destination_city.lower()}|{i.destination_country.lower()}" for i in itins_a)
    dest_b = set(f"{i.destination_city.lower()}|{i.destination_country.lower()}" for i in itins_b)
    dest_score = jaccard_index(dest_a, dest_b)

    dates_a = set()
    for i in itins_a:
        dates_a |= i.date_range_set()
    dates_b = set()
    for i in itins_b:
        dates_b |= i.date_range_set()
    date_score = jaccard_index(dates_a, dates_b)

    acts_a = set()
    for i in itins_a:
        acts_a |= i.activities_set()
    acts_b = set()
    for i in itins_b:
        acts_b |= i.activities_set()
    activity_score = jaccard_index(acts_a, acts_b)

    return (dest_score * 0.4) + (date_score * 0.35) + (activity_score * 0.25)


def _shared_destinations(user_a, user_b):
    itins_a = list(user_a.itineraries.all())
    itins_b = list(user_b.itineraries.all())
    dest_a = set(f"{i.destination_city}|{i.destination_country}" for i in itins_a)
    dest_b = set(f"{i.destination_city}|{i.destination_country}" for i in itins_b)
    shared = dest_a & dest_b
    return [d.split('|')[0] for d in shared]


def _overlapping_dates_count(user_a, user_b):
    itins_a = list(user_a.itineraries.all())
    itins_b = list(user_b.itineraries.all())
    dates_a = set()
    for i in itins_a:
        dates_a |= i.date_range_set()
    dates_b = set()
    for i in itins_b:
        dates_b |= i.date_range_set()
    return len(dates_a & dates_b)


def _shared_activities(user_a, user_b):
    itins_a = list(user_a.itineraries.all())
    itins_b = list(user_b.itineraries.all())
    acts_a = set()
    for i in itins_a:
        acts_a |= i.activities_set()
    acts_b = set()
    for i in itins_b:
        acts_b |= i.activities_set()
    return list(acts_a & acts_b)


def _shared_styles(user_a, user_b):
    try:
        tags_a = set(user_a.preferences.style_tags)
        tags_b = set(user_b.preferences.style_tags)
        return list(tags_a & tags_b)
    except Exception:
        return []


def compute_match_score(user_a, user_b):
    pref_score = preference_similarity(user_a, user_b)
    itin_score = itinerary_overlap(user_a, user_b)
    composite = (pref_score * 0.4) + (itin_score * 0.6)
    percentage = round(composite * 100, 1)

    breakdown = {
        'preference_score': round(pref_score * 100, 1),
        'itinerary_score': round(itin_score * 100, 1),
        'shared_styles': _shared_styles(user_a, user_b),
        'shared_destinations': _shared_destinations(user_a, user_b),
        'overlapping_days': _overlapping_dates_count(user_a, user_b),
        'shared_activities': _shared_activities(user_a, user_b),
    }

    return percentage, breakdown


def get_ranked_matches(user, min_score=0):
    from django.contrib.auth.models import User
    candidates = User.objects.exclude(id=user.id).select_related(
        'profile', 'preferences'
    ).prefetch_related('itineraries')

    if hasattr(user, 'profile') and user.profile.home_city:
        candidates = candidates.filter(profile__home_city__iexact=user.profile.home_city)

    results = []
    for candidate in candidates:
        score, breakdown = compute_match_score(user, candidate)
        if score >= min_score:
            results.append((candidate, score, breakdown))

    results.sort(key=lambda x: x[1], reverse=True)
    return results
