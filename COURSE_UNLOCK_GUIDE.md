# How to Unlock Courses in Stacks Academy

## Overview

Courses in Stacks Academy follow a **sequential unlock system**. You must complete the previous course 100% before the next one unlocks.

## Current Course Structure

```
1. Bitcoin Fundamentals (Always Unlocked)
   ↓ Complete 100%
2. Introduction to Stacks (Locked until #1 complete)
   ↓ Complete 100%
3. Clarity Smart Contracts (Locked until #2 complete)
   ↓ Complete 100%
4. Build dApps (Locked until #3 complete)
   ↓ Complete 100%
5. Advanced Smart Contract Patterns (Locked until #4 complete)
   ↓ Complete 100%
6. Build Real Projects (Locked until #5 complete)
```

## How to Unlock "Introduction to Stacks"

To unlock Module 2 (Introduction to Stacks), you need to:

### Step 1: Complete All Lessons in Bitcoin Fundamentals

Module 1 has 4 lessons:
1. Bitcoin 101 (2 steps)
2. The Bitcoin Network (2 steps)
3. Proof of Work (1 step)
4. Wallets & Nodes (1 step)

**Total: 6 steps to complete**

### Step 2: Mark Each Step as Complete

Use the API endpoint to mark steps complete:

```bash
POST /api/v1/courses/:courseId/lessons/:lessonId/steps/:stepId/complete
Authorization: Bearer YOUR_TOKEN
```

### Example: Complete All Steps in Module 1

```bash
# Lesson 1, Step 1
curl -X POST http://localhost:3001/api/v1/courses/1/lessons/1/steps/1/complete \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lesson 1, Step 2
curl -X POST http://localhost:3001/api/v1/courses/1/lessons/1/steps/2/complete \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lesson 2, Step 1
curl -X POST http://localhost:3001/api/v1/courses/1/lessons/2/steps/1/complete \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lesson 2, Step 2
curl -X POST http://localhost:3001/api/v1/courses/1/lessons/2/steps/2/complete \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lesson 3, Step 1
curl -X POST http://localhost:3001/api/v1/courses/1/lessons/3/steps/1/complete \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lesson 4, Step 1
curl -X POST http://localhost:3001/api/v1/courses/1/lessons/4/steps/1/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 3: Verify Progress

Check your progress:

```bash
GET /api/v1/courses/1/progress
Authorization: Bearer YOUR_TOKEN

Response:
{
  "lessons": [...],
  "totalSteps": 6,
  "completedSteps": 6,
  "progressPercentage": 100
}
```

### Step 4: Refresh Learning Path Page

Once `progressPercentage` reaches 100%, refresh the Learning Path page. Module 2 will now be unlocked!

## Quick Unlock Script (Development)

For testing purposes, here's a script to quickly unlock all modules:

```bash
#!/bin/bash
# unlock-all-courses.sh

TOKEN="YOUR_AUTH_TOKEN"
API_URL="http://localhost:3001/api/v1"

echo "Unlocking all courses..."

# Module 1: Bitcoin Fundamentals (6 steps)
curl -s -X POST "$API_URL/courses/1/lessons/1/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/1/lessons/1/steps/2/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/1/lessons/2/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/1/lessons/2/steps/2/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/1/lessons/3/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/1/lessons/4/steps/1/complete" -H "Authorization: Bearer $TOKEN"
echo "✅ Module 1 complete"

# Module 2: Introduction to Stacks (4 steps)
curl -s -X POST "$API_URL/courses/2/lessons/1/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/2/lessons/2/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/2/lessons/3/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/2/lessons/4/steps/1/complete" -H "Authorization: Bearer $TOKEN"
echo "✅ Module 2 complete"

# Module 3: Clarity Smart Contracts (5 steps)
curl -s -X POST "$API_URL/courses/3/lessons/1/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/3/lessons/1/steps/2/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/3/lessons/2/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/3/lessons/3/steps/1/complete" -H "Authorization: Bearer $TOKEN"
echo "✅ Module 3 complete"

# Module 4: Build dApps (4 steps)
curl -s -X POST "$API_URL/courses/4/lessons/1/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/4/lessons/2/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/4/lessons/3/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/4/lessons/4/steps/1/complete" -H "Authorization: Bearer $TOKEN"
echo "✅ Module 4 complete"

# Module 5: Advanced Patterns (4 steps)
curl -s -X POST "$API_URL/courses/5/lessons/1/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/5/lessons/2/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/5/lessons/3/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/5/lessons/4/steps/1/complete" -H "Authorization: Bearer $TOKEN"
echo "✅ Module 5 complete"

# Module 6: Build Real Projects (4 steps)
curl -s -X POST "$API_URL/courses/6/lessons/1/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/6/lessons/2/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/6/lessons/3/steps/1/complete" -H "Authorization: Bearer $TOKEN"
curl -s -X POST "$API_URL/courses/6/lessons/4/steps/1/complete" -H "Authorization: Bearer $TOKEN"
echo "✅ Module 6 complete"

echo "🎉 All courses unlocked!"
```

## Frontend Implementation

The unlock logic is in `app/learning-path/page.tsx`:

```typescript
function deriveModuleState(
  course: Course,
  progressMap: Record<number, number>,
  index: number,
  allCourses: Course[],
): ModuleState {
  const pct = progressMap[course.id] ?? 0;
  if (pct === 100) return "completed";
  if (pct > 0) return "in-progress";
  // First course always unlocked
  if (index === 0) return "in-progress";
  // Check if previous course is 100% complete
  const prevCourse = allCourses[index - 1];
  const prevPct = progressMap[prevCourse.id] ?? 0;
  return prevPct === 100 ? "in-progress" : "locked";
}
```

## XP Integration (Future)

Currently, completing course steps does NOT award XP. This is planned for future implementation:

```typescript
// Future: Award XP when completing steps
await xpService.award(
  userId,
  XP_REWARDS.LESSON_STEP_COMPLETE, // 50 XP
  `Completed ${course.title} - ${lesson.title}`,
  stepId,
);
```

## Troubleshooting

### Module 2 Still Locked After Completing Module 1

1. **Check progress percentage:**
   ```bash
   curl http://localhost:3001/api/v1/courses/1/progress \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   Must show `"progressPercentage": 100`

2. **Verify all steps are marked complete:**
   - Module 1 has 6 total steps
   - Check `completedSteps` in response

3. **Refresh the page:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Clear browser cache if needed

4. **Check browser console:**
   - Look for API errors
   - Verify authentication token is valid

### Steps Not Marking as Complete

1. **Authentication issue:**
   - Ensure you're logged in
   - Check token is valid and not expired

2. **Invalid course/lesson/step IDs:**
   - Verify IDs match the curriculum structure
   - Check API response for error messages

3. **Database connection:**
   - Ensure PostgreSQL is running
   - Check server logs for errors

## Database Schema

Progress is stored in the `user_progress` table:

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  step_id INTEGER NOT NULL,
  state VARCHAR(20) DEFAULT 'locked',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id, lesson_id, step_id)
);
```

Query your progress:
```sql
SELECT * FROM user_progress 
WHERE user_id = 'YOUR_USER_ID' 
  AND course_id = 1
ORDER BY lesson_id, step_id;
```

## Future Enhancements

1. **Lesson Content Pages**: Currently steps are just placeholders
2. **XP Rewards**: Award XP for completing steps/lessons
3. **Badges**: Unlock badges for course completion
4. **Certificates**: Issue NFT certificates for finished courses
5. **Interactive Lessons**: Add code editors, quizzes within lessons
6. **Progress Sync**: Real-time progress updates without refresh

---

**Last Updated**: March 2024
**Version**: 1.0
