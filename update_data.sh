#!/bin/bash
# Script to update transaction data

# 1. Change to the analysis source directory and run the parser
echo "Running parser..."
cd analysis/src
python parse.py

# 2. Return to the project root
cd ../..

# 3. Deploy the latest data to the frontend
echo "Deploying data to frontend..."
cp dados/tudo.json frontends/web/src/data/expenses.json

echo "Update complete!"
