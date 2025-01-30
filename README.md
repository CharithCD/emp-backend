# Leave Management Backend - Employee Management System

## Overview
This is the backend for the Leave Management Module, built using Express.js. It provides a RESTful API for handling user authentication, leave requests, and employee management.

## Features
- User authentication (register, login, logout) with JWT
- Leave request submission, approval, and tracking
- Employee management (CRUD operations)
- Role-based access control (admin & employee)

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Authentication:** JWT (JSON Web Token)
- **Environment Variables:** dotenv
- **CORS Handling:** cors

## Prerequisites
Ensure you have the following installed:
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB (local or cloud instance)

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/CharithCD/emp-backend
   cd backend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Create a `.env` file in the root directory and add the following:**
   ```env
   PORT=8000
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/?retryWrites=true&w=majority&appName=emp
   CORS_ORIGIN=*
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   RESEND_API_KEY=your_resend_api_key
   CLIENT_URL=http://localhost:3000
   ```

## Running the Application Locally

1. **Start the server:**
   ```sh
   npm start
   # or
   yarn start
   ```

2. The server will run at [http://localhost:8000](http://localhost:8000).

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - Logout user (requires JWT)

### Leave Requests
- `GET /api/v1/leaves` - Fetch all leave requests (requires JWT)
- `GET /api/v1/leaves/employee` - Get logged-in employee's leave requests
- `POST /api/v1/leaves/request` - Submit a new leave request
- `PUT /api/v1/leaves/:leaveId/review` - Review leave request (Admin only)

### Employee Management
- `GET /api/v1/employees` - Fetch all employees
- `POST /api/v1/employees` - Create a new employee (Admin only)
- `GET /api/v1/employees/:id` - Get details of a specific employee
- `PUT /api/v1/employees/:id` - Update employee details
- `DELETE /api/v1/employees/:id` - Delete an employee (Admin only)

## Project Structure
```
src/
├── routes/         # Express route handlers
├── controllers/    # Business logic for API endpoints
├── models/         # Mongoose models
├── middleware/     # JWT authentication & access control
├── app.js          # 
├── db/             # Database configurations
├── .env            # Environment variables
├── index.js        # Entry point for the backend
├── README.md       # Project documentation
```
