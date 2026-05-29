const request = require('supertest');

const fs = require('fs');
const path = require('path');
const db = require('../db');
const app = require('../index');

describe('API Endpoints', () => {
  beforeAll(() => {
    // Clear out tables before running tests to ensure clean state
    db.exec(`
      DELETE FROM files;
      DELETE FROM notifications;
    `);
  });

  describe('GET /api/files', () => {
    it('should return empty list initially', async () => {
      const res = await request(app).get('/api/files');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/notifications', () => {
    it('should return empty list initially', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /api/upload', () => {
    it('should return error if no files uploaded', async () => {
      const res = await request(app).post('/api/upload');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'No files provided' });
    });

    it('should upload a file and create a notification', async () => {
      // Create a dummy file for testing
      const testFilePath = path.join(__dirname, 'test.pdf');
      fs.writeFileSync(testFilePath, 'dummy pdf content');

      const res = await request(app)
        .post('/api/upload')
        .attach('files', testFilePath);

      expect(res.status).toBe(200);
      expect(res.body.files).toHaveLength(1);
      expect(res.body.files[0].original_name).toBe('test.pdf');
      expect(res.body.notification).toBeDefined();
      expect(res.body.notification.message).toBe('1 file(s) uploaded successfully');

      // Cleanup dummy file
      fs.unlinkSync(testFilePath);
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      // Fetch the notification created from the upload test
      const getRes = await request(app).get('/api/notifications');
      expect(getRes.body.length).toBeGreaterThan(0);
      
      const notifId = getRes.body[0].id;

      // Mark it as read
      const patchRes = await request(app).patch(`/api/notifications/${notifId}/read`);
      expect(patchRes.status).toBe(200);
      expect(patchRes.body.is_read).toBe(1);
    });
  });
});
