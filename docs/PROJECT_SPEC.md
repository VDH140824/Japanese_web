# PROJECT_SPEC.md

# Japanese Learning Platform - Project Specification

## 1. Project Overview

### Project Name

Japanese Learning Platform

### Description

The Japanese Learning Platform is a modern web application designed to help learners study Japanese from JLPT N5 to JLPT N1.

The platform aims to provide an all-in-one learning environment instead of simply displaying learning materials.

The system includes structured lessons, quizzes, flashcards, progress tracking, mock tests, AI-assisted learning, and multimedia learning resources.

The architecture must be scalable, maintainable, and easy to extend with future features.

---

# 2. Technology Stack

## Backend

- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA (Hibernate)
- Maven

## Frontend

- React
- Vite
- TypeScript
- TailwindCSS

## Database

- MySQL 8

---

# 3. System Architecture

```
React Frontend

        │

REST API

        │

Spring Boot Backend

        │

MySQL Database
```

### Architecture Rules

- The frontend is responsible only for presentation and user interaction.
- Business logic must be implemented in the backend.
- The frontend communicates with the backend exclusively through REST APIs.
- The database must never be accessed directly by the frontend.

---

# 4. User Roles

## Guest

A guest is an unauthenticated visitor.

Permissions

- View Home Page
- Register
- Login
- View Public Pages

Restrictions

- Cannot access learning content
- Cannot save progress
- Cannot take quizzes

---

## User

A registered learner.

Permissions

- Study Grammar
- Study Vocabulary
- Study Kanji
- Watch Videos
- Watch Shorts
- Practice Flashcards
- Take Quizzes
- Take JLPT Mock Tests
- Track Learning Progress
- Bookmark Content
- Comment on Lessons
- Update Profile

---

## Admin

System administrator.

Permissions

- Full system management
- User management
- Content management
- Statistics
- Reports
- Dashboard

---

# 5. Project Modules

## Authentication

Responsible for

- Register
- Login
- Google Login
- Logout
- Email Verification
- Forgot Password
- Reset Password
- Refresh Token
- Change Password

---

## User

Responsible for

- User Profile
- Avatar
- Learning Goal
- JLPT Level
- Daily Goal
- Learning Statistics

---

## Grammar

Responsible for

- Grammar Lessons
- Examples
- Explanations
- Notes
- Exercises

---

## Vocabulary

Responsible for

- Vocabulary
- Meaning
- Hiragana
- Romaji
- Example Sentences
- Audio
- JLPT Level

---

## Kanji

Responsible for

- Kanji
- Meaning
- Onyomi
- Kunyomi
- Stroke Count
- Stroke Order
- Radical
- Compound Words
- Example Sentences

---

## Flashcard

Responsible for

- Spaced Repetition System (SRS)
- Daily Review
- Learning Schedule

---

## Quiz

Responsible for

- Multiple Choice
- Fill in the Blank
- Drag and Drop
- Matching
- Listening Quiz
- Sentence Ordering

---

## JLPT Mock Test

Responsible for

- Full JLPT Exams
- Timer
- Automatic Scoring
- Result Analysis

---

## Video

Responsible for

- Course Videos
- Grammar Videos
- Vocabulary Videos
- Kanji Videos

---

## Shorts

Responsible for

- Short Educational Videos
- Vertical Scrolling
- Learning Feed

---

## Reading

Responsible for

- Reading Practice
- Vocabulary Explanation
- Grammar Explanation
- Reading Quiz

---

## Listening

Responsible for

- Audio Lessons
- Transcript
- Listening Quiz

---

## Dictionary

Responsible for

- Word Search
- Grammar Search
- Kanji Search

---

## Bookmark

Responsible for

Saving

- Grammar
- Vocabulary
- Kanji
- Videos

---

## Progress

Responsible for

- Learning Progress
- Daily Streak
- Experience Points
- Study Time
- Completion Rate

---

## Achievement

Responsible for

- Badges
- Milestones
- Rewards

---

## Notification

Responsible for

- Study Reminders
- Flashcard Reminders
- System Notifications

---

## Comment

Responsible for

- Lesson Comments
- Replies
- Discussion

---

## Admin Dashboard

Responsible for

- User Management
- Grammar Management
- Vocabulary Management
- Kanji Management
- Quiz Management
- Video Management
- Shorts Management
- Comment Management
- Analytics

---

# 6. Development Principles

Every module must be independent.

Each module should contain

- Entity
- DTO
- Repository
- Service
- Controller

Business logic must never be duplicated.

Each module should be easily extendable.

---

# 7. Future Expansion

The system must be designed to support future modules without changing the existing architecture.

Possible future modules include

- AI Teacher
- AI Conversation Practice
- AI Grammar Explanation
- AI Quiz Generator
- Speaking Evaluation
- Pronunciation Analysis
- Online Classroom
- Live Streaming
- Premium Membership
- Payment Gateway
- Mobile Application
- Push Notification

---

# 8. Project Goals

The final product should become a complete Japanese learning ecosystem capable of serving thousands of users simultaneously.

The project should prioritize

- Scalability
- Maintainability
- Performance
- Security
- User Experience

Every new feature must follow the project architecture and comply with the rules defined in **AI_RULES.md**.
