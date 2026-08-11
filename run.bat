@echo off
echo ==============================================
echo WanderMate - Application Starter
echo ==============================================
echo.

echo Starting the Django Backend Server...
start cmd /k "python manage.py runserver"

echo Starting the React Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo ==============================================
echo Success! Both servers are starting up.
echo ==============================================
echo You will see two new terminal windows open. 
echo Leave them open while you use WanderMate!
echo.
echo Once they finish loading, open your browser and go to:
echo http://localhost:5174
echo.
pause
