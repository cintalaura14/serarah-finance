const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { expect } = require('chai');

process.env.DATA_DIR = 'test-data';
process.env.UPLOAD_DIR = 'test-uploads';

const app = require('../server');

const dataDir = path.join(__dirname, '..', 'test-data');
const storeFile = path.join(dataDir, 'store.json');
const uploadDir = path.join(__dirname, '..', 'test-uploads');

function resetStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(storeFile, JSON.stringify({ transactions: [], notifications: {}, attachments: {} }, null, 2), 'utf-8');
}

before(() => {
  process.env.DATA_DIR = 'test-data';
  process.env.UPLOAD_DIR = 'test-uploads';
  resetStore();
});

after(() => {
  try {
    if (fs.existsSync(storeFile)) fs.unlinkSync(storeFile);
    if (fs.existsSync(dataDir)) fs.rmSync(dataDir, { recursive: true, force: true });
    if (fs.existsSync(uploadDir)) fs.rmSync(uploadDir, { recursive: true, force: true });
  } catch (err) {
    // ignore cleanup errors
  }
});

describe('API Transactions & Notifications', () => {
  beforeEach(() => resetStore());

  it('should expose a real-time event stream endpoint', async () => {
    const server = app.listen(0);
    await new Promise(resolve => server.once('listening', resolve));
    const { port } = server.address();

    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/events`, {
        headers: { Accept: 'text/event-stream' }
      });
      expect(response.headers.get('content-type')).to.include('text/event-stream');

      const reader = response.body.getReader();
      const firstChunk = await reader.read();
      expect(firstChunk.done).to.equal(false);
      const text = Buffer.from(firstChunk.value).toString('utf8');
      expect(text).to.include('connected');
      await reader.cancel();
    } finally {
      await new Promise(resolve => server.close(resolve));
    }
  });

  it('should return health status', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).to.have.property('ok', true);
    expect(res.body).to.have.property('service');
  });

  it('should create a transaction', async () => {
    const payload = {
      division: 'finance',
      type: 'expense',
      amount: 12345,
      description: 'Test transaction',
      date: '2026-08-06'
    };

    const res = await request(app).post('/api/transactions').send(payload).expect(200);
    expect(res.body).to.have.property('ok', true);
    expect(res.body.transaction).to.include({ division: 'finance', type: 'expense', description: 'Test transaction' });
    expect(res.body.transaction).to.have.property('status', 'pending');
    expect(res.body.transaction).to.have.property('id');
  });

  it('should fetch created transaction list', async () => {
    const createRes = await request(app).post('/api/transactions').send({
      division: 'operations',
      type: 'income',
      amount: 1000,
      description: 'Revenue test',
      date: '2026-08-06'
    }).expect(200);

    const listRes = await request(app).get('/api/transactions').expect(200);
    expect(listRes.body.ok).to.equal(true);
    expect(listRes.body.transactions).to.be.an('array').with.lengthOf(1);
    expect(listRes.body.transactions[0]).to.include({ division: 'operations', type: 'income' });
  });

  it('should update decision and create notification', async () => {
    const createRes = await request(app).post('/api/transactions').send({
      division: 'finance',
      type: 'expense',
      amount: 200,
      description: 'Approval test',
      date: '2026-08-06'
    }).expect(200);

    const txId = createRes.body.transaction.id;
    const decisionRes = await request(app)
      .post(`/api/transactions/${txId}/decision`)
      .send({ status: 'approved', note: 'Disetujui.' })
      .expect(200);

    expect(decisionRes.body.ok).to.equal(true);
    expect(decisionRes.body.transaction).to.have.property('status', 'approved');

    const notifRes = await request(app).get('/api/notifications/finance').expect(200);
    expect(notifRes.body.ok).to.equal(true);
    expect(notifRes.body.notifications).to.be.an('array').that.is.not.empty;
    expect(notifRes.body.notifications[0]).to.include({ type: 'decision', status: 'approved' });
  });

  it('should return 404 for unknown transaction decision', async () => {
    await request(app)
      .post('/api/transactions/nonexistent/decision')
      .send({ status: 'approved', note: 'No tx' })
      .expect(404);
  });

  it('should mark notifications as read', async () => {
    const createRes = await request(app).post('/api/transactions').send({
      division: 'finance',
      type: 'expense',
      amount: 300,
      description: 'Notification test',
      date: '2026-08-06'
    }).expect(200);

    const txId = createRes.body.transaction.id;
    await request(app).post(`/api/transactions/${txId}/decision`).send({ status: 'approved' }).expect(200);
    const notifications = (await request(app).get('/api/notifications/finance').expect(200)).body.notifications;
    const notifId = notifications[0].id;

    await request(app).post('/api/notifications/finance/read').send({ notifId }).expect(200);
    const readRes = await request(app).get('/api/notifications/finance').expect(200);
    expect(readRes.body.notifications[0]).to.have.property('read', true);
  });
});
