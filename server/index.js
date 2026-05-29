const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ---------------------------------------------------------------------------
// Ensure uploads directory exists & serve it statically
// ---------------------------------------------------------------------------
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ---------------------------------------------------------------------------
// Multer configuration (disk storage with uuid filenames)
// ---------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage });

// ---------------------------------------------------------------------------
// SSE — Server-Sent Events
// ---------------------------------------------------------------------------
const sseClients = new Set();

/** Broadcast a notification object to every connected SSE client. */
function broadcastNotification(notification) {
  const data = JSON.stringify(notification);
  for (const client of sseClients) {
    client.write(`event: notification\ndata: ${data}\n\n`);
  }
}

app.get('/api/sse', (req, res) => {
  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Send an initial comment so the client knows the connection is alive
  res.write(':connected\n\n');

  // Heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30_000);

  sseClients.add(res);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// POST /api/upload — upload one or more files
app.post('/api/upload', upload.array('files'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const insertFile = db.prepare(
      `INSERT INTO files (id, filename, original_name, size, type, upload_date, path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const insertNotification = db.prepare(
      `INSERT INTO notifications (message, type, timestamp)
       VALUES (?, ?, ?)`
    );

    const now = new Date().toISOString();
    const fileRecords = [];

    const insertAll = db.transaction(() => {
      for (const file of req.files) {
        const id = uuidv4();
        const record = {
          id,
          filename: file.filename,
          original_name: file.originalname,
          size: file.size,
          type: file.mimetype,
          upload_date: now,
          path: file.path,
        };
        insertFile.run(id, record.filename, record.original_name, record.size, record.type, record.upload_date, record.path);
        fileRecords.push(record);
      }

      // One notification for the entire batch
      const message = `${req.files.length} file(s) uploaded successfully`;
      insertNotification.run(message, 'info', now);
    });

    insertAll();

    // Fetch the notification we just created (last inserted)
    const notification = db.prepare(
      'SELECT * FROM notifications ORDER BY id DESC LIMIT 1'
    ).get();

    // Broadcast via SSE
    broadcastNotification(notification);

    return res.json({ files: fileRecords, notification });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /api/files — list all files
app.get('/api/files', (_req, res) => {
  const files = db.prepare('SELECT * FROM files ORDER BY upload_date DESC').all();
  res.json(files);
});

// GET /api/files/:id/download — download a specific file
app.get('/api/files/:id/download', (req, res) => {
  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.id);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.download(file.path, file.original_name);
});

// GET /api/notifications — list all notifications
app.get('/api/notifications', (_req, res) => {
  const notifications = db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC').all();
  res.json(notifications);
});

// PATCH /api/notifications/read-all — mark every notification as read
// (must be registered BEFORE the :id route to avoid "read-all" matching :id)
app.patch('/api/notifications/read-all', (_req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1').run();
  res.json({ success: true });
});

// PATCH /api/notifications/:id/read — mark a single notification as read
app.patch('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
  res.json(notification);
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
