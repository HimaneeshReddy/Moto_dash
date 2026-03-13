# MotoDash

MotoDash is an **AI-powered analytics platform** designed for organizations that manage **multiple motorcycle showrooms**.

It enables owners, managers, and analysts to upload operational datasets, automatically generate dashboards, and track financial performance across showrooms.

MotoDash combines **data ingestion, AI analysis, and customizable dashboards** into a single platform.

---

# Key Features

### Organization Management

* Create organizations with **role-based access control**
* Invite managers and analysts via **email-based onboarding**
* Assign members to specific **showrooms**

### Data Management

* Upload datasets via **CSV**
* Import tables from **external databases**
* Store datasets securely within the organization

### AI Analytics

MotoDash automatically analyzes datasets using **LLM-powered insights**.

The AI generates:

* **3 dashboard charts**
* **5 key insights**
* **Financial classification**

  * Revenue
  * Expenditure
  * Salary

### Dashboard Builder

* Editable dashboard layouts
* Drag-and-drop widgets
* Layout persistence
* Dashboard thumbnail generation

### AI Chat Queries

Users can ask **natural language questions** about the dataset.

Example:

> "What was the highest selling bike last month?"

### Showroom Analytics

* Track showroom-level financial performance
* Aggregate metrics across datasets
* Restrict dashboard access based on assigned showroom

---

# Supported Chart Types

MotoDash supports the following chart types using **Recharts**:

* Bar Chart
* Line Chart
* Area Chart
* Pie Chart
* Scatter Plot
* Radar Chart
* Composed Chart
* Radial Bar Chart
* Treemap

The AI automatically selects the **most suitable chart type** based on:

* Data structure
* Column types
* Aggregation possibilities

---

# Tech Stack

### Frontend

* React
* Vite
* Material UI
* Styled Components
* Recharts

### Backend

* Node.js
* Express
* PostgreSQL
* JWT Authentication
* Multer (file uploads)

### AI Engine

* Ollama
* Default model: **LLaMA 3**

### Infrastructure

* Docker Compose

  * PostgreSQL
  * Ollama

---

# Project Structure

```
MotoDash
│
├── backend
│   ├── routes
│   ├── controllers
│   ├── middleware
│   ├── database
│   └── migrations
│
├── frontend
│   ├── pages
│   ├── components
│   ├── services
│   └── dashboard
```

---

# Local Setup

## 1. Start Infrastructure

From the **backend directory**:

```bash
docker-compose up -d
```

This starts:

* PostgreSQL
* Ollama AI server

---

# 2. Backend Environment Variables

Create:

```
backend/.env
```

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=dashflow

JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173

OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3

FRONTEND_URL=http://localhost:5173

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

---

# 3. Run Backend

```bash
npm install
npm run dev
```

---

# 4. Frontend Environment Variables

Create:

```
frontend/.env
```

```
VITE_API_URL=http://localhost:5000/api
```

---

# 5. Run Frontend

```bash
npm install
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

---

# API Overview

## Authentication Routes

| Method | Endpoint                      |
| ------ | ----------------------------- |
| POST   | /api/auth/create-organization |
| POST   | /api/auth/register            |
| POST   | /api/auth/login               |
| GET    | /api/auth/me                  |
| POST   | /api/auth/support             |

---

## Dataset Routes

| Method | Endpoint                    |
| ------ | --------------------------- |
| POST   | /api/data/upload-csv        |
| POST   | /api/data/db-connect/test   |
| POST   | /api/data/db-connect/import |
| GET    | /api/data/datasets          |
| GET    | /api/data/analyzed          |
| POST   | /api/data/:id/analyze       |
| GET    | /api/data/:id/analysis      |
| GET    | /api/data/:id/rows          |
| POST   | /api/data/:id/rows          |
| PUT    | /api/data/:id/rows/:rowId   |
| DELETE | /api/data/:id/rows/:rowId   |
| PATCH  | /api/data/:id/thumbnail     |
| PATCH  | /api/data/:id/layout        |
| GET    | /api/data/:id/layout        |
| POST   | /api/data/:id/edit-item     |
| POST   | /api/data/:id/insight-query |
| POST   | /api/data/:id/chat          |
| DELETE | /api/data/:id               |

---

## Admin Routes

| Method | Endpoint                        |
| ------ | ------------------------------- |
| GET    | /api/admin/showrooms            |
| POST   | /api/admin/showrooms            |
| PUT    | /api/admin/showrooms/:id        |
| DELETE | /api/admin/showrooms/:id        |
| PATCH  | /api/admin/showrooms/:id/cover  |
| GET    | /api/admin/members              |
| PATCH  | /api/admin/members/:id/showroom |
| DELETE | /api/admin/members/:id          |
| GET    | /api/admin/invites              |
| POST   | /api/admin/invites              |
| DELETE | /api/admin/invites/:id          |
| GET    | /api/admin/requests             |
| POST   | /api/admin/requests/:id/approve |
| POST   | /api/admin/requests/:id/reject  |
| GET    | /api/admin/overview             |

---

# Role Model

### Owner

* Full organization administration
* Cross-showroom analytics access
* Member management

### Manager

* Manage assigned showroom
* View dashboards for that showroom only

### Analyst

* Perform data analysis
* Access dashboards for assigned showroom

---

# Troubleshooting

### Frontend cannot call backend

Verify:

```
VITE_API_URL
CORS_ORIGIN
```

### Authentication fails

Verify:

```
JWT_SECRET
```

### AI analysis fails

Ensure Ollama is running:

```
http://localhost:11434
```
