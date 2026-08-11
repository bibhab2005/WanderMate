# WanderMate: Final Year Project Documentation

## 1. Project Overview
**WanderMate** is a smart travel website built to solve two main problems: planning trips and finding travel partners. 
First, it uses Artificial Intelligence (AI) to automatically create detailed, day-by-day travel plans for users. Second, it works as a matching platform that connects people who have similar travel interests. 

The website is divided into two separate parts that talk to each other: a **Frontend** (the visual part the user sees) and a **Backend** (the brain that handles data and AI).

---

## 1.5 Technical Architecture Summary

### Core Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS v4
- **Backend**: Python, Django, Django REST Framework (DRF)
- **Database**: SQLite (Development)

### AI & Third-Party Integrations
- **LLM / Itinerary Generation**: Google Gemini 2.5 Flash API (via `google-generativeai` Python SDK)
- **Dynamic Imagery**: Pollinations AI (zero-cost, API-keyless dynamic generation of destination-specific landscape images on the frontend)
- **PDF Export Engine**: Native Browser Print API (Utilizing `@media print` and Tailwind `print:` modifiers for robust, zero-dependency PDF rendering)

### Core Workflows (AI Travel Planner)
1. **Request**: Users request an itinerary specifying destination, duration, budget, and group size on the React frontend.
2. **Processing**: The Django backend receives the request and securely interfaces with the Gemini 2.5 Flash model using a highly tuned prompt.
3. **Data Structuring**: Gemini returns a strictly structured JSON response detailing day-by-day activities, time slots (Morning, Afternoon, Evening), and estimated costs.
4. **Persistence**: Django saves the generated itinerary as an `AIItinerary` model attached to the user's profile. An `is_public` boolean (defaulting to False) dictates whether this trip is shared with the matchmaking engine or kept private.
5. **Presentation**: The frontend renders the data in a responsive card layout. Cards dynamically fetch stunning background images from Pollinations AI based on the destination name.
6. **Export**: Users can export the generated itineraries to PDF seamlessly using native browser printing, which strips out UI clutter via Tailwind print modifiers.

---

## 2. Frontend Technologies (The User Interface)
The frontend is what the user interacts with. It is built to be very fast and easy to use.

### React.js
React is a popular tool created by Facebook to build websites.
*   **Components**: Instead of building one giant webpage, we built the website using small, reusable pieces called components (like a Lego set). For example, the Navigation Bar, the Sidebar, and the Travel Cards are all separate components.
*   **Fast Updates**: React is smart. When a user clicks a button, React only updates that small part of the screen instantly, without reloading the whole webpage.

### Vite (The Engine)
Vite is the tool that runs our React code. 
*   **Speed**: Older tools took a long time to load changes while programming. Vite is extremely fast, meaning any code we change shows up in the browser instantly.

### Tailwind CSS v4
Tailwind is a tool used to style the website (colors, spacing, sizes).
*   **Easy Styling**: Instead of writing long, separate CSS files, we use simple keywords directly in the HTML (like `bg-blue-500` for a blue background). This makes designing the website much faster and ensures it looks good on both mobile phones and laptops.

### Additional Frontend Libraries
*   **React Router DOM**: This turns our website into a "Single Page Application." When a user clicks between pages (like going from the Dashboard to the Itineraries), the page doesn't actually reload; React Router just instantly swaps out the content, making the website feel as fast as a mobile app.
*   **Framer Motion**: Used to create the smooth, professional animations and transitions seen on the Landing page.

### Native PDF Print Engine
We added a feature where users can download their travel plans as a PDF.
*   **How it works**: Instead of using heavy, buggy plugins to create the PDF, we use the web browser's built-in printing tool. We wrote special CSS code so that when the user clicks "Download PDF," the website hides the navigation bars and only prints the clean travel plan.

---

## 3. Backend Technologies (The Brain)
The backend runs on the server. It handles the logic, talks to the database, and processes the AI requests.

### Python & Django
Django is a powerful web framework written in Python.
*   **Security and Structure**: Django provides built-in tools for secure user login, password protection, and managing user accounts. It also keeps our code organized.
*   **API (Application Programming Interface)**: Since our frontend and backend are separate, they need a way to talk. We used **Django REST Framework** to build an API. This means the Django backend just sends raw data (in a format called JSON) to the React frontend, and React decides how to draw it on the screen.

---

## 4. Database Technology (Data Storage)
The database is where we store all the information permanently.

### SQLite
*   **Lightweight Storage**: For this project, we used SQLite. It is a lightweight, built-in database that doesn't require a separate server to run. It perfectly stores everything we need: user profiles, travel preferences, generated itineraries, and matched connections.

---

## 5. AI & Machine Learning Features
This is the smartest part of the project, which handles the travel planning and user matching.

### Google Gemini 2.5 AI
We connected our website to Google's powerful Gemini AI to act as a virtual travel agent.
*   **How it works**: When a user asks for a 3-day trip to Goa with a budget of ₹10,000, our backend sends this exact prompt to the Google Gemini API. 
*   **Structured Output**: We programmed the AI to send the answer back in a strict, organized format (JSON) so our website can easily read it and display it as beautiful day-by-day travel cards. Users can even chat with the AI on the website to refine the plan!

### Pollinations AI (Dynamic Images)
*   **Smart Pictures**: Instead of having boring, text-only travel cards, we use Pollinations AI. We send the name of the destination (e.g., "Paris") to their system, and it instantly generates a beautiful, relevant background picture for that specific travel card on the website.

### Jaccard Similarity Algorithm (User Matching)
*   **Finding Travel Buddies**: To match users, we wrote an algorithm based on mathematical "Jaccard Similarity." It looks at the travel tags (like "Mountains," "Luxury," "Backpacker") chosen by User A and User B. It calculates exactly how many tags they have in common and gives them a Match Percentage. If the percentage is high, they are recommended to each other on the dashboard.

---

## 6. Complete Working of the Website (Step-by-Step)

1. **Sign Up & Onboarding**: A new user creates an account securely. They are then taken to an onboarding screen where they select their travel preferences and interests. This data is saved in the SQLite Database.
2. **The Dashboard (Matching)**: The user logs in and sees their Dashboard. The backend quickly runs the Jaccard Similarity algorithm against all other users in the database and shows the user their top matching travel partners.
3. **AI Travel Planning**: The user goes to the "Itineraries" page. They fill out a form with their destination, budget, and days. The React frontend sends this to Django. Django talks to the Google Gemini AI, gets the travel plan, saves it to the database, and sends it back to the screen.
4. **Refining & Exporting**: The user can now see their beautiful travel plan (with AI-generated pictures). The UI features a chat box where users can type modifications; currently, this chat interface is a frontend mock preparing for the final phase of Gemini API integration where the AI will actively rewrite the saved JSON plan based on chat commands. Finally, the user can click "Download PDF" to export the plan and take it offline for their trip.
