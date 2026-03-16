# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Quiz Config  │  │ Quiz Display │  │   Results    │           │
│  │    Page      │  │     Page     │  │     Page     │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │ POST /generate   │ POST /submit     │ GET /history
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────────┐
│                    AssessmentsController                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   generate   │  │    submit    │  │  getHistory  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────────┐
│                     AssessmentsService                           │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  • Quota Management                                  │       │
│  │  • Session Orchestration                             │       │
│  │  • Database Operations                               │       │
│  └──────┬───────────────────────────┬───────────────────┘       │
└─────────┼───────────────────────────┼─────────────────────────┘
          │                           │
          │                           │
    ┌─────▼──────┐            ┌──────▼────────┐
    │ Generator  │            │    Grader     │
    │  Services  │            │   Service     │
    └─────┬──────┘            └──────┬────────┘
          │                           │
┌─────────▼───────────────────────────▼─────────────────────────┐
│                                                                 │
│  ┌──────────────────┐              ┌──────────────────┐       │
│  │ QuizGenerator    │              │   AiGrader       │       │
│  │    Service       │              │    Service       │       │
│  │                  │              │                  │       │
│  │ • Generate Quiz  │              │ • Grade MC       │       │
│  │ • Parse Response │              │ • Grade OE       │       │
│  │ • Validate       │              │ • Feedback       │       │
│  └────────┬─────────┘              └────────┬─────────┘       │
│           │                                 │                  │
│  ┌────────▼─────────┐                      │                  │
│  │ PromptBuilder    │                      │                  │
│  │    Service       │                      │                  │
│  │                  │                      │                  │
│  │ • Build Prompts  │                      │                  │
│  │ • Format Rules   │                      │                  │
│  │ • JSON Schema    │                      │                  │
│  └────────┬─────────┘                      │                  │
│           │                                 │                  │
└───────────┼─────────────────────────────────┼──────────────────┘
            │                                 │
            │                                 │
      ┌─────▼─────────────────────────────────▼─────┐
      │         Anthropic Claude API                 │
      │  • Question Generation                       │
      │  • Open-Ended Grading                        │
      └──────────────────────────────────────────────┘
```

## Data Flow

### Quiz Generation

```
User Input
  │
  ├─ topic: "Clarity Contracts"
  ├─ format: "mixed"
  └─ includeAdvanced: false
  │
  ▼
┌─────────────────────────────────────┐
│   AssessmentsService                │
│   • Check user quota                │
│   • Validate input                  │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   QuizGeneratorService              │
│   • Coordinate generation           │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   PromptBuilderService              │
│   • Build format instructions       │
│   • Add difficulty settings         │
│   • Include JSON schema             │
└─────────────┬───────────────────────┘
              │
              ▼
        AI Prompt:
        "Generate 5 questions about Clarity Contracts
         Format: mixed (3 MC + 2 OE)
         Difficulty: beginner
         Return JSON: [...]"
              │
              ▼
┌─────────────────────────────────────┐
│   Anthropic API                     │
│   • Process prompt                  │
│   • Generate questions              │
└─────────────┬───────────────────────┘
              │
              ▼
        AI Response:
        [
          { id: "q1", type: "multiple-choice", ... },
          { id: "q2", type: "open-ended", ... },
          ...
        ]
              │
              ▼
┌─────────────────────────────────────┐
│   QuizGeneratorService              │
│   • Parse JSON response             │
│   • Validate structure              │
│   • Check format compliance         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   AssessmentsService                │
│   • Create quiz session             │
│   • Save to database                │
└─────────────┬───────────────────────┘
              │
              ▼
        Quiz Session
        {
          id: "uuid",
          questions: [...],
          createdAt: "..."
        }
              │
              ▼
          Frontend
```

### Answer Grading

```
User Answers
  │
  ├─ q1: "a"
  ├─ q2: "My written answer..."
  └─ q3: "b"
  │
  ▼
┌─────────────────────────────────────┐
│   AssessmentsService                │
│   • Fetch quiz session              │
│   • Validate not already graded     │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   AiGraderService                   │
│   • Iterate through questions       │
└─────────────┬───────────────────────┘
              │
              ├─────────────────┬─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Multiple-Choice  │ │  Open-Ended  │ │ Multiple-    │
    │   Question       │ │   Question   │ │   Choice     │
    └────────┬─────────┘ └──────┬───────┘ └──────┬───────┘
             │                  │                 │
             ▼                  ▼                 ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Direct Compare   │ │  AI Grading  │ │ Direct       │
    │ answer === "a"   │ │              │ │ Compare      │
    │ ✓ Correct        │ │ Send to AI   │ │ ✓ Correct    │
    └────────┬─────────┘ └──────┬───────┘ └──────┬───────┘
             │                  │                 │
             │                  ▼                 │
             │         ┌──────────────┐          │
             │         │ Anthropic AI │          │
             │         │ • Compare    │          │
             │         │ • Evaluate   │          │
             │         │ • Feedback   │          │
             │         └──────┬───────┘          │
             │                │                  │
             │                ▼                  │
             │         ┌──────────────┐          │
             │         │ ✓ Partially  │          │
             │         │   Correct    │          │
             │         └──────┬───────┘          │
             │                │                  │
             └────────────────┼──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Aggregate Results│
                    │ • 2/3 correct    │
                    │ • Score: 67%     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Save to Database │
                    │ • Update session │
                    │ • Set gradedAt   │
                    └────────┬─────────┘
                             │
                             ▼
                    Grading Results
                    {
                      score: 67,
                      results: [...]
                    }
                             │
                             ▼
                         Frontend
```

## Service Responsibilities

### AssessmentsService (Orchestrator)
- **Input**: User requests, DTOs
- **Output**: Quiz sessions, grading results
- **Responsibilities**:
  - Quota enforcement
  - Session management
  - Database operations
  - Service coordination

### QuizGeneratorService (Generator)
- **Input**: Topic, format, difficulty
- **Output**: Validated questions
- **Responsibilities**:
  - AI communication
  - Response parsing
  - Question validation
  - Error handling

### PromptBuilderService (Prompt Engineer)
- **Input**: Quiz configuration
- **Output**: AI prompt string
- **Responsibilities**:
  - Format instructions
  - Difficulty settings
  - JSON schema definition
  - Prompt optimization

### AiGraderService (Grader)
- **Input**: Questions, user answers
- **Output**: Grading results
- **Responsibilities**:
  - Type-specific grading
  - Feedback generation
  - Score calculation
  - AI evaluation (for OE)

## Type System

```typescript
// Question Type Hierarchy
Question (union type)
  ├─ MultipleChoiceQuestion
  │    ├─ id: string
  │    ├─ type: "multiple-choice"
  │    ├─ question: string
  │    ├─ codeSnippet?: string
  │    ├─ options: QuestionOption[]
  │    ├─ correctOptionId: string
  │    └─ explanation: string
  │
  └─ OpenEndedQuestion
       ├─ id: string
       ├─ type: "open-ended"
       ├─ question: string
       ├─ codeSnippet?: string
       ├─ modelAnswer: string
       └─ explanation: string

// Supporting Types
QuestionOption
  ├─ id: string (a, b, c, d)
  └─ text: string

QuestionResult
  ├─ questionId: string
  ├─ correct: boolean
  ├─ userAnswer: string
  └─ feedback: string

GradingResult
  ├─ score: number
  ├─ totalQuestions: number
  ├─ correctCount: number
  ├─ incorrectCount: number
  └─ results: QuestionResult[]
```

## Database Schema

```sql
quiz_sessions
  ├─ id (uuid, PK)
  ├─ user_id (uuid, FK)
  ├─ topic (varchar)
  ├─ format (enum: multi_choice, open_ended, mixed)
  ├─ include_advanced (boolean)
  ├─ questions (jsonb)
  ├─ score (integer, nullable)
  ├─ graded_at (timestamp, nullable)
  ├─ created_at (timestamp)
  └─ updated_at (timestamp)
```

## API Endpoints

```
POST   /assessments/generate
  ├─ Input: GenerateQuizDto
  ├─ Output: QuizSession
  └─ Auth: Required

POST   /assessments/:id/submit
  ├─ Input: SubmitAnswersDto
  ├─ Output: GradingResult
  └─ Auth: Required (owner only)

GET    /assessments/history
  ├─ Output: QuizSession[]
  └─ Auth: Required

GET    /assessments/quota
  ├─ Output: QuotaInfo
  └─ Auth: Required
```

## Error Handling

```
User Request
     │
     ▼
┌─────────────────┐
│ Input Validation│ ──► ValidationException (400)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Quota Check    │ ──► ForbiddenException (403)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI Generation   │ ──► InternalServerError (500)
└────────┬────────┘     (with retry logic)
         │
         ▼
┌─────────────────┐
│   Validation    │ ──► InternalServerError (500)
└────────┬────────┘     (AI generated invalid data)
         │
         ▼
┌─────────────────┐
│  Save to DB     │ ──► InternalServerError (500)
└────────┬────────┘
         │
         ▼
    Success (200)
```

## Performance Characteristics

- **Quiz Generation**: 2-5 seconds (AI bottleneck)
- **Multiple-Choice Grading**: <100ms (direct comparison)
- **Open-Ended Grading**: 1-3 seconds per question (AI evaluation)
- **Database Operations**: <50ms

## Scalability Considerations

1. **Caching**: Cache frequently generated questions
2. **Background Jobs**: Generate quizzes asynchronously
3. **Rate Limiting**: Prevent API abuse
4. **Connection Pooling**: Optimize database connections
5. **CDN**: Cache static content
