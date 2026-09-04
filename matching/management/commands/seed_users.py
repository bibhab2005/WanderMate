import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from matching.models import UserProfile, TravelPreference, Itinerary


class Command(BaseCommand):
    help = 'Seed 300 highly localized distinct Indian user profiles across regional clusters'

    def handle(self, *args, **kwargs):
        regions = [
            {
                "cities": ["Mumbai", "Pune", "Nagpur", "Nashik"],
                "male_names": ["Aarav", "Rohan", "Siddharth", "Yash", "Vishal", "Kedar", "Prasad", "Nikhil", "Omkar", "Sanket"],
                "female_names": ["Priya", "Aditi", "Neha", "Tanvi", "Shruti", "Pooja", "Aishwarya", "Rutuja", "Snehal", "Gargi"],
                "last_names": ["Deshmukh", "Joshi", "Kadam", "Patil", "Shinde", "Kulkarni", "Pawar", "Bhide", "Kale", "Gaikwad"],
                "languages": ["Marathi", "Hindi", "English"]
            },
            {
                "cities": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
                "male_names": ["Meet", "Parth", "Darshan", "Harsh", "Jay", "Vikram", "Gajendra", "Surya", "Rajendra", "Pratap"],
                "female_names": ["Dhara", "Bhoomi", "Aarohi", "Riddhi", "Pooja", "Padma", "Meera", "Kiran", "Geeta", "Jyoti"],
                "last_names": ["Patel", "Shah", "Mehta", "Desai", "Chauhan", "Rathore", "Rajput", "Shekhawat", "Jain", "Vyas"],
                "languages": ["Gujarati", "Hindi", "English", "Rajasthani"]
            },
            {
                "cities": ["Chennai", "Coimbatore", "Madurai", "Kochi", "Thiruvananthapuram"],
                "male_names": ["Karthik", "Arvind", "Siva", "Vignesh", "Ashwin", "Prithviraj", "Fahadh", "Dulquer", "Nivin", "Tovino"],
                "female_names": ["Nithya", "Kavitha", "Deepa", "Divya", "Swetha", "Anjali", "Parvathy", "Nayanthara", "Nazriya", "Keerthy"],
                "last_names": ["Iyer", "Pillai", "Natarajan", "Krishnan", "Rajan", "Nair", "Menon", "Kurian", "Varghese", "Thomas"],
                "languages": ["Tamil", "Malayalam", "English"]
            },
            {
                "cities": ["Bengaluru", "Mysore", "Mangalore", "Hyderabad", "Visakhapatnam"],
                "male_names": ["Arjun", "Darshan", "Puneeth", "Chetan", "Sudeep", "Ravi", "Tarun", "Nithin", "Ram", "Akhil"],
                "female_names": ["Ramya", "Kavya", "Rashmika", "Radhika", "Amulya", "Anushka", "Samantha", "Kajal", "Swathi", "Sindhu"],
                "last_names": ["Gowda", "Shetty", "Hegde", "Patil", "Bhat", "Reddy", "Rao", "Naidu", "Chowdary", "Varma"],
                "languages": ["Kannada", "Telugu", "English", "Hindi"]
            },
            {
                "cities": ["Kolkata", "Howrah", "Siliguri", "Bhubaneswar", "Cuttack"],
                "male_names": ["Bikash", "Soumya", "Abhishek", "Arijit", "Srijit", "Prosenjit", "Dev", "Jeet", "Parambrata", "Abir"],
                "female_names": ["Riya", "Mimi", "Nusrat", "Srabanti", "Koel", "Subhashree", "Paoli", "Rituparna", "Swastika", "Payel"],
                "last_names": ["Das", "Bose", "Ghosh", "Mukherjee", "Banerjee", "Chatterjee", "Sen", "Dutta", "Mohanty", "Patra"],
                "languages": ["Bengali", "Odia", "English", "Hindi"]
            },
            {
                "cities": ["Delhi", "Gurugram", "Chandigarh", "Ludhiana", "Amritsar"],
                "male_names": ["Kabir", "Virat", "Rohit", "Shikhar", "Gautam", "Gurpreet", "Harpreet", "Diljit", "Ammy", "Navjot"],
                "female_names": ["Sneha", "Kriti", "Taapsee", "Swara", "Sanya", "Neeru", "Sonam", "Sargun", "Bani", "Himanshi"],
                "last_names": ["Sharma", "Verma", "Arora", "Gupta", "Malhotra", "Singh", "Kaur", "Gill", "Sandhu", "Dhillon"],
                "languages": ["Hindi", "Punjabi", "English"]
            },
            {
                "cities": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Dehradun"],
                "male_names": ["Rahul", "Aman", "Rishabh", "Aryan", "Ishaan", "Dhruv", "Ayush", "Kunal", "Harshvardhan", "Rajat"],
                "female_names": ["Kiara", "Disha", "Tara", "Ananya", "Sara", "Janhvi", "Alia", "Bhawana", "Payal", "Anuradha"],
                "last_names": ["Singh", "Yadav", "Tiwari", "Mishra", "Pandey", "Dixit", "Kapoor", "Srivastava", "Awasthi", "Dubey"],
                "languages": ["Hindi", "English", "Urdu"]
            },
            {
                "cities": ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Raipur"],
                "male_names": ["Manish", "Sunil", "Anil", "Sanjay", "Ajay", "Vijay", "Anand", "Ramesh", "Suresh", "Dinesh"],
                "female_names": ["Kiran", "Poonam", "Rekha", "Rita", "Geeta", "Seema", "Meena", "Teena", "Reena", "Monika"],
                "last_names": ["Sharma", "Verma", "Jain", "Soni", "Vyas", "Gupta", "Agarwal", "Bansal", "Choubey", "Bhargava"],
                "languages": ["Hindi", "English"]
            },
            {
                "cities": ["Patna", "Gaya", "Ranchi", "Jamshedpur", "Dhanbad"],
                "male_names": ["Shatrughan", "Manoj", "Ravi", "Prakash", "Nitish", "Tejashwi", "Chirag", "Pawan", "Khesari", "Dinesh"],
                "female_names": ["Sonakshi", "Neha", "Sharda", "Poonam", "Richa", "Swati", "Amrita", "Ranjana", "Nandini", "Shilpa"],
                "last_names": ["Sinha", "Yadav", "Paswan", "Kumar", "Singh", "Thakur", "Mishra", "Pandey", "Choudhary", "Jha"],
                "languages": ["Hindi", "Bhojpuri", "Maithili", "English"]
            },
            {
                "cities": ["Guwahati", "Dibrugarh", "Shillong", "Imphal", "Agartala", "Gangtok", "Itanagar", "Aizawl", "Kohima", "Dimapur"],
                "male_names": ["Jubin", "Zubeen", "Papon", "Tenzin", "Karma", "Lal", "Zoram", "Bhaichung", "Neiphiu", "Kiren"],
                "female_names": ["Megha", "Barsha", "Pema", "Mary", "Lin", "Deki", "Bala", "Mimi", "Kimi", "Rosy"],
                "last_names": ["Boruah", "Gogoi", "Saikia", "Sangma", "Lyngdoh", "Dorjee", "Bhutia", "Kom", "Jamir", "Lal"],
                "languages": ["Assamese", "Khasi", "Mizo", "Manipuri", "Nepali", "English"]
            }
        ]

        destinations = [
            "Goa", "Manali", "Shillong", "Rishikesh", "Spiti Valley", "Tawang", "Darjeeling", "Hampi", "Munnar", "Jaisalmer",
            "Coorg", "Pondicherry", "Gokarna", "Varanasi", "Varkala", "Araku Valley", "Lachung", "Gulmarg", "Puri", "Bodh Gaya",
            "Udaipur", "Mussoorie", "Cherrapunji", "Chikmagalur", "Wayanad", "Netarhat", "Mirik", "Pachmarhi", "Kanha", "Ziro",
            "Loktak Lake", "Bastar", "Tadoba", "Pushkar", "Kodaikanal", "Mahabaleshwar", "Agra", "Simlipal", "Ujjayanta", "Khajuraho",
            "Ooty", "Jaipur", "Dharamshala", "Kovalam", "Kasol", "Chilika Lake", "Nainital", "Kinnaur", "Nubra Valley", "Leh"
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

        tags_pool = ["Foodie", "Culture", "Photography", "Nightlife", "Beach", "Nature", "Adventure", "Mountains", "Backpacking", "Solo-traveler", "Wellness", "Family", "Road-trip", "Luxury", "Budget"]
        pace_pool = ["relaxed", "moderate", "fast"]

        # Clear existing dummy example.com users first for a clean re-seed
        deleted_count, _ = User.objects.filter(email__endswith='@example.com').delete()
        if deleted_count > 0:
            self.stdout.write(f"Cleared {deleted_count} previous test account objects.")

        default_password_hash = make_password("password123")
        today = date.today()
        count = 0
        total_needed = 300

        while count < total_needed:
            region = random.choice(regions)
            is_male = count % 2 == 0
            first_name = random.choice(region["male_names"]) if is_male else random.choice(region["female_names"])
            last_name = random.choice(region["last_names"])
            
            if last_name == "Kaur" and is_male:
                last_name = "Singh"
            elif last_name == "Singh" and not is_male and "Kaur" in region["last_names"]:
                last_name = "Kaur"

            email = f"{first_name.lower()}.{last_name.lower()}{count+1}@example.com"
            age = random.randint(18, 55)
            gender = "Male" if is_male else "Female"
            city = random.choice(region["cities"])
            destination = random.choice(destinations)
            bio = random.choice(bios)
            pace = random.choice(pace_pool)
            
            tags = random.sample(tags_pool, random.randint(3, 5))
            languages = random.sample(region["languages"], random.randint(1, len(region["languages"])))
            if "English" not in languages:
                languages.append("English")

            avatar = f"https://api.dicebear.com/9.x/avataaars/svg?seed={first_name}{last_name}{count}"

            user, created = User.objects.get_or_create(
                username=email,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "password": default_password_hash,
                }
            )

            if not created:
                user.first_name = first_name
                user.last_name = last_name
                user.email = email
                user.password = default_password_hash
                user.save()

            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.age = age
            profile.gender = gender
            profile.bio = bio
            profile.home_city = city
            profile.pace = pace
            profile.languages = languages
            profile.onboarding_complete = True

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

            # Active Itinerary for matching
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

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {count} highly localized distinct user profiles across India.'))
