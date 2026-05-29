# DocVault — Document Management Dashboard

A full-stack document management dashboard for uploading, organizing, and managing PDF files with real-time notifications.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)

---

## Features

- **File Upload** — Drag-and-drop + click-to-select PDF uploads (single & bulk) with per-file progress bars
- **Smart Notifications** — Inline progress for ≤3 files; toast banner for bulk (>3 files) with background processing
- **Real-time Updates** — Server-Sent Events (SSE) push notifications when uploads complete, even if you've navigated away
- **Notification Center** — Bell icon with unread badge, dropdown list, mark as read (individual / all), persisted in database
- **File Management** — Sortable file table with download buttons, formatted sizes & dates
- **Dashboard** — Stats cards (total files, storage used, recent uploads) with recent files overview
- **Responsive Design** — Mobile hamburger menu, collapsible sidebar, adapts to all screen sizes

---

## Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| Frontend    | React 19 + Vite 8                    |
| Styling     | Tailwind CSS 3                       |
| Backend     | Node.js + Express 4                 |
| Database    | SQLite via better-sqlite3            |
| Real-time   | Server-Sent Events (SSE)            |
| File Upload | Multer (disk storage)               |
| Icons       | Lucide React                         |
| Toasts      | react-hot-toast                      |

---

## Project Structure

```
sws-ai-hiring-prototype/
├── package.json                  # Root convenience scripts
├── .gitignore
│
├── server/                       # Backend (Express API)
│   ├── package.json
│   ├── index.js                  # API routes, SSE, middleware
│   ├── db.js                     # SQLite setup & table creation
│   ├── uploads/                  # Uploaded PDF files (auto-created)
│   └── data/                     # SQLite database file (auto-created)
│
└── client/                       # Frontend (React + Vite)
    ├── package.json
    ├── vite.config.js            # Proxy /api → localhost:3001
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx              # Entry point
        ├── App.jsx               # Main app with view routing
        ├── index.css             # Tailwind directives + global styles
        ├── context/
        │   └── NotificationContext.jsx  # Global notification state + SSE
        ├── components/
        │   ├── Header.jsx        # Top bar with bell icon
        │   ├── Sidebar.jsx       # Navigation sidebar
        │   ├── Dashboard.jsx     # Stats + recent files
        │   ├── FileUpload.jsx    # Drag-and-drop upload
        │   ├── FileList.jsx      # Sortable file table
        │   └── NotificationDropdown.jsx # Notification list
        └── utils/
            └── helpers.js        # Format utilities
```

---

## Setup & Installation

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### 1. Clone the repository

```bash
git clone https://github.com/ameerarsath/sws-ai-hiring-prototype.git
cd sws-ai-hiring-prototype
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Start the application

Open **two terminal windows**:

**Terminal 1 — Backend (port 3001):**
```bash
cd server
node index.js
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd client
npm run dev
```

### 4. Open in browser

Navigate to **http://localhost:5173**

> The Vite dev server automatically proxies `/api` requests to the Express backend on port 3001.

---

## API Endpoints

| Method  | Endpoint                          | Description                     |
|---------|-----------------------------------|---------------------------------|
| POST    | `/api/upload`                     | Upload one or more PDF files    |
| GET     | `/api/files`                      | List all uploaded files         |
| GET     | `/api/files/:id/download`         | Download a specific file        |
| GET     | `/api/notifications`              | Get all notifications           |
| PATCH   | `/api/notifications/:id/read`     | Mark a notification as read     |
| PATCH   | `/api/notifications/read-all`     | Mark all notifications as read  |
| GET     | `/api/sse`                        | SSE stream for real-time events |

## Testing

The project uses **Jest** for backend API testing and **Vitest** for frontend React component testing.

### Running all tests
From the root directory:
```bash
npm test
```

### Running Backend tests only
```bash
cd server
npm test
```

### Running Frontend tests only
```bash
cd client
npm test
```

---

## Database Schema

**files**
| Column       | Type    | Description          |
|-------------|---------|----------------------|
| id          | TEXT PK | UUID                 |
| filename    | TEXT    | Stored filename      |
| original_name | TEXT  | Original upload name |
| size        | INTEGER | File size in bytes   |
| type        | TEXT    | MIME type            |
| upload_date | TEXT    | ISO 8601 timestamp   |
| path        | TEXT    | Disk path            |

**notifications**
| Column    | Type        | Description           |
|-----------|-------------|-----------------------|
| id        | INTEGER PK  | Auto-increment        |
| message   | TEXT        | Notification text     |
| type      | TEXT        | info / success / error|
| timestamp | TEXT        | ISO 8601 timestamp    |
| is_read   | INTEGER     | 0 = unread, 1 = read  |

---

## Design Decisions

- **XHR over Fetch** for uploads — enables `upload.onprogress` for real-time per-file progress tracking
- **SQLite** — zero-config embedded database, ideal for prototype/assessment; WAL mode enabled for read concurrency
- **SSE over WebSocket** — simpler unidirectional push, perfect for notifications; auto-reconnect built into browser API
- **Multer disk storage** — files persisted with UUID filenames to avoid collisions, original names preserved in database
- **Smart notification threshold (>3 files)** — prevents UI clutter during bulk uploads while maintaining visibility

---

## License

This project was built as a hiring assessment prototype.
