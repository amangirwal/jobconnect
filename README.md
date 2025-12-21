# JobConnect - Job Portal

A full-stack Job Portal application built with the MERN stack (MySQL, Express, React, Node.js).

## Features

- **Authentication**: Role-based (Candidate & Recruiter) signup and login with JWT.
- **Job Posting**: Recruiters can create, update, and delete jobs.
- **Job Listing**: Publicly accessible job board.
- **Applications**: Candidates can apply to jobs; Recruiters can view applications for their posts.
- **Dashboards**: Dedicated dashboards for Candidates (Applied Jobs) and Recruiters (Posted Jobs).
- **Responsive UI**: Built with Tailwind CSS.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Axios, React Router
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: MySQL

## Prerequisites

- Node.js (v18+)
- MySQL Server

## Setup Instructions

### 1. Database Setup
Ensure your MySQL server is running. Create a database named `jobportal` (or update `.env` later).

### 2. Backend Setup

```bash
cd backend
npm install
```

Update `backend/.env` with your database credentials:
```env
DATABASE_URL="mysql://root:password@localhost:3306/jobportal"
JWT_SECRET="your_secret_key"
PORT=3000
```

Run Database Migrations:
```bash
npx prisma migrate dev --name init
```

Start the Backend Server:
```bash
npm run dev
# or
node src/index.js
```
The server will run on `http://localhost:3000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the Frontend Development Server:
```bash
npm run dev
```
The app will open at `http://localhost:5173`.

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (Recruiter)
- `GET /api/jobs/my-jobs` - Get recruiter's jobs
- `DELETE /api/jobs/:id` - Delete job (Recruiter)

### Applications
- `POST /api/applications` - Apply for a job (Candidate)
- `GET /api/applications/my-applications` - Get candidate's applications
- `GET /api/applications/job/:jobId` - Get applications for a job (Recruiter)

## License
ISC
