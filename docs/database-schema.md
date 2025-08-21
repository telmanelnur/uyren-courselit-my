# Database Schema Documentation

## Overview
This document describes the MongoDB database schema used in the Uyren CourseLit application. The application uses Mongoose ODM with a multi-tenant architecture where each domain has its own data isolation.

## Core Architecture

### Multi-Tenancy
- **Domain-based isolation**: All collections include a `domain` field (ObjectId) for data separation
- **User isolation**: Users are scoped to specific domains
- **Cross-domain operations**: Limited to system-level operations

### Common Fields
Most models include these standard fields:
- `_id`: MongoDB ObjectId (primary key)
- `domain`: ObjectId reference to Domain collection
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

## Collections

### 1. Users Collection

**Collection Name**: `users`

**Schema**: `packages/common-logic/src/models/user/index.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId, // Required, indexed
  userId: String, // Required, unique per domain
  email: String, // Required, indexed
  active: Boolean, // Default: true
  name: String,
  bio: String,
  permissions: [String],
  roles: [String],
  subscribedToUpdates: Boolean, // Default: true
  lead: String, // Enum: ["website", "newsletter", "download", "api"]
  tags: [String],
  unsubscribeToken: String, // Required, unique
  avatar: MediaSchema,
  invited: Boolean,
  providerData: {
    provider: String,
    uid: String,
    name: String
  }
}
```

**Indexes**:
- `{ domain: 1, email: 1 }` (unique)
- `{ email: "text", name: "text" }` (text search)

**Virtual Fields**:
- `purchases`: Array of Progress documents

### 2. LMS Collections

#### 2.1 Quizzes Collection

**Collection Name**: `quizzes`

**Schema**: `apps/web/src/models/lms/Quiz.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId, // Required, indexed
  title: String, // Required, max 255 chars
  description: String,
  courseId: String, // Required, indexed
  ownerId: String, // Required, indexed
  timeLimit: Number, // Minutes, min: 1
  maxAttempts: Number, // Min: 1, max: 10, default: 1
  passingScore: Number, // Min: 0, max: 100, default: 60
  shuffleQuestions: Boolean, // Default: true
  showResults: Boolean, // Default: false
  status: String, // Enum: ["draft", "published", "archived"]
  questionIds: [ObjectId], // References to Question collection
  totalPoints: Number, // Min: 0, default: 0
}
```

**Indexes**:
- `{ ownerId: 1, status: 1 }`
- `{ courseId: 1, status: 1 }`

**Virtual Fields**:
- `owner`: Reference to User collection
- `course`: Reference to Course collection

#### 2.2 Themes Collection

**Collection Name**: `themes`

**Schema**: `apps/web/src/models/lms/Theme.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId, // Required, indexed
  name: String, // Required, max 255 chars
  description: String,
  ownerId: String, // Required, indexed
  status: String, // Enum: ["draft", "published", "archived"]
  stylesCss: String, // Required, default: ""
  assets: [ThemeAssetSchema]
}
```

**ThemeAsset Schema**:
```typescript
{
  assetType: String, // Enum: ["stylesheet", "font", "script", "image"]
  url: String, // Required
  preload: Boolean, // Default: false
  async: Boolean, // Default: false
  defer: Boolean, // Default: false
  media: String,
  crossorigin: String,
  integrity: String,
  rel: String,
  sizes: String,
  mimeType: String,
  name: String,
  description: String
}
```

**Indexes**:
- `{ ownerId: 1, status: 1 }`
- `{ domain: 1, status: 1 }`

**Virtual Fields**:
- `owner`: Reference to User collection

#### 2.3 Assignments Collection

**Collection Name**: `assignments`

**Schema**: `apps/web/src/models/lms/Assignment.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  title: String, // Required, max 255 chars
  description: String,
  courseId: String, // Required, indexed
  ownerId: String, // Required, indexed
  dueDate: Date,
  maxScore: Number, // Min: 0
  instructions: String,
  attachments: [String], // File URLs
  status: String, // Enum: ["draft", "published", "archived"]
  submissionType: String, // Enum: ["file", "text", "both"]
  allowLateSubmission: Boolean, // Default: false
  latePenalty: Number, // Percentage
}
```

#### 2.4 Questions Collection

**Collection Name**: `questions`

**Schema**: `apps/web/src/models/lms/Question.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  text: String, // Required
  type: String, // Enum: ["multiple-choice", "true-false", "essay", "fill-blank"]
  options: [String], // For multiple choice
  correctAnswer: String, // Or array for multiple correct answers
  points: Number, // Default: 1
  explanation: String,
  tags: [String]
}
```

### 3. Community Collections

#### 3.1 Communities Collection

**Collection Name**: `communities`

**Schema**: `packages/common-models/src/community.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  name: String, // Required
  description: String,
  type: String, // Enum: ["public", "private", "invite-only"]
  memberCount: Number,
  rules: [String],
  moderators: [String], // User IDs
  createdAt: Date,
  updatedAt: Date
}
```

#### 3.2 Community Posts Collection

**Collection Name**: `communityposts`

**Schema**: `packages/common-models/src/community-post.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  communityId: ObjectId, // Reference to Community
  authorId: String, // User ID
  title: String,
  content: String,
  type: String, // Enum: ["post", "announcement", "question"]
  status: String, // Enum: ["active", "hidden", "deleted"]
  likes: [String], // User IDs who liked
  tags: [String],
  isPinned: Boolean,
  isLocked: Boolean
}
```

### 4. Course & Learning Collections

#### 4.1 Courses Collection

**Collection Name**: `courses`

**Schema**: `packages/common-models/src/course.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  courseId: String, // Required, unique per domain
  title: String, // Required
  description: String,
  price: Number,
  currency: String, // Default: "USD"
  status: String, // Enum: ["draft", "published", "archived"]
  lessons: [LessonSchema],
  instructor: String, // User ID
  category: String,
  tags: [String],
  thumbnail: String, // Media URL
  enrollmentCount: Number
}
```

#### 4.2 Lessons Collection

**Collection Name**: `lessons`

**Schema**: `packages/common-models/src/lesson.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  courseId: String, // Reference to Course
  title: String, // Required
  content: String, // Rich text content
  type: String, // Enum: ["video", "text", "quiz", "assignment"]
  duration: Number, // Minutes
  order: Number, // Lesson sequence
  isPublished: Boolean,
  attachments: [String], // Media URLs
  prerequisites: [String] // Lesson IDs
}
```

### 5. Payment & Subscription Collections

#### 5.1 Payment Plans Collection

**Collection Name**: `paymentplans`

**Schema**: `packages/common-models/src/payment-plan.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  name: String, // Required
  type: String, // Enum: ["free", "onetime", "emi", "subscription"]
  price: Number,
  currency: String, // Default: "USD"
  interval: String, // For subscriptions: "monthly", "yearly"
  features: [String],
  isActive: Boolean,
  trialDays: Number
}
```

#### 5.2 Memberships Collection

**Collection Name**: `memberships`

**Schema**: `packages/common-models/src/membership.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  userId: String, // Reference to User
  entityType: String, // Enum: ["course", "community"]
  entityId: String, // Course or Community ID
  status: String, // Enum: ["active", "payment_failed", "expired", "pending", "rejected", "paused"]
  role: String, // Enum: ["comment", "post", "moderate"]
  startDate: Date,
  endDate: Date,
  autoRenew: Boolean
}
```

### 6. Notification & Communication Collections

#### 6.1 Notifications Collection

**Collection Name**: `notifications`

**Schema**: `packages/common-models/src/notification.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  userId: String, // Reference to User
  type: String, // Enum: ["email", "push", "in-app"]
  title: String,
  message: String,
  entityType: String, // What the notification is about
  entityId: String, // ID of the entity
  action: String, // Enum: ["community:posted", "community:commented", etc.]
  isRead: Boolean, // Default: false
  priority: String, // Enum: ["low", "medium", "high"]
  scheduledFor: Date, // For delayed notifications
  sentAt: Date
}
```

#### 6.2 Email Templates Collection

**Collection Name**: `emailtemplates`

**Schema**: `packages/common-models/src/email-template.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  name: String, // Required
  subject: String, // Required
  content: String, // HTML content
  variables: [String], // Available template variables
  isActive: Boolean,
  category: String // Enum: ["welcome", "reset-password", "course-completion", etc.]
}
```

### 7. Media & File Collections

#### 7.1 Media Collection

**Collection Name**: `media`

**Schema**: `packages/common-models/src/media.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  filename: String, // Required
  originalName: String,
  mimeType: String, // Required
  size: Number, // Bytes
  url: String, // Required
  thumbnail: String, // Thumbnail URL
  alt: String, // Alt text for accessibility
  tags: [String],
  uploadedBy: String, // User ID
  isPublic: Boolean
}
```

### 8. System & Analytics Collections

#### 8.1 Activity Log Collection

**Collection Name**: `activities`

**Schema**: `apps/web/src/models/Activity.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  userId: String, // Reference to User
  type: String, // Enum: ["login", "course_enrolled", "lesson_completed", etc.]
  entityType: String, // What the activity relates to
  entityId: String, // ID of the entity
  metadata: Object, // Additional activity data
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

#### 8.2 API Keys Collection

**Collection Name**: `apikeys`

**Schema**: `apps/web/src/models/ApiKey.ts`

**Key Fields**:
```typescript
{
  _id: ObjectId,
  domain: ObjectId,
  name: String, // Required
  key: String, // Required, unique
  permissions: [String], // Array of allowed operations
  isActive: Boolean, // Default: true
  lastUsed: Date,
  expiresAt: Date,
  createdBy: String // User ID
}
```

## Data Relationships

### One-to-Many Relationships
- **Domain → Users**: One domain can have many users
- **Domain → Courses**: One domain can have many courses
- **Domain → Communities**: One domain can have many communities
- **Course → Lessons**: One course can have many lessons
- **Course → Quizzes**: One course can have many quizzes
- **Course → Assignments**: One course can have many assignments
- **User → Posts**: One user can have many community posts
- **User → Memberships**: One user can have many memberships

### Many-to-Many Relationships
- **Users ↔ Communities**: Through memberships
- **Users ↔ Courses**: Through enrollments/progress
- **Users ↔ Posts**: Through likes, comments

### Virtual Populations
Mongoose virtual fields are used for:
- **Owner references**: Linking documents to their creators
- **Related data**: Fetching associated information without storing references
- **Computed fields**: Dynamic data based on relationships

## Indexing Strategy

### Primary Indexes
- `_id`: Default MongoDB primary key
- `domain`: Multi-tenancy isolation

### Performance Indexes
- **User queries**: `{ domain: 1, email: 1 }`, `{ domain: 1, userId: 1 }`
- **Content queries**: `{ domain: 1, status: 1 }`, `{ domain: 1, ownerId: 1 }`
- **Search indexes**: Text indexes on searchable fields
- **Compound indexes**: For complex query patterns

### Unique Constraints
- **User emails**: `{ domain: 1, email: 1 }` (unique per domain)
- **Course IDs**: `{ domain: 1, courseId: 1 }` (unique per domain)
- **API Keys**: `{ key: 1 }` (globally unique)

## Data Validation

### Schema Validation
- **Required fields**: Enforced at Mongoose schema level
- **Field types**: Strict typing with Mongoose
- **Field constraints**: Min/max values, string lengths, enums
- **Custom validators**: Business logic validation

### Business Rules
- **Status transitions**: Controlled state changes
- **Permission checks**: User access control
- **Data integrity**: Referential integrity through ObjectIds
- **Audit trails**: Timestamps and user tracking

## Security Considerations

### Data Isolation
- **Domain separation**: Complete data isolation between tenants
- **User scoping**: All queries filtered by domain
- **Permission-based access**: Role-based data access control

### Input Validation
- **Schema validation**: Mongoose schema validation
- **TRPC validation**: Zod schema validation at API level
- **Sanitization**: Input sanitization and escaping

### Access Control
- **JWT authentication**: Secure token-based authentication
- **Permission middleware**: TRPC permission checking
- **Domain verification**: Domain ownership verification
