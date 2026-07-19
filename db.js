const fs = require('fs');
const path = require('path');

const DB_FOLDER = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DB_FOLDER, 'leads.json');
const CONTACTS_FILE = path.join(DB_FOLDER, 'contacts.json');
const REPORTS_FOLDER = path.join(DB_FOLDER, 'reports');

function ensureDatabaseExists() {
  if (!fs.existsSync(DB_FOLDER)) fs.mkdirSync(DB_FOLDER);
  if (!fs.existsSync(REPORTS_FOLDER)) fs.mkdirSync(REPORTS_FOLDER);
  if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, JSON.stringify([]));
  if (!fs.existsSync(CONTACTS_FILE)) fs.writeFileSync(CONTACTS_FILE, JSON.stringify([]));
}

function getAllLeads() {
  ensureDatabaseExists();
  return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
}

function saveLead(lead) {
  ensureDatabaseExists();
  const leads = getAllLeads();
  lead.id = Date.now();
  lead.createdAt = new Date().toISOString();
  lead.contacted = false;
  lead.hasPdf = false;
  leads.unshift(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  return lead;
}

function markLeadContacted(id) {
  const leads = getAllLeads();
  const lead = leads.find(l => l.id === Number(id));
  if (lead) lead.contacted = true;
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

// Saves a base64 PDF to disk and marks the lead as having a PDF attached
function saveLeadPdf(id, base64) {
  ensureDatabaseExists();
  const leads = getAllLeads();
  const lead = leads.find(l => l.id === Number(id));
  if (!lead) return false;
  const filePath = path.join(REPORTS_FOLDER, id + '.pdf');
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
  lead.hasPdf = true;
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  return true;
}

function getLeadPdfPath(id) {
  const filePath = path.join(REPORTS_FOLDER, id + '.pdf');
  return fs.existsSync(filePath) ? filePath : null;
}

function getAllContacts() {
  ensureDatabaseExists();
  return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf-8'));
}

function saveContact(msg) {
  ensureDatabaseExists();
  const contacts = getAllContacts();
  msg.id = Date.now();
  msg.createdAt = new Date().toISOString();
  contacts.unshift(msg);
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
  return msg;
}

module.exports = {
  getAllLeads, saveLead, markLeadContacted,
  saveLeadPdf, getLeadPdfPath,
  getAllContacts, saveContact
};
