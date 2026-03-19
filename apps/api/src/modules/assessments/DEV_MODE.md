# Development Mode for Assessments

## Overview

The assessments module includes a development mode that makes testing quizzes easier by ensuring all correct answers are option 'A'.

## How It Works

### Automatic Detection

The system checks the `NODE_ENV` environment variable:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
```

### Behavior by Environment

#### Development Mode (`NODE_ENV=development`)
- ✅ All multiple-choice correct answers are set to option 'A'
- ✅ Makes testing faster - just select 'A' for all questions
- ✅ Logs: "DEV MODE: Setting all correct answers to option A"
- ✅ **Logs all correct answers to terminal after quiz generation**
- ✅ Shows question text, correct option, and all choices
- ✅ Perfect scores guaranteed for testing XP rewards

#### Production Mode (`NODE_ENV=production`)
- ✅ Correct answers are randomly shuffled across all options (a, b, c, d)
- ✅ Uses Fisher-Yates shuffle algorithm for true randomization
- ✅ Prevents answer pattern exploitation

## Configuration

### Current Setup

Check your `.env` file:

```bash
NODE_ENV=development  # Dev mode enabled
```

### Switching Modes

**Enable Dev Mode:**
```bash
NODE_ENV=development
```

**Disable Dev Mode (Production):**
```bash
NODE_ENV=production
```

**Test Environment:**
```bash
NODE_ENV=test
```

## Testing Examples

### Development Mode Test

1. Start server with `NODE_ENV=development`
2. Generate any quiz
3. Select option 'A' for all multiple-choice questions
4. Submit answers
5. Result: 100% score (250 XP)

```bash
# Quick test
curl -X POST http://localhost:3001/api/v1/assessments/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Stacks Blockchain",
    "format": "multi_choice"
  }'

# All correct answers will be 'a'
```

### Production Mode Test

1. Set `NODE_ENV=production`
2. Restart server
3. Generate quiz
4. Correct answers will be randomly distributed

## Use Cases

### When to Use Dev Mode

✅ **Testing XP rewards**
- Quickly earn perfect scores to test XP calculations
- Verify level-up logic
- Test streak tracking

✅ **Frontend development**
- Test quiz UI without worrying about correct answers
- Verify result display components
- Test grading feedback UI

✅ **Integration testing**
- Automated tests that need predictable results
- E2E tests for quiz flow
- API endpoint testing

✅ **Demo purposes**
- Show perfect quiz completion
- Demonstrate XP system
- Present to stakeholders

### When to Use Production Mode

✅ **Real user testing**
- Actual learning assessment
- Leaderboard competition
- User acceptance testing

✅ **Staging environment**
- Pre-production validation
- QA testing
- Performance testing

## Implementation Details

### Code Location

File: `server/apps/api/src/modules/assessments/generators/quiz-generator.service.ts`

Method: `shuffleMultipleChoiceOptions()`

### Logic Flow

```typescript
private shuffleMultipleChoiceOptions(questions: Question[]): Question[] {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // Find correct option
    // Move it to position 'a'
    // Reorder other options to b, c, d
    return questionsWithCorrectAsA;
  }
  
  // Production: Fisher-Yates shuffle
  // Randomly distribute correct answer
  return shuffledQuestions;
}
```

### Logging

Development mode logs to console:

```
[QuizGeneratorService] DEV MODE: Setting all correct answers to option A
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 DEV MODE: Quiz Answers for "Introduction to Stacks"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q1 [Multiple Choice]: What is the primary purpose of Stacks blockchain?...
   ✅ Correct Answer: A
   ✅ A. Enable smart contracts on Bitcoin...
      B. Replace Bitcoin as a cryptocurrency...
      C. Create a new proof-of-work chain...
      D. Compete with Ethereum...

Q2 [Multiple Choice]: What consensus mechanism does Stacks use?...
   ✅ Correct Answer: A
   ✅ A. Proof of Transfer (PoX)...
      B. Proof of Work...
      C. Proof of Stake...
      D. Delegated Proof of Stake...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 TIP: In dev mode, all multiple-choice answers are option A
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

This helps you:
- Verify quiz generation is working
- See all questions and options at a glance
- Quickly check answer correctness
- Debug quiz content issues

## Security Notes

⚠️ **Important**: Never deploy with `NODE_ENV=development` to production!

### Checklist Before Deployment

- [ ] Set `NODE_ENV=production` in production environment
- [ ] Verify environment variables in deployment config
- [ ] Test that answers are randomized in staging
- [ ] Check logs don't show "DEV MODE" messages
- [ ] Run production build with correct env

### Environment Variable Priority

1. `.env.production` (if exists)
2. `.env.local` (if exists)
3. `.env`
4. System environment variables

## Troubleshooting

### Dev Mode Not Working

**Problem**: Answers still randomized in development

**Solutions**:
1. Check `.env` file: `NODE_ENV=development`
2. Restart the server after changing `.env`
3. Clear any cached environment variables
4. Check logs for "DEV MODE" message

```bash
# Verify environment
npm run start:dev

# Check logs
tail -f logs/app.log | grep "DEV MODE"
```

### Accidentally in Dev Mode in Production

**Problem**: Production shows all answers as 'A'

**Immediate Fix**:
```bash
# Update environment
export NODE_ENV=production

# Restart server
pm2 restart stacks-academy-api

# Verify
curl http://your-api/health | grep environment
```

## Testing Script

Create a test script to verify dev mode:

```bash
#!/bin/bash
# test-dev-mode.sh

echo "Testing Development Mode..."

# Generate quiz
QUIZ_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/assessments/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic":"Test","format":"multi_choice"}')

QUIZ_ID=$(echo $QUIZ_RESPONSE | jq -r '.id')

# Submit all 'a' answers
SUBMIT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/assessments/$QUIZ_ID/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers":{"q1":"a","q2":"a","q3":"a","q4":"a","q5":"a"}}')

SCORE=$(echo $SUBMIT_RESPONSE | jq -r '.score')

if [ "$SCORE" -eq 100 ]; then
  echo "✅ Dev mode working: Perfect score achieved"
else
  echo "❌ Dev mode not working: Score was $SCORE"
fi
```

## Related Files

- `quiz-generator.service.ts` - Main implementation
- `prompt-builder.service.ts` - AI prompt generation
- `ai-grader.service.ts` - Answer grading logic
- `.env` - Environment configuration

---

**Last Updated**: March 2024
**Version**: 1.0
