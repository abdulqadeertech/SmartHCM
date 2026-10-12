# NovaHCM — Enterprise Human Capital Management Suite

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)

NovaHCM is an original, complete, enterprise-grade multi-tenant Human Capital Management (HCM) application engineered for modern mid-market and enterprise organizations. It covers end-to-end employee lifecycle workflows, precision decimal payroll calculations, biometric punch attendance, holiday-aware leave entitlements, recruitment ATS, performance KPI governance, company asset tracking, HR service ticketing, real-time analytics, and tamper-evident compliance audit trails.

---

## 🌟 Key Architecture & Product Principles

* **Multi-Tenant Data Scoping**: All records are strictly scoped to an `organizationId`. Server-side tenant verification ensures cross-tenant data leakage is impossible.
* **Role-Based Access Control (RBAC)**: Fine-grained permission matrix across 10 distinct enterprise roles:
  1. `PLATFORM_SUPER_ADMIN`
  2. `ORG_ADMIN`
  3. `HR_DIRECTOR`
  4. `HR_MANAGER`
  5. `HR_OFFICER`
  6. `PAYROLL_MANAGER`
  7. `DEPT_MANAGER`
  8. `RECRUITER`
  9. `EMPLOYEE`
  10. `AUDITOR`
* **Real Data Flow & Zero Placeholders**: Every button, modal, punch clock, payroll engine, and KPI chart operates with actual relational database queries and atomic transactions.
* **Decimal-Safe Financial Arithmetic**: Salaries, overtime, taxes, and provident fund deductions avoid floating-point drift and are versioned and locked upon finalization.
* **1-Click Persona Evaluation**: Both the login page and top navigation shell feature instant persona switching to test the platform seamlessly from any role's perspective.

---

## 🏗️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React Router v6 |
| **Backend** | Node.js, Express.js, TypeScript, Zod Schema Validation, JSON Web Tokens (JWT), BCrypt |
| **Database & ORM** | PostgreSQL / SQLite (Zero-config local engine), Prisma ORM v6, Relational Integrity, Foreign Keys |
| **Testing** | Vitest, Supertest integration test suite |
| **DevOps & Infra** | Docker, Docker Compose, Multi-stage Dockerfile |

---

## 📦 Module Coverage

1. **Authentication & Identity**: JWT token issuance, hashed passwords, session restore, 1-click test personas.
2. **Organization Management**: Multi-branch support, department structure, designations/grades, shift definitions.
3. **Employee Directory (Core HR)**: Employee codes, profile provisioning, department assignment, manager hierarchy, privacy-masked compensation records.
4. **Employee Self-Service (ESS)**: Profile viewing, shift monitoring, leave balances, real-time punch terminal, payslip downloads.
5. **Time & Attendance Office**: Live punch clock in/out, grace periods (15 min), late arrivals calculation, half-day detection, attendance correction requests with manager approvals.
6. **Leave Management Engine**: Annual, Sick, and Casual leave allowances, holiday-aware day calculations, balance verification, 1-click approvals with atomic balance updates.
7. **Payroll Engine & Compensation**: Monthly payroll calculation across all active staff, gross earnings, basic pay (50%), allowances (50%), PF deduction (12%), tax withholding (5%), net pay, tamper-evident finalization lock, and printable PDF-ready payslips.
8. **Recruitment & ATS**: Job requisitions, candidate pipeline Kanban/stages (`APPLIED`, `SCREENING`, `INTERVIEW`, `OFFERED`, `HIRED`), rating, and interview links.
9. **Performance & Goal Governance**: Enterprise review cycles, measurable quarterly KPIs with interactive progress sliders.
10. **Company Assets & Equipment**: Hardware register (Laptops, Monitors, Mobile devices) with custodian assignment and status tracking.
11. **HR Help Desk & Service Requests**: Support ticketing with categories, urgency priorities, threaded discussion updates, and status lifecycle.
12. **Analytics & Business Intelligence**: Live aggregated headcount charts, 7-day attendance trends, and authorized CSV report exports.
13. **Compliance & Audit Trail**: Centralized immutable security audit logging of logins, employee provisioning, clock events, and payroll releases.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** >= 20.x
* **npm** >= 10.x

### 1. Installation
Install root, backend, and frontend packages:
```bash
npm run install:all
```

### 2. Database Initialization & Seeding
Push the schema to the database and seed realistic enterprise records:
```bash
cd server
npm run prisma:push
npm run prisma:seed
```

### 3. Run Automated Tests
Execute the comprehensive backend integration test suite:
```bash
cd server
npm run test
```

### 4. Start Development Servers
Start backend API (Port 5000):
```bash
# Terminal 1
cd server
npm run dev
```

Start frontend application (Port 5173):
```bash
# Terminal 2
cd client
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 🔑 Pre-Seeded Demonstration Personas

For immediate, frictionless testing, you can click any of the persona buttons on the Login page or use the top-right header role switcher:

| Role | Email | Password | Primary Workflow |
| :--- | :--- | :--- | :--- |
| **System Super Admin** | `admin@novahcm.io` | `Password123!` | System oversight, full administrative permissions |
| **HR Manager** | `sarah.jenkins@acmeglobal.com` | `Password123!` | Employee directory, leave/attendance approvals, job postings |
| **Payroll Manager** | `david.miller@acmeglobal.com` | `Password123!` | Calculate monthly payroll, finalize runs, manage payslips |
| **Department Manager** | `alex.rivers@acmeglobal.com` | `Password123!` | Manage engineering team, attendance corrections, reviews |
| **Employee (ESS)** | `emily.watson@acmeglobal.com` | `Password123!` | Punch in/out, apply for leave, check payslips, submit tickets |

---

## 🧪 Automated Test Results

The backend integration suite verifies critical business rules:
- **Authentication**: Validates token generation, rejects unauthorized attempts.
- **Tenant Scoping**: Asserts organization boundary enforcement.
- **Privacy Controls**: Tests masking of peer compensation records for standard employees.
- **Leave Calculations**: Rejects leave requests exceeding available balances.
- **Database Aggregation**: Validates dashboard metrics queried directly from SQLite/PostgreSQL.

Run tests anytime with:
```bash
npm run test:server
```

---

## 🐳 Docker Deployment

To launch NovaHCM with PostgreSQL using Docker Compose:
```bash
docker-compose up -d --build
```
This spins up:
1. `novahcm-postgres`: Isolated PostgreSQL 16 database.
2. `novahcm-api`: Production container running the compiled Node.js backend.

---

## 📄 License
This project is an original enterprise software engineering deliverable.
All rights reserved © 2026 NovaHCM Engineering.
