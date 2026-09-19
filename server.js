import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { fetchLeadData, buildLead, broadcastLeads } from './utils.js';

const app = express();

app.use(express.json());

const leads = [];

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('WS client connected');
  ws.send(JSON.stringify({ type: 'leads', count: leads.length, leads }));
  ws.on('close', () => console.log('WS client disconnected'));
});

const VERIFY_TOKEN = "mysecret123";
const PAGE_ACCESS_TOKEN = "EAAPtpA9gMqsBSnOGVjIR0kzxZA92tHGeN91bTqFBCJvNveskb4JDTZCXfmcwvOxwp1btSGAe4fraPt96ZC49oIeewfQnc3He01QUi2xZBFoIWJzZBIqQ8iJxmjQzU28Q7dyZB5jAM3Xrz0OYYFyfdSnKNsIHW6MwbrInn8kHqBzZCbZANYkEaAZCy3GtALuQXD0FZCZBRZAtWCSmfJM4vfxnjZBNLEWpRUkChEPAFCQqTriUUPTWdxwzdpiCGXrZBnmT23v3IsTPSJDLZC3HXiz9tWuv1VP"

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Verification attempt:', { mode, token });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('Verification failed - token mismatch');
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const body = req.body;
  console.log('Webhook payload received:', JSON.stringify(body, null, 2));

  if (body.object === 'page') {
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value.leadgen_id;
          console.log('New lead ID:', leadgenId);
          try {
            await fetchLeadData(
              leadgenId,
              {
                webhookValue: change.value,
                entryMeta: { id: entry.id, time: entry.time },
              },
              { pageAccessToken: PAGE_ACCESS_TOKEN, leads, wss }
            );
          } catch (err) {
            console.error(`Failed to process lead ${leadgenId}:`, err.message);
          }
        }
      }
    }
  }
});

app.get('/leads', (req, res) => {
  res.json(leads);
});

server.listen(3000, () => console.log('Server listening on port 3000 (HTTP + WS)'));
