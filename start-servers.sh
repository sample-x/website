#!/bin/bash

# Kill any existing processes on ports 3000 and 3001
echo "Stopping any existing servers..."
kill $(lsof -t -i:3000) 2>/dev/null || true
kill $(lsof -t -i:3001) 2>/dev/null || true
sleep 1

# Start backend server
echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Start frontend server
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Both servers are running."
echo "Backend server running on http://localhost:3001"
echo "Frontend server running on http://localhost:3000"
echo "Press Ctrl+C to stop both servers."

# Handle graceful shutdown
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
