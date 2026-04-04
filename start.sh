#!/bin/bash
echo "==================================================="
echo "    Starting TypeRunner Server (Docker)..."
echo "==================================================="
echo ""
echo "Make sure Docker daemon is running!"
echo ""

docker-compose down
docker-compose up --build -d

echo ""
echo "Waiting for frontend to be ready..."
sleep 5

# Try to open browser based on OS
if which xdg-open > /dev/null; then
  xdg-open http://localhost:5173
elif which gnome-open > /dev/null; then
  gnome-open http://localhost:5173
elif which open > /dev/null; then
  open http://localhost:5173
fi

echo ""
echo "TypeRunner is successfully running in the background!"
echo "To view logs, run: docker-compose logs -f"
echo "To stop, run: docker-compose down"
