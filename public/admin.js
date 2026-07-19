const leadsContainer = document.getElementById("leadsContainer");

function loadLeads() {
  fetch('/api/leads')
    .then(response => response.json())
    .then(leads => {
      if (leads.length === 0) {
        leadsContainer.innerHTML = "<p>No leads yet.</p>";
        return;
      }

      let html = "";

      leads.forEach(lead => {
        const date = new Date(lead.createdAt).toLocaleString();
        const waMessage = encodeURIComponent(
          `Hi ${lead.name}, this is PlotPassport following up on your plot report (Score: ${lead.plotHealthScore}/100). I'm attaching your PDF report here.`
        );

        html += `
          <div class="lead-card">
            <span class="status ${lead.contacted ? 'status-done' : 'status-new'}">
              ${lead.contacted ? 'Contacted' : 'New'}
            </span>
            <h3>${lead.name}</h3>
            <p><strong>State:</strong> ${lead.state}</p>
            <p><strong>Area:</strong> ${lead.area} sq ft</p>
            <p><strong>Type:</strong> ${lead.constructionType}</p>
            <p><strong>Score:</strong> ${lead.plotHealthScore}/100</p>
            <p><strong>Date:</strong> ${date}</p>
            <div class="lead-actions">
              ${lead.hasPdf ? `<a class="pdf-btn" href="/api/admin/leads/${lead.id}/pdf" target="_blank">Download PDF</a>` : `<span style="font-size:12px;color:var(--g3)">PDF not ready</span>`}
              <a class="wa-btn" target="_blank" href="https://wa.me/?text=${waMessage}">WhatsApp</a>
              ${!lead.contacted ? `<button class="done-btn" onclick="markContacted(${lead.id})">Mark Contacted</button>` : ""}
            </div>
            ${lead.hasPdf ? `<p style="font-size:11px;color:var(--g3);margin-top:8px">Tip: download the PDF above, then attach it manually in the WhatsApp chat — WhatsApp links can't auto-attach files.</p>` : ""}
          </div>
        `;
      });

      leadsContainer.innerHTML = html;
    })
    .catch(error => {
      leadsContainer.innerHTML = "<p>Error loading leads.</p>";
      console.error(error);
    });
}

function markContacted(id) {
  fetch(`/api/leads/${id}/contacted`, { method: 'POST' })
    .then(response => response.json())
    .then(() => loadLeads())
    .catch(error => console.error(error));
}

loadLeads();
setInterval(loadLeads, 15000); // auto-refresh so newly generated PDFs show up without a manual reload

const contactsContainer = document.getElementById("contactsContainer");

fetch('/api/contacts')
  .then(response => response.json())
  .then(contacts => {
    if (contacts.length === 0) {
      contactsContainer.innerHTML = "<p>No messages yet.</p>";
      return;
    }

    let html = "";
    contacts.forEach(msg => {
      const date = new Date(msg.createdAt).toLocaleString();
      html += `
        <div class="lead-card">
          <h3>${msg.name}</h3>
          <p><strong>Email:</strong> ${msg.email || "Not provided"}</p>
          <p><strong>Message:</strong> ${msg.message}</p>
          <p><strong>Date:</strong> ${date}</p>
        </div>
      `;
    });
    contactsContainer.innerHTML = html;
  })
  .catch(error => {
    contactsContainer.innerHTML = "<p>Error loading messages.</p>";
    console.error(error);
  });
