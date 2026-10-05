# CCR — Connect, Contribute, Receive

> **"Connect with people. Contribute what you can. Receive what you need."**

CCR is a hyperlocal community assistance and physical resource-sharing platform designed with a unique two-tier credit economy, deterministic AI-based matching and valuation engines, mutual verification, and an Apple/macOS + modern fintech glassmorphic visual identity.

---

## 🌟 Core Philosophy & Innovation

CCR is **not** a generic gig marketplace or rental clone. It operates as a community contribution network where human assistance, skills, time, and physical equipment are exchanged through two separate, audited credit streams:

1. **Cash Credits**: Monetary-value platform credits.
   - Purchased via the simulated **Demo Payment Gateway**.
   - Used for standard assistance requests and physical tool rentals.
   - Earned by fulfilling standard requests.
   - Withdrawable via simulated **Demo Payouts** (UPI / Bank Transfer).
2. **Goodwill Credits**: Special, non-withdrawable community credits.
   - Cannot be purchased, withdrawn, or converted to cash.
   - Awarded when a neighbor helps another for free or lends an idle tool to someone without funds.
   - Spent **first** by default on eligible platform transactions.
   - Protects neighborly dignity and fosters genuine community resilience.

---

## 🚀 Key Features

### 1. Hyperlocal Assistance Requests
- Multi-step request creation wizard with AI-assisted credit valuation.
- Comprehensive request lifecycle: `OPEN` → `MATCHING` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED` → `VERIFICATION_PENDING` → `VERIFIED`.
- Privacy-preserving approximate location zones (exact street addresses are never publicly exposed).

### 2. Physical Resource Sharing
- Catalog of community tools, bicycles, camping gear, camera kits, and appliances.
- Dual borrowing flow: Standard (using Cash/Goodwill credits) or **"Request as Goodwill"** (free for borrower, awards Goodwill Credits to lender upon return).
- Resource lifecycle: `AVAILABLE` → `RESERVED` → `BORROWED` → `RETURN_PENDING` → `RETURN_VERIFIED`.

### 3. AI-Based Matching Engine
- Multi-factor compatibility scoring:
  $$\text{Match Score} = 0.25 \cdot \text{Proximity} + 0.30 \cdot \text{Capability} + 0.15 \cdot \text{Availability} + 0.20 \cdot \text{Reliability} + 0.10 \cdot \text{Suitability}$$
- Transparent, explainable decision factors ("Why?" drawer breaking down skill match, distance zone, and trust history).

### 4. Deterministic AI Valuation Engine
- Computes fair recommended credit compensation based on duration, task complexity, urgency, and local community liquidity.
- Modular architecture ready for future ML model integration.

### 5. Two-Tier Credit Wallet & Immutable Ledger
- Dual balance tracking: Cash Credits vs Goodwill Credits.
- Priority spending rule: Goodwill Credits are automatically spent first when allowed.
- Every balance change records `balanceBefore`, `amount`, `balanceAfter`, and unique reference ID.
- Idempotent settlement prevents double-crediting.

### 6. Simulated Demo Payment & Withdrawal Gateways
- **Demo Payment Gateway**: Realistic test checkout with instant simulated response.
  - **Success Card**: `4242 4242 4242 4242`
  - **Failure Card**: `4000 0000 0000 0002`
- **Demo Withdrawal**: Simulated payout to UPI or Bank Accounts (Cash Credits only; Goodwill is strictly non-withdrawable).

### 7. Administrative Oversight & Governance (`/admin`)
- Role-based authorization (`USER`, `ADMIN`).
- Real-time platform metrics and Recharts analytics for economic circulation.
- User moderation (suspension, credit adjustment with mandatory audit trail).
- Demo withdrawal approval/rejection with mandatory reason.
- Dispute arbitration and permanent audit log (`AdminAuditLog`).

### 8. macOS & Fintech Glassmorphic UI
- Translucent frosted glass panels (`backdrop-filter: blur(20px)`), soft shadows, and subtle traffic-light headers.
- Semantic color coding: **Warm Emerald/Teal** for Goodwill, **Slate/Blue** for Cash/Fintech, and **Indigo** for AI features.
- Global Command Palette: press `Cmd/Ctrl + K` anywhere for instant search and quick actions.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, Framer Motion.
- **Backend**: Node.js, Express.js, TypeScript, Mongoose.
- **Database**: MongoDB (with automatic fallback to `mongodb-memory-server` in development mode if no external `MONGODB_URI` is provided).
- **Authentication**: JWT (JSON Web Tokens) & bcrypt password hashing.

---

## 📁 Project Structure

```
CCR/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── api/client.ts       # API client & endpoints
│   │   ├── components/
│   │   │   ├── ai/             # AI explainability badges
│   │   │   ├── goodwill/       # Goodwill modals & badges
│   │   │   ├── layout/         # Navbar, Sidebar, MobileNav, Layout
│   │   │   ├── payment/        # Demo Payment & Withdrawal modals
│   │   │   └── ui/             # GlassCard, Button, Badge, Modal, CommandPalette, Toast
│   │   ├── context/            # AuthContext & NotificationContext
│   │   ├── pages/              # Landing, Login, Register, Dashboard, Explore, etc.
│   │   ├── types/              # Shared TypeScript definitions
│   │   ├── App.tsx             # Route declarations
│   │   └── main.tsx            # Entrypoint
│   ├── index.html
│   └── package.json
├── server/                     # Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # DB connection & environment
│   │   ├── controllers/        # Express route controllers
│   │   ├── middleware/         # Auth, roles, error handler
│   │   ├── models/             # Mongoose schemas (User, Wallet, Transaction, etc.)
│   │   ├── routes/             # REST API routes
│   │   ├── seed/               # Comprehensive seed script (20+ users, 10+ tools, 15+ tasks)
│   │   ├── services/           # Matching, Valuation, Ledger, Verification services
│   │   └── index.ts            # Server entrypoint
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start & Installation

### 1. Clone & Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cd ../server
cp .env.example .env
```

Default `.env` contents:
```env
PORT=5000
MONGODB_URI=
JWT_SECRET=ccr_community_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
DEMO_PAYMENT_MODE=true
NODE_ENV=development
```

> **Note**: If `MONGODB_URI` is left blank, the server automatically starts an embedded in-memory MongoDB instance. No local MongoDB installation or Docker setup is required!

### 3. Run Backend & Frontend

In two separate terminals:

```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd server
npm run dev
```

```bash
# Terminal 2: Frontend Client (runs on http://localhost:5173)
cd client
npm run dev
```

---

## 🔑 Demo Accounts

The database is automatically pre-seeded with 21 users, 11 physical tools, and 16 assistance requests on first boot. You can log in using any of the following accounts:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ccr.demo` | `Password123!` | Full governance, withdrawal approval, disputes & audit logs |
| **Demo User** | `user@ccr.demo` | `Password123!` | Anmol Sharma (125 Cash Credits, 35 Goodwill Credits) |
| **Contributor** | `contributor@ccr.demo` | `Password123!` | Elena Rostova (180 Cash Credits, 65 Goodwill Credits) |

*(Quick-fill buttons for these accounts are provided directly on the Login page).*

---

## 💳 Demo Payment & Withdrawal Instructions

### Top Up Cash Credits
1. Open your **Wallet** (`/wallet`) and click **Top Up Cash Credits**.
2. Select an amount (e.g., `100 Credits`).
3. To test a **successful payment**, use test card `4242 4242 4242 4242`.
4. To test a **failed payment**, use test card `4000 0000 0000 0002`.
5. Click **Pay**. Your Cash Credit balance updates immediately upon success.

### Withdraw Cash Credits
1. In your **Wallet**, click **Withdraw Cash**.
2. Enter the amount to withdraw and your simulated UPI ID or Bank details.
3. Click **Request Demo Payout**.
4. Log in as **Admin** (`admin@ccr.demo`), navigate to `/admin`, switch to the **Withdrawals** tab, and click **Approve** or **Reject**.

---

## 🤝 The Goodwill Flow Walkthrough

1. **User B** logs in and views the **"DeWalt 20V Cordless Power Drill"** listed by **Elena (Contributor)** for 10 Credits/day.
2. User B clicks **"Request as Goodwill (Free)"**.
3. Elena receives an in-app notification and an elegant **Goodwill Opportunity Modal**:
   > *"💚 Goodwill Opportunity: An applicant would like to use your Power Drill but cannot currently pay the 10-credit cost. You can help them for free. You will receive +10 Goodwill Credits upon verified return."*
4. Elena accepts the request. User B borrows the drill at zero cost.
5. Upon return, Elena confirms safe return. The system idempotently awards Elena **+10 Goodwill Credits**.

---

## 🛡️ Future Roadmap

- Mobile applications (React Native / Expo).
- Real-time WebSocket notifications and live proximity tracking.
- Cryptographic QR code and OTP handshake for physical handovers.
- Upgraded Machine Learning models for geospatial matching and dynamic valuation.
- External payment gateway integration (Stripe / Razorpay).
