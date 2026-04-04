@echo off
echo ===================================================
echo     Starting TypeRunner Server (Docker)...
echo ===================================================
echo.
echo Make sure Docker Desktop is running!
echo.
docker-compose down
docker-compose up --build -d
echo.
echo Waiting for frontend to be ready...
timeout /t 5 /nobreak > NUL
start http://localhost:5173
echo.
echo TypeRunner is successfully running in the background!
echo To view logs, run: docker-compose logs -f
echo To stop, run: docker-compose down
pause
