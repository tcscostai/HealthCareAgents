#!/bin/bash
# Project folder name ends with a space — use quotes.
cd "$(dirname "$0")"
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi
echo ""
echo "Starting dev server..."
echo "Open the URL shown below (usually http://localhost:5173)"
echo ""
npm run dev
