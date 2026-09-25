# Permit-IQ (SafePermit CMMS)

> **Enterprise Permit-to-Work (PTW) & Hazardous Activity Isolation Management System**  
> Built for High-Hazard Industrial Facilities (Oil & Gas, Chemical Manufacturing, Power Generation, Heavy Infrastructure)  
> Compliant with **OSHA 1910** (General Industry), **OSHA 1926** (Construction), and **ISO 45001** Occupational Health and Safety Management Systems.

---

## 📑 Table of Contents

1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Key System Features](#-key-system-features)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Database Design & Entity Relationships](#-database-design--entity-relationships)
6. [Shared Permit Model & JSONB Technical Rationale](#-shared-permit-model--jsonb-technical-rationale)
7. [Permit Lifecycle State Machine](#-permit-lifecycle-state-machine)
8. [Role-Based Access Control (RBAC) Matrix](#-role-based-access-control-rbac-matrix)
9. [Safety & Security Guardrails](#-safety--security-guardrails)
10. [Step-by-Step Local Setup Guide](#-step-by-step-local-setup-guide)
11. [Environment Variables](#-environment-variables)
12. [Demo User Credentials](#-demo-user-credentials)
13. [REST API Documentation](#-rest-api-documentation)
14. [Automated Testing Guide](#-automated-testing-guide)
15. [Production Deployment Guide](#-production-deployment-guide)
16. [Design Decisions & Trade-offs](#-design-decisions--trade-offs)
17. [AI Usage Disclosure](#-ai-usage-disclosure)
18. [Future Roadmap (What I Would Build Next)](#-future-roadmap-what-i-would-build-next)
19. [Known Limitations](#-known-limitations)

---

## 🎯 Executive Summary & Problem Statement

In heavy process industries, catastrophic industrial incidents (such as the *Piper Alpha* offshore platform disaster or the *Texas City Refinery* explosion) often trace back to breakdowns in **Permit-to-Work (PTW)** and isolation workflows:
- **Paper-based and disconnected permit systems** result in incomplete hazard reviews and missing authorization sign-offs.
- **Concurrent hazardous operations (SIMOPS)**: Performing Hot Work (welding/cutting) adjacent to a Confined Space venting flammable gases or volatile hydrocarbons without cross-permit conflict detection creates fatal explosion risks.
- **Unauthorized self-approvals**: Supervisors requesting high-urgency maintenance often self-authorize permits to avoid production downtime, breaking the fundamental safety principle of four-eyes verification.
- **Permit sprawl & zombie permits**: Work extending past authorized shifts or expired atmospheric testing windows without formal re-validation.
- **Unverified handovers & closeouts**: Equipment returned to service while isolation padlocks (LOTO) are still applied or tools remain unaccounted for inside closed vessels.

**Permit-IQ** addresses these critical safety challenges through an auditable, role-governed digital permit engine enforcing strict state transitions, spatial-temporal conflict detection, independent two-stage sign-offs, and an immutable compliance audit trail.

---

## ✨ Key System Features

- 🔐 **Real JWT Authentication & Role-Based Access Control (RBAC)**: Secure authentication with bcrypt password hashing and token-based state persistence. Unauthenticated requests are immediately rejected at the API gateway.
- 📋 **Dynamic Multi-Step Permit Wizard**: 5-step guided wizard powered by React Hook Form and Zod validation:
  1. *Classification*: Permit type selection across high-hazard categories.
  2. *Operational Scope*: Plant, process area, equipment tag, contractor team, and scheduled validity window.
  3. *Technical Questionnaire*: Context-aware dynamic fields tailored to the selected hazard type.
  4. *Hazards & Mitigations*: Multi-hazard checklist, mandatory PPE selector, and special precautions.
  5. *Review & SIMOPS Conflict Audit*: Live conflict engine warns operators of overlapping high-risk tasks before submission.
- ⚡ **5 High-Hazard Permit Categories Supported**:
  - `HOT_WORK`: Welding, cutting, grinding, fire watch assignments, spark shields, atmospheric combustible gas checks (LEL %).
  - `CONFINED_SPACE`: Oxygen level (19.5%–23.5%), toxic gas levels ($H_2S$, $CO$), ventilation protocols, rescue tripod, standby attendant.
  - `WORKING_AT_HEIGHT`: Elevated work ($> 1.8m$), scaffold tagging & inspection, fall arrest harnesses, drop-zone barricading.
  - `ELECTRICAL_LOTO`: Lockout/Tagout zero-energy isolation, voltage ratings, lockbox numbers, test-dead verifications.
  - `EXCAVATION` *(Extensible)*: Trench shoring, underground utility scanning, soil classification, access ladder protocols.
- 🔄 **Strict Deterministic State Machine**: 10 distinct operational states governed by a non-bypassable transition graph (`permitStateMachine.ts`). Direct status tampering via generic update endpoints is strictly prohibited.
- ⏰ **Dual Auto-Expiry Engine**:
  - *Active Daemon*: Server-side background worker running every 60 seconds automatically transitioning expired active/approved permits to `EXPIRED`.
  - *Lazy Evaluation*: Every permit lookup lazily evaluates the scheduled validity window against current plant time, ensuring no stale permits ever appear active in the UI.
- 🛡️ **Four-Eyes Multi-Stage Authorization**:
  - Requires independent sign-offs from both **Area Owner** (process boundary verification) and **Safety Officer** (EHS mitigation verification).
  - Enforces a strict **Anti-Self-Approval Guardrail**: Requesters are blocked from approving their own permits even if they possess administrative credentials.
  - Rejections require a mandatory written justification recorded in the permanent audit trail.
- 🏁 **Two-Stage Verified Closeout Workflow**:
  - *Stage 1 (Requester)*: Site cleanup, housekeeping, isolation removal, and tool accounting recorded in completion notes.
  - *Stage 2 (Safety Officer)*: Physical site walkdown, verification of equipment handover, and final sign-off into `CLOSED_VERIFIED`.
- 📜 **Tamper-Evident Immutable Audit Log**: Every lifecycle state transition, approval, rejection, suspension, and verification is permanently recorded in `PermitAuditLog` with actor ID, timestamp, before/after values, and notes. The application service layer exposes only append and read operations.
- 📊 **Real-Time Operational Command Dashboard**: High-contrast industrial UI featuring KPI metric counters, active countdown timers, expiring soon warnings ($< 2h$), and real-time status and type filters.
- 📱 **Field QR Badge Verification**: Instant QR code modal for mobile scanning and on-site physical permit verification by field safety auditors.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, React Hook Form, Zod, Axios, Lucide React |
| **Backend** | Node.js (v18+), Express 4, TypeScript 5, Prisma ORM 6, PostgreSQL 14+ (Native JSONB), Zod 4, bcryptjs, jsonwebtoken, CORS |
| **Testing** | Vitest 4, Supertest 7, Playwright E2E Test Suite |
| **Tooling & Dev** | TSX, Nodemon, ESLint, Git, Embedded PostgreSQL Runner |

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 19 + TypeScript + Vite)"]
        UI["Industrial UI / Tailwind CSS"]
        AuthCtx["AuthContext (JWT Token & State)"]
        Router["React Router (Protected Routes)"]
        FormWizard["5-Step Permit Wizard (React Hook Form + Zod)"]
        Dashboard["Command Dashboard (Live Counters & Countdowns)"]
        QRModal["Field QR Badge Generator"]
    end

    subgraph API["Backend API Gateway (Node.js + Express + TypeScript)"]
        Logger["HTTP Request Logger & CORS"]
        AuthMW["requireAuth & requireRole Middleware"]
        Controller["Thin Express Controllers"]
        Validator["Zod Runtime Validators"]
    end

    subgraph Services["Core Business Services Layer"]
        AuthSvc["AuthService (JWT, bcrypt, User Context)"]
        StateMach["PermitStateMachine (Enforced Transitions)"]
        PermitSvc["PermitService (CRUD, Conflict Engine, Multi-Stage Approvals)"]
        AuditSvc["AuditService (Append-Only Immutable Logs)"]
        ExpiryDaemon["Background Auto-Expiry Daemon (60s Cron)"]
    end

    subgraph Storage["PostgreSQL Database (Relational + JSONB)"]
        Users["User Table (RBAC Roles)"]
        Plants["Plant / Area / Equipment Tables"]
        Permits["Permit Table (Relational Core + typeSpecificData JSONB)"]
        Approvals["PermitApproval Table (Multi-Stage Sign-Offs)"]
        AuditLogs["PermitAuditLog Table (Immutable Audit Trail)"]
        Indexes["B-Tree Indexes (Status, Type, Area, Times, Requester)"]
    end

    UI --> Router
    Router --> AuthCtx
    AuthCtx --> FormWizard
    AuthCtx --> Dashboard
    Dashboard --> QRModal

    FormWizard -->|Axios REST (Bearer Token)| API
    Dashboard -->|Axios REST (Bearer Token)| API

    API --> Logger
    Logger --> AuthMW
    AuthMW --> Validator
    Validator --> Controller

    Controller --> AuthSvc
    Controller --> PermitSvc
    PermitSvc --> StateMach
    PermitSvc --> AuditSvc
    ExpiryDaemon -->|Check Validity Windows| PermitSvc

    AuthSvc --> Users
    PermitSvc --> Permits
    PermitSvc --> Approvals
    PermitSvc --> Plants
    AuditSvc --> AuditLogs
    Permits --- Indexes
```

---

## 🗄️ Database Design & Entity Relationships

The system utilizes a relational PostgreSQL database engineered with strict integrity constraints, foreign key cascades, and high-performance B-tree indexing:

```mermaid
erDiagram
    Plant ||--o{ Area : contains
    Area ||--o{ Equipment : houses
    Plant ||--o{ Permit : locates
    Area ||--o{ Permit : partitions
    Equipment ||--o{ Permit : isolates
    User ||--o{ Permit : requests
    User ||--o{ PermitApproval : authorizes
    User ||--o{ PermitAuditLog : performs
    Permit ||--o{ PermitApproval : requires
    Permit ||--o{ PermitAuditLog : records

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        enum role "REQUESTER | AREA_OWNER | SAFETY_OFFICER | ADMIN"
        string areaId FK
        datetime createdAt
        datetime updatedAt
    }

    Plant {
        string id PK
        string name
        string code UK
        datetime createdAt
        datetime updatedAt
    }

    Area {
        string id PK
        string name
        string plantId FK
        datetime createdAt
        datetime updatedAt
    }

    Equipment {
        string id PK
        string name
        string equipmentTag UK
        string areaId FK
        datetime createdAt
        datetime updatedAt
    }

    Permit {
        string id PK
        string permitNumber UK
        enum type "HOT_WORK | CONFINED_SPACE | WORKING_AT_HEIGHT | ELECTRICAL_LOTO | EXCAVATION"
        enum status "DRAFT | PENDING_APPROVAL | APPROVED | ACTIVE | SUSPENDED | EXPIRED | REJECTED | CLOSED | CLOSED_VERIFIED | CANCELLED"
        string requesterId FK
        string contractorTeam
        string workDescription
        string plantId FK
        string areaId FK
        string equipmentId FK
        datetime plannedStart
        datetime plannedEnd
        stringArray hazards
        stringArray ppeRequired
        string precautions
        jsonb typeSpecificData "Dynamic Hazard Questionnaire"
        string completionNotes
        string verificationComment
        datetime closedAt
        datetime verifiedAt
        datetime createdAt
        datetime updatedAt
    }

    PermitApproval {
        string id PK
        string permitId FK
        string approverId FK
        enum role "AREA_OWNER | SAFETY_OFFICER | ADMIN"
        enum status "APPROVED | REJECTED"
        string comment
        string rejectionReason
        datetime approvedAt
        datetime createdAt
        datetime updatedAt
    }

    PermitAuditLog {
        string id PK
        string permitId FK
        string whoId FK
        string action
        datetime timestamp
        string fromValue
        string toValue
        string comment
    }
```

### High-Performance Indexing Strategy
To guarantee sub-millisecond query responses across thousands of concurrent permits:
- `@@index([status])`: Instant filtering by workflow stage (e.g. `ACTIVE`, `PENDING_APPROVAL`).
- `@@index([type])`: Rapid classification filtering for safety audits.
- `@@index([areaId])` & `@@index([plantId])`: Real-time spatial queries and SIMOPS conflict checking.
- `@@index([plannedStart])` & `@@index([plannedEnd])`: Time-window overlap calculations and auto-expiry daemon sweeps.
- `@@index([requesterId])`: Instant loading of personal work queues.
- `@@index([status, type])`: Compound index powering high-throughput dashboard statistics.

---

## 💡 Shared Permit Model & JSONB Technical Rationale

### The Core Architectural Dilemma
In industrial PTW systems, each hazard category requires wildly different safety questionnaires:
- **Hot Work** requires fire watch identity, combustible clearance radii, and explosive gas percentages ($LEL\%$).
- **Confined Space** requires multi-gas testing ($O_2, LEL, H_2S, CO$), standby attendants, and rescue tripods.
- **Electrical LOTO** requires isolation points, voltage ratings, lockbox numbers, and zero-energy checks.
- **Working at Height** requires scaffolding inspection tags, anchor point checks, and fall-arrest harnesses.

### Why NOT 4 Separate Tables?
1. **Query Fragmentation**: Displaying a unified plant dashboard would require cross-table `UNION` operations across four or more tables with disparate columns.
2. **Duplication of Core Workflows**: Approval hierarchies, audit trails, status lifecycles, validity windows, and emergency cancelations are 100% identical regardless of hazard category.
3. **Rigid Schema Evolution**: Adding a 5th permit type (such as `EXCAVATION` or `RADIATION_WORK`) would require writing database DDL migrations, altering foreign key constraints, and rewriting backend controllers.

### The Chosen Solution: Hybrid Relational Core + PostgreSQL JSONB
We implement a **Single Shared `Permit` Entity** combining:
1. **Relational Core**: High-frequency operational attributes (`permitNumber`, `status`, `type`, `plantId`, `areaId`, `equipmentId`, `requesterId`, `plannedStart`, `plannedEnd`, `hazards`, `ppeRequired`) remain strictly typed relational columns with foreign key integrity.
2. **Semi-Structured Extension (`typeSpecificData` JSONB)**: Houses the hazard-specific technical answers in PostgreSQL native JSONB.
3. **Application-Layer Zod Validation**: Zod discriminators in `backend/src/validators/permit.ts` enforce strict runtime schemas for each type before any data reaches the database.

> [!TIP]
> **Extensibility Demonstrated**: The codebase already includes full end-to-end support for a 5th permit type (`EXCAVATION`), demonstrating how new hazard categories are added in minutes without altering database schemas or breaking existing data.

---

## 🔄 Permit Lifecycle State Machine

The Permit-IQ lifecycle is governed by a strictly validated state machine (`backend/src/services/permitStateMachine.ts`). Direct modification of permit status via generic `PATCH` endpoints is strictly prohibited.

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Create Permit

    DRAFT --> PENDING_APPROVAL : Submit for Authorization
    DRAFT --> CANCELLED : Cancel Draft

    PENDING_APPROVAL --> APPROVED : Area Owner + Safety Officer Sign-Off
    PENDING_APPROVAL --> REJECTED : Approver Rejection with Reason
    PENDING_APPROVAL --> CANCELLED : Requester Cancels
    PENDING_APPROVAL --> EXPIRED : Validity Window Passed

    APPROVED --> ACTIVE : Requester Activates at Site (Within Planned Window)
    APPROVED --> CANCELLED : Work Cancelled
    APPROVED --> EXPIRED : Window Expired Before Activation

    ACTIVE --> SUSPENDED : Weather, Emergency, or Gas Alarm
    ACTIVE --> CLOSED : Requester Completes & Cleans Site
    ACTIVE --> EXPIRED : Reaches Planned End Time

    SUSPENDED --> ACTIVE : Safety Re-Check Completed
    SUSPENDED --> CANCELLED : Emergency Shutdown

    CLOSED --> CLOSED_VERIFIED : Safety Officer Walkdown Verification

    REJECTED --> [*]
    CANCELLED --> [*]
    EXPIRED --> [*]
    CLOSED_VERIFIED --> [*]
```

### State Transition Matrix & Access Rules

| From State | Event / Action | Target State | Authorized Roles | Enforced Preconditions & Safety Guards |
| :--- | :--- | :--- | :--- | :--- |
| *New* | `CREATE` | `DRAFT` | `REQUESTER`, `ADMIN` | Validates plant, area, equipment, planned window, and Zod type schema. |
| `DRAFT` | `SUBMIT` | `PENDING_APPROVAL` | `REQUESTER`, `ADMIN` | Requester must own permit. Mandatory safety mitigations must be completed. |
| `DRAFT` | `CANCEL` | `CANCELLED` | `REQUESTER`, `ADMIN` | Permitted only by permit owner or admin. |
| `PENDING_APPROVAL` | `APPROVE` | `APPROVED` | `AREA_OWNER`, `SAFETY_OFFICER`, `ADMIN` | **Anti-Self-Approval guard** (`requesterId !== approverId`). Area Owner must match permit `areaId`. Requires both roles before transitioning to `APPROVED`. |
| `PENDING_APPROVAL` | `REJECT` | `REJECTED` | `AREA_OWNER`, `SAFETY_OFFICER`, `ADMIN` | **Mandatory rejection reason**. Terminal state. |
| `PENDING_APPROVAL` | `CANCEL` | `CANCELLED` | `REQUESTER`, `ADMIN` | Requester withdraws application. |
| `APPROVED` | `ACTIVATE` | `ACTIVE` | `REQUESTER`, `ADMIN` | Work start verification. Must be within `plannedStart` and `plannedEnd`. |
| `ACTIVE` | `SUSPEND` | `SUSPENDED` | Any Authenticated Role | Emergency, bad weather, or gas alarm. Requires reason. |
| `SUSPENDED` | `RESUME` | `ACTIVE` | `AREA_OWNER`, `SAFETY_OFFICER`, `ADMIN` | Site re-inspection complete. Must not be expired. |
| `ACTIVE` | `CLOSE` | `CLOSED` | `REQUESTER`, `ADMIN` | **Stage 1 Closeout**: Site cleaned, tools accounted for, completion notes required. |
| `CLOSED` | `VERIFY_CLOSURE` | `CLOSED_VERIFIED` | `SAFETY_OFFICER`, `ADMIN` | **Stage 2 Closeout**: Physical inspection by EHS officer, verification notes required. |
| `PENDING / APPROVED / ACTIVE` | `AUTO_EXPIRE` | `EXPIRED` | System Daemon / Lazy Check | Triggered automatically when current time exceeds `plannedEnd`. |

---

## 👥 Role-Based Access Control (RBAC) Matrix

| Operational Capability | Requester | Area Owner | Safety Officer | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| **Create Permit Draft** | ✅ | ❌ | ❌ | ✅ |
| **Edit Permit Draft** | ✅ *(Own only)* | ❌ | ❌ | ✅ |
| **Submit Permit for Sign-off** | ✅ *(Own only)* | ❌ | ❌ | ✅ |
| **Authorize Area Boundary** | ❌ | ✅ *(Assigned area)* | ❌ | ✅ |
| **Authorize Safety Mitigations** | ❌ | ❌ | ✅ | ✅ |
| **Self-Approve Own Permit** | 🚫 **FORBIDDEN** | 🚫 **FORBIDDEN** | 🚫 **FORBIDDEN** | 🚫 **FORBIDDEN** |
| **Activate Approved Permit** | ✅ *(Own only)* | ❌ | ❌ | ✅ |
| **Emergency Suspend Work** | ✅ | ✅ | ✅ | ✅ |
| **Authorize Work Resumption** | ❌ | ✅ | ✅ | ✅ |
| **Stage 1 Closeout (Housekeeping)** | ✅ *(Own only)* | ❌ | ❌ | ✅ |
| **Stage 2 Closeout Verification** | ❌ | ❌ | ✅ | ✅ |
| **View Audit Trail & Timeline** | ✅ | ✅ | ✅ | ✅ |
| **Manage Plants & Assets** | ❌ | ❌ | ❌ | ✅ |

---

## 🛡️ Safety & Security Guardrails

### 1. Anti-Self-Approval Enforcement
The system mathematically prevents a requester from approving their own permit:
```typescript
if (permit.requesterId === user.userId) {
  throw new AppError(
    403,
    'SELF_APPROVAL_FORBIDDEN',
    'Safety Violation: You cannot approve a permit you requested. Independent verification is required.'
  );
}
```

### 2. Area Boundary Isolation
Area Owners are assigned to specific process areas (e.g., Catalytic Cracker Unit, High Voltage Substation). An Area Owner attempting to approve a permit outside their jurisdiction is blocked:
```typescript
if (user.role === UserRole.AREA_OWNER && user.areaId && permit.areaId !== user.areaId) {
  throw new AppError(
    403,
    'AREA_MISMATCH',
    `Area Owner can only approve permits for their assigned area (${user.areaId})`
  );
}
```

### 3. Regulatory Immutability of Audit Trails
Under OSHA 1910 and ISO 45001 compliance standards:
- The `PermitAuditLog` table records every lifecycle event (`action`, `whoId`, `timestamp`, `fromValue`, `toValue`, `comment`).
- The application service layer (`AuditService`) **only implements `create` and `findMany`**.
- Any attempt to issue `UPDATE` or `DELETE` on audit records is completely unsupported.

### 4. Direct Status Tampering Protection
Clients cannot manipulate permit status or bypass approvals by sending `{ "status": "ACTIVE" }` via `PATCH /api/permits/:id`. The controller explicitly strips and forbids status modifications via generic updates.

---

## 🚀 Step-by-Step Local Setup Guide

Follow these instructions to run the entire stack on a clean machine from scratch:

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** (v14+ running on port 5432, or a hosted database such as Neon / Supabase)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/kamxsh-24/Permit-IQ.git
cd Permit-IQ
```

---

### Step 2: Backend Setup & Database Initialization

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Ensure `backend/.env` contains your PostgreSQL connection string:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/ptw_cmms?schema=public"
JWT_SECRET="super-secret-jwt-key-ptw-cmms-production-grade-256bit"
JWT_EXPIRES_IN="8h"
CORS_ORIGIN="http://localhost:5173"
```

Apply migrations and populate the database with seed data:
```bash
# Apply Prisma migrations
npm run prisma:migrate

# Seed database with users, plants, equipment, and realistic permits
npm run prisma:seed

# Build backend TypeScript
npm run build

# Start the backend server
npm run dev
```
The backend API will start at `http://localhost:5000`.  
Verify health by visiting: `http://localhost:5000/api/health`

---

### Step 3: Frontend Setup

Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Ensure `frontend/.env` points to the backend API:
```env
VITE_API_URL="http://localhost:5000/api"
```

Start the Vite development server:
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

---

## 🔐 Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | `5000` | Express server port |
| `NODE_ENV` | String | `development` | Runtime environment (`development` / `production` / `test`) |
| `DATABASE_URL` | String | `postgresql://...` | PostgreSQL connection string |
| `JWT_SECRET` | String | *(Random string)* | Cryptographic secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | String | `8h` | Token expiration duration |
| `CORS_ORIGIN` | String | `http://localhost:5173` | Allowed origin for frontend client requests |

### Frontend Configuration (`frontend/.env`)

| Variable | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | String | `http://localhost:5000/api` | Base URL for backend REST API |

---

## 👤 Demo User Credentials

The database seed provides four pre-configured accounts representing all operational roles. The login page also features **1-Click Demo Fast-Login buttons**:

| Operational Role | User Name | Email Address | Password | Jurisdiction / Scope |
| :--- | :--- | :--- | :--- | :--- |
| **`REQUESTER`** | Alex Miller | `requester@safework.com` | `Password123!` | Submits and executes permits |
| **`AREA_OWNER`** | Marcus Vance | `areaowner@safework.com` | `Password123!` | Operations superintendent (Catalytic Cracker Area) |
| **`SAFETY_OFFICER`** | Sarah Jenkins | `safety@safework.com` | `Password123!` | Plant EHS safety officer |
| **`ADMIN`** | David Sterling | `admin@safework.com` | `Password123!` | Plant-wide administrator |

---

## 📡 REST API Documentation

All secured endpoints require the HTTP header: `Authorization: Bearer <JWT_TOKEN>`.

### Authentication Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT token & user profile |
| `GET` | `/api/auth/me` | Authenticated | Returns current authenticated user context and assigned area |

### Facility & Asset Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/plants` | Authenticated | Lists all industrial plants |
| `GET` | `/api/areas` | Authenticated | Lists process areas (optional filter by `plantId`) |
| `GET` | `/api/equipment` | Authenticated | Lists tagged equipment (optional filter by `areaId`) |

### Permit Management Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/permits` | `REQUESTER`, `ADMIN` | Creates a new permit in `DRAFT` state |
| `GET` | `/api/permits` | Authenticated | Paginated permit registry with `status`, `type`, `areaId`, `search` filters |
| `GET` | `/api/permits/stats` | Authenticated | Aggregated KPI statistics for operational dashboard |
| `GET` | `/api/permits/conflicts` | Authenticated | Spatial-temporal SIMOPS conflict detection for an area & time window |
| `GET` | `/api/permits/:id` | Authenticated | Complete permit details with approvals and audit history |
| `PATCH` | `/api/permits/:id` | `REQUESTER`, `ADMIN` | Updates draft permit fields (strictly protects status from manual tampering) |

### Lifecycle State Machine Endpoints
| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/permits/:id/submit` | `REQUESTER`, `ADMIN` | Submits draft for authorization: `DRAFT -> PENDING_APPROVAL` |
| `POST` | `/api/permits/:id/approve` | `AREA_OWNER`, `SAFETY_OFFICER`, `ADMIN` | Signs off permit. Both roles required to reach `APPROVED` |
| `POST` | `/api/permits/:id/reject` | `AREA_OWNER`, `SAFETY_OFFICER`, `ADMIN` | Rejects permit with mandatory justification: `-> REJECTED` |
| `POST` | `/api/permits/:id/activate` | `REQUESTER`, `ADMIN` | Commences site work: `APPROVED -> ACTIVE` |
| `POST` | `/api/permits/:id/suspend` | All Authenticated | Emergency hold due to hazard/weather: `ACTIVE -> SUSPENDED` |
| `POST` | `/api/permits/:id/resume` | `AREA_OWNER`, `SAFETY_OFFICER`, `ADMIN` | Reauthorizes work after re-inspection: `SUSPENDED -> ACTIVE` |
| `POST` | `/api/permits/:id/close` | `REQUESTER`, `ADMIN` | Stage 1 Closeout (Housekeeping & isolation removal): `ACTIVE -> CLOSED` |
| `POST` | `/api/permits/:id/verify-closure` | `SAFETY_OFFICER`, `ADMIN` | Stage 2 Closeout (Physical verification): `CLOSED -> CLOSED_VERIFIED` |
| `POST` | `/api/permits/:id/cancel` | `REQUESTER`, `ADMIN` | Cancels permit before commencement: `-> CANCELLED` |

### System & Health Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Verifies service health and PostgreSQL database latency |

---

## 🧪 Automated Testing Guide

The system includes comprehensive automated testing covering authentication, RBAC authorization, state machine transitions, safety boundary constraints, and end-to-end user workflows.

### 1. Run Backend Automated Test Suite
The backend utilizes **Vitest** and **Supertest** executing against an isolated database:
```bash
cd backend
npm test
```

#### Test Suite Summary (23 Passed / 23 Tests)
- `src/__tests__/auth.test.ts`:
  - ✅ Rejects login with invalid credentials (401).
  - ✅ Rejects login for nonexistent user (401).
  - ✅ Successfully logs in valid user and returns signed JWT with role context.
  - ✅ Rejects unauthenticated `/api/auth/me` without Bearer token (401).
  - ✅ Rejects `/api/auth/me` with malformed or tampered token (401).
  - ✅ Returns authenticated profile for valid token.
  - ✅ Rejects role-restricted endpoints when user lacks required role (403).
- `src/__tests__/permit.test.ts`:
  - ✅ Creates `HOT_WORK` permit draft with valid JSONB questionnaire.
  - ✅ Rejects permit creation with missing mandatory fields (400).
  - ✅ Rejects permit creation with planned end time prior to start time (400).
  - ✅ Rejects direct status manipulation via generic PATCH endpoint (400).
  - ✅ Submits permit draft for authorization (`DRAFT -> PENDING_APPROVAL`).
  - ✅ Prevents non-owner requester from submitting another user's draft (403).
  - ✅ **Safety Guardrail**: Strictly forbids requester from approving their own permit (`403 SELF_APPROVAL_FORBIDDEN`).
  - ✅ Prevents duplicate approvals from the same user (400).
  - ✅ Requires both Area Owner and Safety Officer sign-offs to transition to `APPROVED`.
  - ✅ Rejects permit with mandatory justification recorded in audit log (`-> REJECTED`).
  - ✅ Activates permit within valid time window (`APPROVED -> ACTIVE`).
  - ✅ Suspends active permit with reason (`ACTIVE -> SUSPENDED`).
  - ✅ Resumes suspended permit after re-check (`SUSPENDED -> ACTIVE`).
  - ✅ **Stage 1 Closeout**: Requester closes active permit with completion notes (`ACTIVE -> CLOSED`).
  - ✅ **Stage 2 Closeout**: Safety Officer verifies closure (`CLOSED -> CLOSED_VERIFIED`).
  - ✅ **Immutable Audit Trail**: Verifies chronological before/after change history across entire lifecycle.

### 2. Run Frontend End-to-End Specs
The frontend includes a Playwright test spec verifying the entire UI workflow from login to permit submission:
```bash
cd frontend
npx playwright test
```

---

## 🌐 Production Deployment Guide

### Option 1: Managed Database (Neon / Supabase)
1. Provision a free PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the connection pooling connection string (e.g., `postgresql://user:pass@ep-xyz.neon.tech/ptw_cmms?sslmode=require`).
3. Set this connection string as `DATABASE_URL` in your hosting provider.

### Option 2: Backend Deployment (Render / Railway)
1. Connect your GitHub repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Configure environment:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma migrate deploy && npm run build`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `DATABASE_URL`: Your managed PostgreSQL URL
   - `JWT_SECRET`: Secure 256-bit random string
   - `JWT_EXPIRES_IN`: `8h`
   - `CORS_ORIGIN`: Your production frontend domain (e.g. `https://permit-iq.vercel.app`)

### Option 3: Frontend Deployment (Vercel / Netlify)
1. Connect your repository to [Vercel](https://vercel.com).
2. Configure environment:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend API URL (e.g. `https://permit-iq-api.onrender.com/api`)

---

## ⚖️ Design Decisions & Trade-offs

1. **PostgreSQL JSONB vs Separate Tables**:
   - *Decision*: Adopted a single shared `Permit` table with a PostgreSQL `typeSpecificData` JSONB field rather than 4 separate tables.
   - *Trade-off*: Schema is flexible and dashboard queries avoid massive SQL joins, but relational foreign keys inside the JSONB payload cannot be enforced by the database engine directly. We mitigated this by enforcing strict runtime validation through Zod schemas.
2. **Server-Enforced State Machine vs UI Logic**:
   - *Decision*: Centralized all transition rules in `backend/src/services/permitStateMachine.ts`.
   - *Trade-off*: Requires extra round-trips for state checks, but guarantees that malicious API requests, bypass scripts, or curl commands cannot violate safety regulations.
3. **Dual Lazy + Active Auto-Expiry**:
   - *Decision*: Combined an in-process 60-second periodic timer with on-demand lazy expiration during permit queries.
   - *Trade-off*: Lazy checks ensure no client ever sees an expired permit as active even if the cron timer experiences minor jitter. In a horizontally scaled cluster, the cron would transition to a distributed task runner (e.g., BullMQ or pg_cron).

---

## 🤖 AI Usage Disclosure

In compliance with academic and professional transparency guidelines:
- **Architecture & Scaffolding**: Agentic AI pair programming (Google DeepMind Antigravity) was utilized to rapidly prototype boilerplate code, establish Prisma relational schemas, and generate exhaustive Zod validation schemas for all industrial permit types.
- **State Machine & Logic**: The permit state transition graph, anti-self-approval safety guardrails, SIMOPS spatial conflict detection algorithms, and multi-stage sign-off workflows were designed and implemented with continuous automated test verification.
- **Verification**: All 23 backend automated test cases, frontend components, and TypeScript type-checks were verified to execute cleanly with zero errors.

---

## 🔮 Future Roadmap (What I Would Build Next)

1. **Native Offline Mobile App (React Native / PWA)**:
   - Offline-first SQLite synchronization for field technicians working in underground vaults or remote industrial units without cellular reception.
2. **Cryptographic PKI Digital Signatures**:
   - Integrating hardware smart cards (CAC/PIV) or cryptographic signatures (X.509) to provide legally binding non-repudiation for hazardous sign-offs.
3. **IoT Gas Detector Telemetry Ingestion**:
   - Direct MQTT/Bluetooth streaming from multi-gas monitors (e.g., Industrial Scientific / RAE Systems) directly into active Confined Space permits, automatically suspending work if $H_2S$ exceeds 10 ppm.
4. **Interactive 2D/3D Plant GIS Map**:
   - Interactive SVG/Canvas plant plot map displaying live permits color-coded by hazard type, with automatic visual exclusion zones for simultaneous operations.

---

## ⚠️ Known Limitations

- **Single-Node In-Process Expiry Worker**: The background auto-expiry worker runs as a Node.js `setInterval` daemon inside the backend process. In a horizontally scaled multi-container Kubernetes deployment, this would be replaced with `pg_cron` or a Redis-backed BullMQ queue to avoid duplicate processing.
- **Mocked QR Scanner**: The QR code badge generates a valid encoded URL for field verification; mobile scanning uses camera access which requires an HTTPS production context.

---

## 📄 License & Attribution

Permit-IQ is developed for industrial safety compliance under the **MIT License**.  
Engineered for reliable hazard prevention and zero-incident workplaces.
