# Task Management API

This repository contains the backend server for a comprehensive Task Management application. It's built with Node.js, Express, and TypeScript, utilizing a PostgreSQL database with TypeORM. The API supports user authentication, task CRUD operations, real-time updates via WebSockets, notifications, and more.

## Features

- **User Authentication**: Secure user registration and login using JWT (JSON Web Tokens) stored in HttpOnly cookies.
- **Task Management**: Full CRUD (Create, Read, Update, Delete) functionality for tasks.
- **Task Assignment**: Assign tasks to different users.
- **Real-time Collaboration**: Instant updates for task creation, updates, and deletion broadcasted to connected clients using Socket.IO.
- **Notifications**: Real-time notifications for task assignments and status changes.
- **Dashboard**: An endpoint to fetch a summary of tasks (assigned, created, overdue, urgent).
- **Audit Logs**: Track changes to task statuses for accountability.
- **Filtering & Pagination**: Advanced filtering (by status, priority, assignment) and pagination for task lists.
- **Role-based Permissions**: Differentiates between a task's creator and its assignee, granting different update permissions.
- **Containerization**: Docker and Docker Compose support for easy setup and deployment.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Language**: TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.IO
- **Validation**: `class-validator`
- **Containerization**: Docker, Docker Compose
- **Testing**: Jest, ts-jest

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Installation with Docker (Recommended)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/adkood/task-management-server.git
    cd task-management-server
    ```

2.  **Create an environment file:**
    Create a `.env` file in the root of the project and add the necessary environment variables. See the [Environment Variables](#environment-variables) section for details.

3.  **Run with Docker Compose:**
    This command will build the Docker image for the backend, pull the PostgreSQL image, and start both services.
    ```bash
    docker-compose up --build
    ```
    The server will be running on `http://localhost:5000`.

### Manual Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/adkood/task-management-server.git
    cd task-management-server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up PostgreSQL:**
    Ensure you have a running PostgreSQL instance. Create a database for the application.

4.  **Create an environment file:**
    Create a `.env` file in the root and configure it with your database credentials and other settings.

5.  **Run the application:**
    For development with hot-reloading:
    ```bash
    npm run dev
    ```
    For production:
    ```bash
    npm run build
    npm run start
    ```

## Environment Variables

Create a `.env` file in the project root with the following variables.

```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:3000

# Database Configuration
DB_HOST=postgres-db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=task_manager

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key
```
**Note:** When running with Docker Compose, `DB_HOST` should be the name of the Postgres service in `docker-compose.yml` (e.g., `postgres`). When running manually, it should be `localhost` or your database host.

## API Endpoints

All endpoints are prefixed with `/api/v1`. Authentication is required for all routes except `/auth/signup` and `/auth/login`.

### Authentication (`/auth`)
- `POST /signup`: Register a new user.
- `POST /login`: Log in a user and receive an HttpOnly cookie.
- `POST /logout`: Log out the current user.

### Users (`/users`)
- `GET /`: Get a list of all users.
- `GET /me`: Get the profile of the currently authenticated user.
- `PUT /me`: Update the profile of the currently authenticated user.

### Tasks (`/tasks`)
- `POST /`: Create a new task.
- `GET /`: Get a list of tasks with filtering and pagination.
    - Query Params: `page`, `limit`, `status`, `priority`, `sort`, `assignedToMe`, `createdByMe`, `search`
- `PATCH /:id`: Update a task.
- `DELETE /:id`: Delete a task (only available to the creator).
- `GET /me/assigned`: Get tasks assigned to the current user.
- `GET /me/created`: Get tasks created by the current user.
- `GET /overdue`: Get overdue tasks for the current user.

### Notifications (`/notifications`)
- `GET /`: Get all notifications for the current user.
- `GET /unread`: Get the count of unread notifications.
- `PATCH /:id/read`: Mark a specific notification as read.
- `POST /read-all`: Mark all notifications as read.

### Dashboard (`/dashboard`)
- `GET /`: Get a summary of tasks (assigned, created, overdue, urgent) for the dashboard.

### Audit Logs (`/audit`)
- `GET /logs`: Get audit logs for task status changes.
    - Query Params: `taskId`, `page`, `limit`

## Real-time Events (Socket.IO)

The server uses WebSockets for real-time communication. Authenticated users are automatically subscribed to events.

### Server Emitted Events

Clients can listen for these events:

- `notification:new`: A new notification has been created for the user.
- `notification:read`: A notification was marked as read.
- `notification:all-read`: All user's notifications were marked as read.
- `task:created`: A new task has been created.
- `task:updated`: An existing task has been updated.
- `task:deleted`: A task has been deleted.
- `task:assigned-to-you`: A new task has been assigned to the user.

## Running Tests

To run the test suite:

```bash
# Run all tests once 
# Testing( Authentication(login, signup), Updating Tasks, Notifications)
npm test