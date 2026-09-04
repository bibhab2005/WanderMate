import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from matching.models import UserProfile, TravelPreference, Itinerary


class Command(BaseCommand):
    help = 'Seed 100 distinct Indian user profiles across 100 cities with realistic travel preferences'

    def handle(self, *args, **kwargs):
        cities = [
            "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", 
            "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", 
            "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", 
            "Amritsar", "Allahabad", "Howrah", "Ranchi", "Gwalior", "Jabalpur", "Coimbatore", "Vijayawada", "Jodhpur", "Madurai", 
            "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Bareilly", "Moradabad", "Mysore", "Gurugram", "Aligarh", 
            "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem", "Warangal", "Thiruvananthapuram", "Bhiwandi", "Saharanpur", "Guntur", "Amravati", 
            "Bikaner", "Noida", "Jamshedpur", "Bhilai", "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", 
            "Durgapur", "Asansol", "Rourkela", "Nanded", "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar", "Ujjain", 
            "Siliguri", "Jhansi", "Ulhasnagar", "Jammu", "Mangalore", "Erode", "Belgaum", "Tirunelveli", "Malegaon", "Gaya", 
            "Jalgaon", "Udaipur", "Maheshtala", "Davanagere", "Kozhikode", "Akbarpur", "Kollam", "Bokaro", "South Dumdum", "Rajahmundry"
        ]

        destinations = [
            "Goa", "Manali", "Shillong", "Rishikesh", "Spiti Valley", "Tawang", "Darjeeling", "Hampi", "Munnar", "Jaisalmer",
            "Coorg", "Pondicherry", "Gokarna", "Varanasi", "Varkala", "Araku Valley", "Lachung", "Gulmarg", "Puri", "Bodh Gaya",
            "Udaipur", "Mussoorie", "Cherrapunji", "Chikmagalur", "Wayanad", "Netarhat", "Mirik", "Pachmarhi", "Kanha", "Ziro",
            "Loktak Lake", "Bastar", "Tadoba", "Pushkar", "Kodaikanal", "Mahabaleshwar", "Agra", "Simlipal", "Ujjayanta", "Khajuraho",
            "Ooty", "Jaipur", "Dharamshala", "Kovalam", "Kasol", "Chilika Lake", "Nainital", "Kinnaur", "Nubra Valley", "Leh"
        ]

        male_names = [
            "Aarav", "Vihaan", "Vivaan", "Advik", "Kabir", "Ansh", "Arjun", "Siddharth", "Rohan", "Rahul",
            "Amit", "Vikram", "Neeraj", "Manish", "Sunil", "Anil", "Karthik", "Sanjay", "Ajay", "Vijay",
            "Anand", "Ramesh", "Suresh", "Dinesh", "Mahesh", "Prakash", "Akash", "Vikas", "Manoj", "Ashok",
            "Rajesh", "Ravi", "Deepak", "Vishal", "Tarun", "Lokesh", "Yogesh", "Hitesh", "Rakesh", "Mukesh",
            "Nitesh", "Pradeep", "Sandeep", "Kuldeep", "Mandeep", "Gagandeep", "Amandeep", "Karan", "Yash", "Harsh"
        ]

        female_names = [
            "Priya", "Sneha", "Neha", "Pooja", "Anjali", "Riya", "Shruti", "Shreya", "Aditi", "Nidhi",
            "Swati", "Jyoti", "Aarti", "Kiran", "Poonam", "Rekha", "Rita", "Geeta", "Seema", "Meena",
            "Teena", "Reena", "Monika", "Sonika", "Deepika", "Priyanka", "Divya", "Kavya", "Navya", "Bhavya",
            "Ishita", "Nikita", "Ritika", "Kritika", "Malvika", "Devika", "Radhika", "Anushka", "Tanisha", "Manisha",
            "Nisha", "Trisha", "Alisha", "Esha", "Disha", "Aisha", "Myra", "Tara", "Sara", "Kiara"
        ]

        last_names = [
            "Sharma", "Singh", "Kumar", "Patel", "Gupta", "Das", "Reddy", "Rao", "Yadav", "Joshi",
            "Nair", "Menon", "Iyer", "Pillai", "Agarwal", "Jain", "Shah", "Mehta", "Desai", "Bhat",
            "Kadam", "Patil", "Deshmukh", "Pawar", "Chavan", "Jadhav", "Shinde", "More", "Mahajan", "Kulkarni",
            "Deshpande", "Tiwari", "Mishra", "Shukla", "Pandey", "Dubey", "Tripathi", "Chaturvedi", "Agnihotri", "Saxena",
            "Srivastava", "Mathur", "Bhatnagar", "Kapoor", "Chopra", "Malhotra", "Khanna", "Sehgal", "Ahuja", "Bansal"
        ]

        bios = [
            "Street food hunter and heritage walker.",
            "Nature enthusiast exploring trails.",
            "Avid foodie and culture hunter.",
            "Mountain addict and biker chasing high passes.",
            "Old architecture and street photography enthusiast.",
            "Software engineer by day, trekker on weekends.",
            "Backwaters and coastal wellness seeker.",
            "Desert camping, folk music, and palace trails.",
            "Trekker, coffee lover, and cycling enthusiast.",
            "Temple architecture and authentic cuisine.",
            "Backpacker exploring western ghats.",
            "Exploring historic alleys and traditional cuisines.",
            "Ocean lover, scuba diver, and sunset chaser.",
            "Hill drives, spicy seafood, and coastlines.",
            "Himalayan trekking and alpine camping.",
            "Snow lover, shikara rides, and photography.",
            "Temple trail explorer and coastal artisan lover.",
            "Spiritual heritage and museum hopping.",
            "Heritage palaces and weekend lake drives.",
            "Writer walking through mountain trails."
        ]

        tags_pool = ["Foodie", "Culture", "Photography", "Nightlife", "Beach", "Nature", "Adventure", "Mountains", "Backpacking", "Solo-traveler", "Wellness", "Family"]
        languages_pool = ["English", "Hindi", "Gujarati", "Marathi", "Bengali", "Tamil", "Telugu", "Kannada", "Malayalam", "Punjabi", "Odia", "Assamese"]
        pace_pool = ["relaxed", "moderate", "fast"]

        today = date.today()
        count = 0

        for i in range(100):
            is_male = i < 50
            first_name = male_names[i] if is_male else female_names[i - 50]
            last_name = random.choice(last_names)
            email = f"{first_name.lower()}.{last_name.lower()}{i}@example.com"
            age = random.randint(19, 45)
            gender = "Male" if is_male else "Female"
            city = cities[i]
            destination = random.choice(destinations)
            bio = random.choice(bios)
            pace = random.choice(pace_pool)
            
            tags = random.sample(tags_pool, random.randint(2, 4))
            languages = random.sample(languages_pool, random.randint(1, 3))
            if "English" not in languages:
                languages.append("English")

            avatar = f"https://api.dicebear.com/9.x/avataaars/svg?seed={first_name}{last_name}"

            user, created = User.objects.get_or_create(
                username=email,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email
                }
            )

            if created:
                user.set_password("password123")
                user.save()
            else:
                user.first_name = first_name
                user.last_name = last_name
                user.email = email
                user.save()

            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.age = age
            profile.gender = gender
            profile.bio = bio
            profile.home_city = city
            profile.pace = pace
            profile.languages = languages
            profile.onboarding_complete = True

            # Dynamic field fallback checks
            for pic_field in ['profile_picture_url', 'avatar', 'avatar_url', 'profile_picture', 'profile_pic']:
                if hasattr(profile, pic_field) and pic_field != 'avatar':
                    setattr(profile, pic_field, avatar)

            for loc_field in ['location', 'city', 'current_city']:
                if hasattr(profile, loc_field):
                    setattr(profile, loc_field, city)

            for dest_field in ['destination', 'target_destination', 'preferred_destination']:
                if hasattr(profile, dest_field):
                    setattr(profile, dest_field, destination)

            profile.save()

            prefs, _ = TravelPreference.objects.get_or_create(user=user)
            prefs.style_tags = tags
            if hasattr(prefs, 'travel_style_tags'):
                prefs.travel_style_tags = tags
            if hasattr(prefs, 'languages_spoken'):
                prefs.languages_spoken = languages

            for dest_field in ['destination', 'target_destination', 'preferred_destination']:
                if hasattr(prefs, dest_field):
                    setattr(prefs, dest_field, destination)

            for loc_field in ['location', 'city']:
                if hasattr(prefs, loc_field):
                    setattr(prefs, loc_field, city)

            prefs.save()

            # Create an active itinerary so user surfaces in destination/itinerary matching
            start_offset = random.randint(3, 45)
            trip_duration = random.randint(3, 7)
            start_date = today + timedelta(days=start_offset)
            end_date = start_date + timedelta(days=trip_duration)

            Itinerary.objects.get_or_create(
                user=user,
                destination_city=destination,
                defaults={
                    "destination_country": "India",
                    "start_date": start_date,
                    "end_date": end_date,
                    "activities": random.sample(tags_pool, 2),
                    "flexible_dates": random.choice([True, False]),
                }
            )

            count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {count} distinct user profiles across 100 cities.'))
