# Assessments Module

This module handles AI-powered quiz generation and grading for the Stacks Academy platform.

## Architecture

The module follows a clean, maintainable architecture with clear separation of concerns:

```
assessments/
├── types/
│   └── question.types.ts          # Type definitions for questions
├── generators/
│   ├── prompt-builder.service.ts  # Builds AI prompts
│   └── quiz-generator.service.ts  # Generates quizzes using AI
├── grader/
│   └── ai-grader.service.ts       # Grades quiz answers
├── dto/
│   ├── generate-quiz.dto.ts       # Quiz generation request
│   └── submit-answers.dto.ts      # Answer submission request
├── assessments.controller.ts      # HTTP endpoints
├── assessments.service.ts         # Main business logic
└── assessments.module.ts          # Module configuration
```

## Features

### Quiz Generation

The system supports three quiz formats:

1. **Multi-Choice**: All questions are multiple-choice with 4 options
2. **Open-Ended**: All questions require written explanations
3. **Mixed**: Combination of both types (3 MC + 2 OE)

Each quiz:
- Contains 5 questions
- Can be beginner-friendly or advanced
- Includes code snippets where relevant
- Provides detailed explanations

### Question Types

#### Multiple-Choice Question
```typescript
{
  id: "q1",
  type: "multiple-choice",
  question: "What is the primary function of define-data-var?",
  codeSnippet: "(define-data-var my-var uint u10)",
  options: [
    { id: "a", text: "Option A" },
    { id: "b", text: "Option B" },
    { id: "c", text: "Option C" },
    { id: "d", text: "Option D" }
  ],
  correctOptionId: "b",
  explanation: "Detailed explanation..."
}
```

#### Open-Ended Question
```typescript
{
  id: "q2",
  type: "open-ended",
  question: "Explain the difference between var, let, and const",
  codeSnippet: "// optional code context",
  modelAnswer: "Comprehensive model answer for grading",
  explanation: "Detailed explanation and key points"
}
```

### Grading System

The grading system handles both question types differently:

- **Multiple-Choice**: Simple comparison with correct answer
- **Open-Ended**: AI-powered grading that:
  - Compares against model answer
  - Awards partial credit for understanding
  - Provides detailed feedback
  - Considers key concepts, not exact wording

### API Endpoints

#### Generate Quiz
```http
POST /assessments/generate
Authorization: Bearer <token>

{
  "topic": "Clarity smart contracts",
  "format": "mixed",
  "includeAdvanced": false
}
```

Response:
```json
{
  "id": "uuid",
  "topic": "Clarity smart contracts",
  "format": "mixed",
  "questions": [...],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Submit Answers
```http
POST /assessments/:id/submit
Authorization: Bearer <token>

{
  "answers": {
    "q1": "a",
    "q2": "This is my written answer..."
  }
}
```

Response:
```json
{
  "sessionId": "uuid",
  "score": 80,
  "totalQuestions": 5,
  "correctCount": 4,
  "incorrectCount": 1,
  "results": [
    {
      "questionId": "q1",
      "correct": true,
      "userAnswer": "a",
      "feedback": "Correct! Explanation..."
    }
  ]
}
```

#### Get History
```http
GET /assessments/history
Authorization: Bearer <token>
```

#### Get Quota
```http
GET /assessments/quota
Authorization: Bearer <token>
```

Response:
```json
{
  "used": 1,
  "limit": 2,
  "remaining": 1
}
```

## Services

### PromptBuilderService

Responsible for building AI prompts based on quiz configuration.

**Key Methods:**
- `buildGenerationPrompt()`: Creates the full prompt for quiz generation

**Features:**
- Format-specific instructions
- Difficulty level handling
- JSON schema definitions
- Clear, structured prompts

### QuizGeneratorService

Handles quiz generation using the Anthropic API.

**Key Methods:**
- `generateQuiz()`: Generates a complete quiz
- `parseQuestions()`: Parses AI response
- `validateQuestions()`: Validates question structure

**Features:**
- Robust error handling
- Response parsing and cleaning
- Format validation
- Logging for debugging

### AiGraderService

Handles grading of quiz answers.

**Key Methods:**
- `grade()`: Grades all answers in a quiz
- `gradeQuestion()`: Grades a single question
- `gradeMultipleChoice()`: Simple comparison grading
- `gradeOpenEnded()`: AI-powered grading

**Features:**
- Type-specific grading logic
- Detailed feedback generation
- Partial credit support
- Fallback error handling

### AssessmentsService

Main service coordinating all assessment operations.

**Key Methods:**
- `generateQuiz()`: Creates a new quiz session
- `submitAnswers()`: Grades and saves results
- `getHistory()`: Retrieves past quizzes
- `getQuota()`: Checks remaining quota

**Features:**
- Quota management
- Session persistence
- Transaction handling
- Comprehensive logging

## Data Flow

### Quiz Generation Flow
```
User Request
    ↓
AssessmentsService.generateQuiz()
    ↓
Check Quota
    ↓
QuizGeneratorService.generateQuiz()
    ↓
PromptBuilderService.buildGenerationPrompt()
    ↓
Anthropic API Call
    ↓
Parse & Validate Response
    ↓
Save to Database
    ↓
Return Quiz Session
```

### Grading Flow
```
User Submits Answers
    ↓
AssessmentsService.submitAnswers()
    ↓
Fetch Quiz Session
    ↓
AiGraderService.grade()
    ↓
For Each Question:
    ├─ Multiple-Choice → Direct Comparison
    └─ Open-Ended → AI Grading
    ↓
Calculate Score
    ↓
Save Results
    ↓
Return Grading Results
```

## Error Handling

The module includes comprehensive error handling:

- **Quota Exceeded**: Returns 403 with upgrade message
- **Session Not Found**: Returns 404
- **Already Graded**: Returns 403
- **Invalid Questions**: Throws validation error
- **AI Failures**: Graceful fallback with logging

## Testing

To test the module:

```bash
# Run unit tests
npm test assessments

# Test quiz generation
curl -X POST http://localhost:3000/assessments/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"topic":"Clarity","format":"mixed","includeAdvanced":false}'

# Test answer submission
curl -X POST http://localhost:3000/assessments/<id>/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"answers":{"q1":"a","q2":"My answer"}}'
```

## Configuration

Required environment variables:

```env
ANTHROPIC_API_KEY=your_api_key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

## Future Enhancements

Potential improvements:

1. **Question Bank**: Cache generated questions for reuse
2. **Difficulty Scoring**: Adaptive difficulty based on performance
3. **Detailed Analytics**: Track performance by topic/concept
4. **Collaborative Quizzes**: Multi-user quiz sessions
5. **Custom Question Count**: Allow users to choose number of questions
6. **Time Limits**: Add timed quiz mode
7. **Hints System**: Progressive hints for struggling users
8. **Explanation Videos**: Link to video explanations

## Maintenance

When maintaining this module:

1. Monitor AI response quality and adjust prompts as needed
2. Track grading accuracy for open-ended questions
3. Update question validation as requirements change
4. Review and optimize API token usage
5. Keep type definitions in sync with frontend
