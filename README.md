# JobConnect 💼⚡
live - https://jobconnect-aman.vercel.app/.

JobConnect is a premium, modern full-stack Job Portal web application built with the MERN/PRN stack (MySQL + Prisma ORM, Express.js, React, Node.js). 

Featuring a highly polished, responsive interface, the platform offers dynamic search query cards, live applicant messaging, dynamic initials badges, and secure role-based access control.

---

## ✨ Features

- **🔐 Robust Auth & Email Verification**: Role-based (Candidate & Recruiter) registration with JWT token management, password resets, and dynamic email verification OTP codes.
- **💼 Controlled Job Posting**: Recruiters can only post job openings for their registered profile company. The backend force-overwrites recruiter details to prevent API request tampering.
- **🗑️ Safe Cascade Deletions**: Deleting a job automatically cleans up all associated chat messages, applicant chat rooms, and application tracking objects to avoid database foreign key conflicts.
- **📊 Real-time Messaging System**: Live interactive chat channels inside candidate applications for instant coordinator communication.
- **🔍 Advanced Unified Search Grid**: Real-time filtering by keyword, location, and job type with zero placeholder clipping and responsive column stacking.
- **🎨 Glassmorphic UI & Animations**: Built using Tailwind CSS, featuring floating glass layout structures, responsive split-column job detail panels, and soft vector animations.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4, Lucide Icons, Axios, React Router Dom
- **Backend**: Node.js, Express.js, Prisma ORM, Nodemailer, Brevo SMTP client
- **Database**: MySQL Server

---

## 🚀 Local Installation & Setup

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/installer/) (Port `3306`)
- [Git](https://git-scm.com/)

---

### Step 1: Database Setup

1. Open your MySQL terminal or Workbench tool.
2. Initialize a new database instance for the project:
   ```sql
   CREATE DATABASE jobportal;
   ```

---

### Step 2: Clone the Repository

```bash
git clone https://github.com/amangirwal/jobconnect.git
cd jobconnect
```

---

### Step 3: Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Create a `.env` file in the `backend/` folder:
   ```env
   # Database connection string
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/jobportal"

   # JWT Auth settings
   JWT_SECRET="your_custom_jwt_signing_secret_here"

   # Server listening port
   PORT=3000
   ```
4. Run Database Migrations using Prisma ORM:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Spin up the backend API server:
   ```bash
   npm run dev
   ```
   The API server will listen on `http://localhost:3000`.

---

### Step 4: Frontend Configuration

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The user interface will be accessible at `http://localhost:5173`.

---

## 📋 Troubleshooting

- **MySQL Database Connection Issue**:
  - Verify that the local MySQL service is active and listening on port `3306`.
  - Double-check database username, password, and port in `backend/.env`'s `DATABASE_URL`.
- **Prisma Client Issues**:
  - Run `npx prisma generate` to rebuild the local Prisma client mappings if database schema changes are made.
- **Port Conflict**:
  - If port `3000` is already in use by another app, you can change the `PORT` key inside `backend/.env`.
