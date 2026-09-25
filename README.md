# SafePermit CMMS (Permit-IQ)

> **Production-Grade Permit-to-Work (PTW) & Isolation Management Module for Industrial CMMS**
> Compliant with OSHA 1910, OSHA 1926, and ISO 45001 Occupational Health and Safety Standards.

---

## 📌 Architectural Overview

SafePermit CMMS provides an enterprise-ready system to authorize, monitor, and audit hazardous industrial activities (Hot Work, Confined Space Entry, Working at Height, and Electrical LOTO / Zero-Energy isolation).

The application is structured as a decoupled full-stack architecture:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, React Hook Form, Zod, Axios, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (native JSONB dynamic extension), Zod validation.

---

## 🏗️ Database Architecture & Design Decision

### 1. Single Table Inheritance with PostgreSQL JSONB Extension

A critical engineering decision was made regarding permit entity modeling:

#### Why NOT 4 separate permit tables?
Creating distinct tables (`HotWorkPermit`, `ConfinedSpacePermit`, etc.) leads to:
1. **Query fragmentation**: A central dashboard displaying all active plant permits would require complex `UNION` queries across multiple tables with differing schemas.
2. **Duplicated core workflows**: Approval chains, audit logging, status transitions, validity windows, and emergency cancelations are identical across all permits.
3. **Rigid schema evolution**: Introducing a new high-risk permit type (such as `EXCAVATION` or `RADIATION_WORK`) would require writing new database migrations, altering foreign key relationships, and refactoring the API controllers.

#### The Chosen Solution: Hybrid Relational + JSONB Pattern
We utilize **one shared `Permit` relational table** augmented with a PostgreSQL native `typeSpecificData` (`JSONB`) field:

- **Relational Core**: High-frequency operational attributes (`permitNumber`, `status`, `type`, `plantId`, `areaId`, `equipmentId`, `requesterId`, `plannedStart`, `plannedEnd`) are strictly typed columns with foreign key constraints.
- **Dynamic Semi-Structured Extension (`typeSpecificData` JSONB)**: Stores the specific hazard questionnaire and mitigations required for that hazard category:
  - **`HOT_WORK`**: `{ fireWatchName, extinguisherType, gasTestLelPercent, sparkShieldDeployed, continuousVentilation }`
  - **`CONFINED_SPACE`**: `{ oxygenPercent, flammableLelPercent, toxicPpmH2S, toxicPpmCO, standbyPersonName, rescueTripodInspected, forcedAirVentilation }`
  - **`WORKING_AT_HEIGHT`**: `{ workingHeightMeters, scaffoldTagNumber, scaffoldInspectionValid, fullBodyHarnessVerified, dropZoneBarricaded, toolTethersUsed }`
  - **`ELECTRICAL_LOTO`**: `{ isolationPoint, circuitBreakerNumber, lotoLockboxNumber, zeroEnergyStateVerified, padlockAppliedBy, dangerTagNumber }`
  - **Future `EXCAVATION`**: `{ excavationDepthMeters, undergroundUtilitiesScanned, soilType, trenchShoringInstalled, ladderWithin25Feet }`
- **Application-Layer Validation**: Each permit type is validated at runtime using strict **Zod schemas** in `backend/src/validators/permit.ts`.

### 2. High-Performance B-Tree Indexing Strategy
To ensure sub-millisecond query responses in multi-tenant industrial complexes with thousands of active permits, the following indexes are implemented:
- `@@index([status])`: Filter by workflow state (e.g. `ACTIVE`, `PENDING_APPROVAL`).
- `@@index([type])`: Filter by hazard category.
- `@@index([areaId])` & `@@index([plantId])`: Fast spatial partitioning for plant operators.
- `@@index([plannedStart])` & `@@index([plannedEnd])`: Time-range overlap checks and expiration monitoring.
- `@@index([requesterId])`: Personal work queue lookups.
- `@@index([status, type])`: Compound index for dashboard hazard category counters.

### 3. Regulatory Immutability of Audit Trails (`PermitAuditLog`)
Under OSHA 1910 and ISO 45001 compliance standards, permit history logs must be strictly immutable:
- The `PermitAuditLog` table records every lifecycle change (`PERMIT_CREATED`, `STATUS_CHANGED`, `APPROVED`, `REJECTED`, `SUSPENDED`, `CLOSED`).
- The application service layer (`backend/src/services/auditService.ts`) **only implements `create` and `findMany` methods**.
- Any `UPDATE` or `DELETE` operations are strictly disallowed by API design.

---

## 🔐 Demo User Credentials

The database seed provides four pre-configured accounts representing all operational roles:

| Role | User Name | Email Address | Password | Operational Scope |
| :--- | :--- | :--- | :--- | :--- |
| **`REQUESTER`** | Alex Miller | `requester@safework.com` | `Password123!` | Maintenance lead submitting permits |
| **`AREA_OWNER`** | Marcus Vance | `areaowner@safework.com` | `Password123!` | Operations superintendent verifying process boundary |
| **`SAFETY_OFFICER`** | Sarah Jenkins | `safety@safework.com` | `Password123!` | EHS officer approving hazard mitigations |
| **`ADMIN`** | David Sterling | `admin@safework.com` | `Password123!` | Plant administrator configuring plant & equipment |

---

## 🗄️ Database Setup & Migration Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL 14+ (or the pre-bundled local embedded PostgreSQL)

### 1. Configure Environment Variables
Inside `backend/`, verify or create your `.env` file:
```bash
cd backend
cp .env.example .env
```

Default connection string:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/ptw_cmms?schema=public"
CORS_ORIGIN="http://localhost:5173"
```

### 2. Run Database Migrations
```bash
# Validate Prisma schema
npm run prisma:validate

# Apply migrations
npm run prisma:migrate
```

### 3. Seed Database with Initial Industrial Data
Populate 4 users, 2 plants, 6 process areas, 6 critical equipment records, and 11 permits across all statuses:
```bash
npm run prisma:seed
```

### 4. Build and Start Backend Server
```bash
# Build TypeScript
npm run build

# Start production server
npm start

# Or run in development mode with hot reload
npm run dev
```

Health Check Endpoint:
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "data": {
    "service": "Permit-to-Work CMMS Backend",
    "version": "1.0.0",
    "status": "HEALTHY",
    "database": {
      "type": "PostgreSQL",
      "connected": true,
      "latencyMs": 14
    }
  }
}
```

---

## 💻 Frontend Development

```bash
cd frontend
npm install
npm run dev
```
The frontend will launch at `http://localhost:5173`.

---

## 📂 Repository Directory Layout

```
ptw-cmms/
├── backend/
│   ├── prisma/
│   │   ├── migrations/      # Historical Prisma migrations
│   │   ├── schema.prisma    # Relational PostgreSQL schema + JSONB
│   │   └── seed.ts          # Demo users, plants, equipment, permits
│   ├── src/
│   │   ├── config/          # Zod-validated environment config
│   │   ├── controllers/     # Health & operational controllers
│   │   ├── middleware/      # Error handler, request logger
│   │   ├── routes/          # Express API route declarations
│   │   ├── services/        # Prisma client & immutable audit service
│   │   ├── types/           # Domain TypeScript definitions
│   │   ├── utils/           # Structured logger, standardized responses
│   │   ├── validators/      # Zod schemas for permit types
│   │   └── server.ts        # Express app bootstrap & graceful shutdown
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI, Common, Layout components
│   │   ├── pages/           # Dashboard, Permits, Create, Approval, Closure
│   │   ├── routes/          # React Router configuration
│   │   ├── services/        # Axios API client
│   │   ├── types/           # Frontend TypeScript domain types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```
