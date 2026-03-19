#!/bin/bash

# Quick script to unlock Module 2 (Introduction to Stacks)
# by completing all steps in Module 1 (Bitcoin Fundamentals)

# Configuration
API_URL="http://localhost:3001/api/v1"
TOKEN="${1:-YOUR_TOKEN_HERE}"

if [ "$TOKEN" = "YOUR_TOKEN_HERE" ]; then
  echo "❌ Error: Please provide your auth token"
  echo "Usage: ./unlock-module-2.sh YOUR_AUTH_TOKEN"
  exit 1
fi

echo "🔓 Unlocking Module 2: Introduction to Stacks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Completing Module 1: Bitcoin Fundamentals..."
echo ""

# Module 1: Bitcoin Fundamentals
# Lesson 1: Bitcoin 101 (2 steps)
echo "📚 Lesson 1: Bitcoin 101"
curl -s -X POST "$API_URL/courses/1/lessons/1/steps/1/complete" \
  -H "Authorization: Bearer $TOKEN" > /dev/null && echo "  ✓ Step 1: What is Bitcoin?"
curl -s -X POST "$API_URL/courses/1/lessons/1/steps/2/complete" \
  -H "Authorization: Bearer $TOKEN" > /dev/null && echo "  ✓ Step 2: History"

# Lesson 2: The Bitcoin Network (2 steps)
echo "📚 Lesson 2: The Bitcoin Network"
curl -s -X POST "$API_URL/courses/1/lessons/2/steps/1/complete" \
  -H "Authorization: Bearer $TOKEN" > /dev/null && echo "  ✓ Step 1: Nodes"
curl -s -X POST "$API_URL/courses/1/lessons/2/steps/2/complete" \
  -H "Authorization: Bearer $TOKEN" > /dev/null && echo "  ✓ Step 2: Miners"

# Lesson 3: Proof of Work (1 step)
echo "📚 Lesson 3: Proof of Work"
curl -s -X POST "$API_URL/courses/1/lessons/3/steps/1/complete" \
  -H "Authorization: Bearer $TOKEN" > /dev/null && echo "  ✓ Step 1: PoW Explained"

# Lesson 4: Wallets & Nodes (1 step)
echo "📚 Lesson 4: Wallets & Nodes"
curl -s -X POST "$API_URL/courses/1/lessons/4/steps/1/complete" \
  -H "Authorization: Bearer $TOKEN" > /dev/null && echo "  ✓ Step 1: Key Management"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check progress
echo ""
echo "Checking progress..."
PROGRESS=$(curl -s "$API_URL/courses/1/progress" \
  -H "Authorization: Bearer $TOKEN")

PERCENTAGE=$(echo $PROGRESS | grep -o '"progressPercentage":[0-9]*' | grep -o '[0-9]*')

if [ "$PERCENTAGE" = "100" ]; then
  echo "✅ Module 1 Complete: 100%"
  echo ""
  echo "🎉 Module 2 (Introduction to Stacks) is now UNLOCKED!"
  echo ""
  echo "Refresh your Learning Path page to see the changes."
else
  echo "⚠️  Progress: $PERCENTAGE%"
  echo "Something went wrong. Please check the API response."
fi
