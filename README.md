# WanderMate

WanderMate is an AI-powered travel planning and companion matching platform. It generates day-by-day itineraries using Google Gemini AI and connects travelers with similar interests using a Jaccard Similarity matching algorithm.

## 🚀 Quick Setup for Teammates

To make setting up the project as simple as possible, just follow these steps:

### Step 1: Initial Setup (Run Once)
1. Download or clone this repository to your computer.
2. Double-click the **`setup.bat`** file in this folder. It will automatically install all Python and React dependencies, and initialize the database.
3. Open the folder and create a new file named exactly `.env`. Inside it, paste the following line with your key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

### Step 2: Running the Website
1. Double-click the **`run.bat`** file.
2. It will automatically pop open two command prompt windows (one for the backend and one for the frontend). **Leave them open!**
3. Open your browser and go to `http://localhost:5174`.
