#!/bin/bash

BASE_URL="http://localhost:3001/api/v1"

echo "========================================="
echo "Testing All Assessment Endpoints"
echo "========================================="
echo ""

# Test 1: Get Quota
echo "1. Testing GET /assessments/quota"
echo "-----------------------------------"
curl -s -X GET "$BASE_URL/assessments/quota" | jq '.'
echo ""
echo ""

# Test 2: Get History
echo "2. Testing GET /assessments/history"
echo "-----------------------------------"
curl -s -X GET "$BASE_URL/assessments/history" | jq '.'
echo ""
echo ""

# Test 3: Generate Quiz (this might take a while)
echo "3. Testing POST /assessments/generate"
echo "-----------------------------------"
echo "Generating quiz... (this may take 10-30 seconds)"
QUIZ_RESPONSE=$(curl -s -X POST "$BASE_URL/assessments/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Clarity smart contracts",
    "format": "multi_choice",
    "includeAdvanced": false
  }')

echo "$QUIZ_RESPONSE" | jq '.'

# Extract quiz ID for next test
QUIZ_ID=$(echo "$QUIZ_RESPONSE" | jq -r '.data.id // empty')
echo ""
echo ""

# Test 4: Submit Answers (only if quiz was generated)
if [ -n "$QUIZ_ID" ]; then
  echo "4. Testing POST /assessments/$QUIZ_ID/submit"
  echo "-----------------------------------"
  
  # Get the first question's correct answer
  FIRST_QUESTION_ID=$(echo "$QUIZ_RESPONSE" | jq -r '.data.questions[0].id')
  CORRECT_OPTION=$(echo "$QUIZ_RESPONSE" | jq -r '.data.questions[0].correctOptionId')
  
  curl -s -X POST "$BASE_URL/assessments/$QUIZ_ID/submit" \
    -H "Content-Type: application/json" \
    -d "{
      \"answers\": {
        \"$FIRST_QUESTION_ID\": \"$CORRECT_OPTION\"
      }
    }" | jq '.'
  echo ""
else
  echo "4. Skipping submit test (no quiz ID)"
  echo "-----------------------------------"
  echo "Quiz generation failed, cannot test submit endpoint"
  echo ""
fi

echo ""
echo "========================================="
echo "All Tests Complete"
echo "========================================="
