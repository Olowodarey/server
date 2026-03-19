# Stacks Academy Leveling System

## Overview

Stacks Academy uses an XP (Experience Points) based leveling system to gamify learning and track user progress. Users earn XP by completing various activities and automatically level up when they reach XP thresholds.

## Level Progression

### Level Thresholds

| Level | Title | XP Required | XP to Next Level |
|-------|-------|-------------|------------------|
| 1 | Stacker Novice | 0 | 500 |
| 2 | Clarity Coder | 500 | 1,000 |
| 3 | Bitcoin Builder | 1,500 | 2,000 |
| 4 | L2 Architect | 3,500 | 3,000 |
| 5 | Smart Contract Developer | 6,500 | 4,000 |
| 6 | DeFi Engineer | 10,500 | 5,000 |
| 7 | Protocol Expert | 15,500 | 6,500 |
| 8 | Blockchain Architect | 22,000 | 8,000 |
| 9 | Stacks Master | 30,000 | 10,000 |
| 10 | Bitcoin L2 Legend | 40,000 | Max Level |

## How to Earn XP

### Currently Implemented

#### 1. Quiz Completion (Assessments Module)
- **Perfect Score (100%)**: 250 XP
- **Passing Score (≥60%)**: 150 XP
- **Failed Attempt (<60%)**: 45 XP (effort reward)

**How it works:**
- Complete an AI-generated quiz on any topic
- Submit your answers for grading
- XP is automatically awarded based on your score
- XP is awarded only once per quiz session

### Planned/Not Yet Implemented

The following XP rewards are defined but not yet integrated:

#### 2. Course Progress
- **Lesson Step Complete**: 50 XP per step
- **Module Complete**: 300 XP per module

**Status**: Courses module exists but XP integration is pending

#### 3. Project Submissions
- **Gallery Submit**: 200 XP
- **First Contract Deployment**: 500 XP (one-time bonus)

**Status**: Gallery module exists but XP integration is pending

#### 4. Daily Engagement
- **Daily Streak**: 25 XP per day
- Streak tracking is implemented in the XP service
- Automatic streak updates when earning XP on consecutive days
