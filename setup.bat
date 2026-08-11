@echo off
echo ==============================================
echo WanderMate - Automatic Setup Script
echo ==============================================
echo.

echo [1/3] Installing Backend Dependencies...
pip install -r requirements.txt

echo.
echo [2/3] Setting up the Local Database...
python manage.py migrate

echo.
echo [3/3] Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo ==============================================
echo Setup Complete!
echo ==============================================
echo Please make sure you have created a '.env' file in this folder
echo and added your GEMINI_API_KEY like this:
echo GEMINI_API_KEY=your_key_here
echo.
echo To start the website, open two separate terminal windows:
echo Terminal 1: python manage.py runserver
echo Terminal 2: cd frontend ^&^& npm run dev
echo.
pause
