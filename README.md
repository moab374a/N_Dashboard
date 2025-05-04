## README

This guide will help you set up and run the full stack application, including the backend (PostgreSQL + NodeJS) and the frontend (Angular).

### Prerequisites

* Docker & Docker Compose installed
* Node.js (v18+) and npm installed
* Git (optional, for cloning the repository)

---

### 1. Start the PostgreSQL Database

From the project root directory, run:

```bash
docker-compose up -d
```

This will:

* Spin up the PostgreSQL container
* Create the database and volume for persistent data

---

### 2. Set Up and Run the Backend

1. Navigate to the backend folder (if not already inside):

   ```bash
   cd backend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Initialize and seed the database:

   ```bash
   npm run setup
   npm run seed
   ```
4. Start the development server:

   ```bash
   npm run dev
   ```

The backend server will be running at `http://localhost:5001` (or the port specified in your `.env`).

---

### 3. Install and Configure the Frontend (Angular)

1. Navigate to the frontend folder:

   ```bash
   cd ../frontend
   ```
2. Install Angular CLI as a development dependency:

   ```bash
   npm install --save-dev @angular/cli@19
   ```
3. Install other project dependencies:

   ```bash
   npm install
   ```

---

### 4. Run the Frontend Locally

From the `frontend` directory, run:

```bash
npx ng serve --port 4200
```

Then open your browser and visit:

```
http://localhost:4200
```

---

### Test Credentials

Use the following fake user to log in:

* **Email**: [admin@example.com](mailto:admin@example.com)
* **Password**: password123

---

You're all set! Enjoy developing your application.
