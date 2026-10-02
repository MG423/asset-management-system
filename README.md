# Asset Management System

A full-stack MERN application for tracking company assets, the employees who use them, and their maintenance history. It includes role-based access, a live dashboard, filterable reports with CSV export, and global search.

## Features

- **Authentication and roles:** JWT login, `admin` and `staff` roles, admin-managed user accounts (create, change role, activate/deactivate, reset password)
- **Assets:** full CRUD, search by name, tag, or serial number, filters by status and category, pagination
- **Employees:** full CRUD with search, department and status filters, pagination
- **Assignments:** assign available assets to active employees and record returns, with a full history
- **Maintenance:** send assets for repair, complete records with final cost, and mark assets as available again or retired
- **Dashboard:** live stat cards, asset distribution chart (by category or status), and a recent activity feed
- **Reports:** assets, assignments, and maintenance reports with filters, summaries, and CSV export
- **Global search:** find assets and employees from the top bar on any page
- **Security:** bcrypt password hashing, Helmet headers, rate limiting, Zod input validation, field whitelisting

## Tech Stack

| Layer    | Technology                                                  |
| -------- | ----------------------------------------------------------- |
| Frontend | React, Vite, React Router, Tailwind CSS, Recharts, Axios    |
| Backend  | Node.js, Express, Mongoose, JWT, bcryptjs, Zod, Helmet      |
| Database | MongoDB                                                     |
| Testing  | Node test runner, Supertest                                 |

## Project Structure

```
asset-management-system/
├── client/    # React (Vite) frontend
└── server/    # Express API, models, seed scripts, tests
```

## Getting Started

### Prerequisites

- Node.js 20.19 or newer
- MongoDB running locally (or a MongoDB Atlas connection string)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/MG423/asset-management-system.git
cd asset-management-system
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a file named `.env` inside the `server` folder:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/asset_management
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
```

You can generate a secure `JWT_SECRET` with:

```bash
node -e "import('node:crypto').then(c => console.log(c.randomBytes(32).toString('hex')))"
```

Start the server:

```bash
npm run dev
```

### 3. Set up the client

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`. The Vite dev server proxies `/api` requests to the Express server on port 5000.

### 4. Create the first account

Open `http://localhost:5173/register`. The **first** account to register becomes the admin. After that, registration is closed and admins create accounts from **Settings → User management**.

### 5. Optional: load sample data

```bash
cd server
npm run seed
```

This creates sample assets, employees, assignments, and maintenance records. Re-running it resets only the sample records (sample employees use `@example.com` emails).

## Scripts

**Server** (`cd server`)

| Command         | Description                                 |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Start the API with auto-restart (nodemon)   |
| `npm start`     | Start the API                               |
| `npm run seed`  | Load sample data                            |
| `npm test`      | Run the API test suite                      |

**Client** (`cd client`)

| Command          | Description                    |
| ---------------- | ------------------------------ |
| `npm run dev`    | Start the development server   |
| `npm run build`  | Create a production build      |
| `npm run lint`   | Lint the code                  |

## Testing

```bash
cd server
npm test
```

The tests run against a separate database, `asset_management_test`, which is wiped before and after the run. They refuse to run against any database whose name does not end in `_test`. To use a different test database, set `MONGO_URI_TEST`.

## How It Works

**Asset statuses:** `available`, `assigned`, `maintenance`, `retired`.

- `assigned` and `maintenance` are controlled by the Assignments and Maintenance modules and cannot be set by hand, so statuses always match the underlying records.
- Only an `available` asset can be assigned or sent for maintenance, and an asset can have only one active assignment or open maintenance record at a time (enforced by unique database indexes).
- Assets and employees with assignment or maintenance history cannot be deleted. Mark them `retired` or `inactive` instead.
- Completing maintenance lets you choose the asset's next status: `available` or `retired`.

**Roles**

| Action                                                       | Staff | Admin |
| ------------------------------------------------------------ | :---: | :---: |
| View, add, and edit assets and employees                     |  Yes  |  Yes  |
| Assign and return assets, manage maintenance, view reports   |  Yes  |  Yes  |
| Delete assets, employees, and completed maintenance records  |  No   |  Yes  |
| Manage users                                                 |  No   |  Yes  |

## API Overview

All routes except register and login require a `Bearer` token.

| Route                                   | Purpose                                              |
| --------------------------------------- | ---------------------------------------------------- |
| `POST /api/auth/register`, `/login`     | First-account registration and login                 |
| `GET /api/auth/me`                      | Current user                                         |
| `PUT /api/auth/profile`, `/password`    | Update own profile and password                      |
| `/api/assets`                           | Asset CRUD with search, filters, and pagination      |
| `/api/employees`                        | Employee CRUD with search, filters, and pagination   |
| `/api/assignments`                      | List, assign, and `PATCH /:id/return`                |
| `/api/maintenance`                      | List, create, update, `PATCH /:id/complete`, delete  |
| `GET /api/dashboard`                    | Stats, chart data, and recent activity               |
| `GET /api/reports/assets`               | Assets report (also `/assignments`, `/maintenance`)  |
| `GET /api/search?q=`                    | Global search across assets and employees            |
| `/api/users`                            | User management (admin only)                         |

## Possible Improvements

- Search-as-you-type selectors in the assign and maintenance forms
- Live deployment (for example Render and MongoDB Atlas)
- Screenshots of each module

## Author

Built by [Mehul Ghosh](https://github.com/MG423).