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

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/installer/) (Workbench recommended for easy management)
- [Git](https://git-scm.com/)

## Setup Instructions

Follow these steps to set up and run the project locally.

### 1. Database Setup

1. Open your MySQL terminal or Workbench.
2. Create the database:
   ```sql
   CREATE DATABASE jobportal;
   ```
3. (Optional) Create a specific user or use your existing root user. If creating a new user:
   ```sql
   CREATE USER 'jobuser'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON jobportal.* TO 'jobuser'@'localhost';
   FLUSH PRIVILEGES;
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Create a `.env` file in the `backend` directory.
   - Copy the following content and update `DB_PASSWORD` (and `DB_USER` if different from root):

   ```env
   # Database connection string
   # Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
   DATABASE_URL="mysql://root:password@localhost:3306/jobportal"

   # JWT Secret for authentication
   JWT_SECRET="your_super_secret_key_change_this"

   # Server Port
   PORT=3000
   ```

4. Run Database Migrations (Prisma):
   This will create the necessary tables in your MySQL database.
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the Backend Server:
   ```bash
   npm run dev
   ```
   The server should now be running on `http://localhost:3000`.

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure Environment Variables:
   - The frontend is configured to talk to `http://localhost:3000/api` by default.
   - If your backend runs on a different port, create a `.env` file in `frontend`:
     ```env
     VITE_API_URL=http://localhost:3000/api
     ```

4. Start the Frontend Application:
   ```bash
   npm run dev
   ```
   The application will open at `http://localhost:5173`.

## Troubleshooting

- **Database Connection Error**:
  - Ensure MySQL service is running.
  - Verify credentials in `backend/.env` are correct.
  - Check if the database `jobportal` exists (`SHOW DATABASES;`).

- **Prisma Migration Fails**:
  - Try resetting the prisma client: `npx prisma generate`.
  - Ensure no other process is using port 3306.

- **CORS Errors**:
  - Ensure the backend is running and accessible.
  - Check if the frontend requests are pointing to the correct backend URL.


