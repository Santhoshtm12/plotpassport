const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = "0000"; // change this to your own password

app.use(express.json({ limit: '10mb' })); // limit raised so PDF uploads aren't rejected

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Login required.');
  }
  const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
  const password = decoded.split(':')[1];
  if (password !== ADMIN_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Wrong password.');
  }
  next();
}

app.get('/admin.html', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin.js', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.js'));
});

app.get('/api/leads', requireAdmin, (req, res) => {
  res.json(db.getAllLeads());
});

app.post('/api/leads', (req, res) => {
  const lead = req.body;
  const saved = db.saveLead(lead);
  res.json({ success: true, lead: saved });
});

// Receives the base64 PDF generated in the browser and saves it, tied to a lead
app.post('/api/leads/:id/pdf', (req, res) => {
  const { pdfBase64 } = req.body;
  if (!pdfBase64) return res.status(400).json({ success: false, error: 'No PDF data provided' });
  const ok = db.saveLeadPdf(req.params.id, pdfBase64);
  if (!ok) return res.status(404).json({ success: false, error: 'Lead not found' });
  res.json({ success: true });
});

// Lets the admin download a lead's saved PDF (password protected)
app.get('/api/admin/leads/:id/pdf', requireAdmin, (req, res) => {
  const filePath = db.getLeadPdfPath(req.params.id);
  if (!filePath) return res.status(404).send('No PDF found for this lead.');
  res.download(filePath, 'PlotPassport-Report-' + req.params.id + '.pdf');
});

app.post('/api/leads/:id/contacted', requireAdmin, (req, res) => {
  db.markLeadContacted(req.params.id);
  res.json({ success: true });
});

app.post('/api/contact', (req, res) => {
  const msg = req.body;
  const saved = db.saveContact(msg);
  res.json({ success: true, message: saved });
});

app.get('/api/contacts', requireAdmin, (req, res) => {
  res.json(db.getAllContacts());
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
