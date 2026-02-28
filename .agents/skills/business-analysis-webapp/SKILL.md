---
name: business-analysis-webapp
description: Convert business requirements from Notion notes into structured Epics and detailed User Stories for web applications. Use when the user wants to transform raw business requirements into Agile artifacts (epics and user stories) with complete technical specifications including user journey flows, happy/unhappy scenarios with UI details, API design, database schema, dependency mapping, and security considerations for web applications.
---

# Business Analysis for Web Applications

This skill transforms business requirements from Notion notes into comprehensive Agile artifacts (Epics and User Stories) with full technical specifications for web applications.

## Workflow

### Step 1: Analyze Input Requirements
- Read and understand the business requirements from Notion notes
- Identify the core business problem and value proposition
- Extract actors (user types) and their goals
- Identify constraints, assumptions, and dependencies mentioned

### Step 2: Create the Epic
Structure the Epic with:
- **Title**: Clear, business-focused name
- **Description**: What problem this solves and for whom
- **Business Value**: Why this matters (metrics, ROI, user impact)
- **Success Criteria**: Measurable outcomes to validate completion
- **User Stories**: List of all stories with IDs
- **Dependencies**: Cross-epic or external dependencies
- **Security Considerations**: High-level security requirements

### Step 3: Create User Stories
For each user story, include:

#### Header
- Story ID (e.g., US-001, US-002)
- Standard format: "As a [user], I want [action], so that [benefit]"

#### User Journey Flow
High-level narrative of the complete user experience from start to finish.

#### Scenarios (with UI Details)
Use table format for clarity:

**Happy Path:**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | User clicks "Sign Up" button | System displays registration form | Button on landing page |
| 2 | User fills email and password | System validates input format | Form with input fields, validation indicators |
| 3 | ... | ... | ... |

**Unhappy Cases:**
Create separate tables for each edge case/error scenario:
- Validation errors
- Authentication failures  
- Network errors
- Permission denied
- Data not found

#### API Design
For each endpoint:
```
- **Endpoint**: POST /api/v1/resource
- **Description**: Brief purpose
- **Request Headers**: Content-Type, Authorization, etc.
- **Request Body**:
  ```json
  {
    "field": "type",
    "required": true
  }
  ```
- **Response 200**:
  ```json
  { "data": {}, "message": "..." }
  ```
- **Error Responses**: 400, 401, 403, 404, 500 with response schemas
- **Authentication**: Required/Optional, method
```

#### Database Schema
- **Table Name**: snake_case naming
- **Fields**:
  - `id`: UUID/PK, auto-generated
  - `field_name`: data_type, constraints, default, index?
  - `created_at`: timestamp
  - `updated_at`: timestamp
- **Relationships**: Foreign keys, one-to-many, many-to-many
- **Indexes**: For query optimization
- **Constraints**: Unique, not null, check constraints

#### Dependencies
- **Depends on**: Stories that must be completed first
- **Blocks**: Stories that cannot start until this is done
- **External**: Third-party integrations, API availability

#### Security Notes
Reference [web-security-checklist.md](references/web-security-checklist.md) for common considerations. Include:
- Input validation & sanitization
- Authentication & authorization requirements
- Data encryption (at rest and in transit)
- Rate limiting needs
- Sensitive data handling (PII, passwords)

### Step 4: Review & Validate
- Verify all acceptance criteria are testable
- Check that unhappy paths cover edge cases
- Confirm dependencies form a logical sequence
- Ensure security is addressed at each layer

## Output Format

### Epic Template

```markdown
# Epic: [Epic Title]

## Description
[Brief description of the business need and scope]

## Business Value
- [Value proposition 1]
- [Value proposition 2]
- **Success Metrics**: [How to measure success]

## Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

## User Stories
| ID | Title | Priority | Status |
|----|-------|----------|--------|
| US-001 | [Story title] | High | Not Started |
| US-002 | [Story title] | Medium | Not Started |

## Dependencies
- [External dependency or cross-epic link]
- [Third-party integration requirement]

## Security Considerations
- [High-level security requirement 1]
- [High-level security requirement 2]

---

## User Stories

### US-001: [Story Title]

**As a** [user type]
**I want** [goal/action]
**So that** [benefit/reason]

#### User Journey Flow
[High-level narrative description]

#### Scenarios

**Happy Path:**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**Unhappy Case 1: [Scenario Name]**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | | | |
| 2 | | | |

**Unhappy Case 2: [Scenario Name]**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | | | |
| 2 | | | |

#### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

#### API Design

**Endpoint**: `METHOD /api/v1/...`

**Request:**
```json
{
  "field": "value"
}
```

**Response 200:**
```json
{
  "data": {},
  "message": "Success"
}
```

**Error Responses:**
- `400 Bad Request`: [When this occurs]
- `401 Unauthorized`: [When this occurs]

#### Database Schema

**Table: `table_name`**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| ... | ... | ... | ... |

**Indexes:**
- `idx_field_name` on `field_name`

**Relationships:**
- Foreign key to `other_table.id`

#### Dependencies
- **Depends on**: [US-XXX]
- **Blocks**: [US-XXX]
- **External**: [Dependency]

#### Security Notes
- [Security consideration 1]
- [Security consideration 2]

---

[Repeat for each user story...]
```

## Guidelines

### Story Sizing
- Keep stories small enough to complete in 1-3 days
- If a story has too many scenarios, split it
- Group related functionality into the same epic

### Dependency Mapping
- Always identify which stories must come first
- Look for natural sequencing (e.g., login before profile)
- Note external blockers clearly
- Avoid circular dependencies

### UI Specification
- Be specific about screen names and component locations
- Include error message display locations
- Note responsive behavior if relevant
- Specify loading states and empty states

### API Design Principles
- Use RESTful conventions
- Version APIs (v1, v2)
- Consistent naming (snake_case for JSON)
- Include pagination for list endpoints
- Document all possible error responses

### Database Design Principles
- Use appropriate data types
- Always include created_at/updated_at
- Index foreign keys and frequently queried fields
- Plan for soft deletes if needed
- Document enum values

## References
- See [references/web-security-checklist.md](references/web-security-checklist.md) for common web app security requirements
- See [references/user-story-templates.md](references/user-story-templates.md) for detailed examples
