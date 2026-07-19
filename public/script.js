const stateData = {
  "Tamil Nadu": { seismicZone: "Zone III", soilType: "Red Soil", floodRisk: "Low" },
  "Kerala": { seismicZone: "Zone III", soilType: "Laterite Soil", floodRisk: "High" },
  "Karnataka": { seismicZone: "Zone II", soilType: "Black Soil", floodRisk: "Low" },
  "Maharashtra": { seismicZone: "Zone III", soilType: "Black Soil", floodRisk: "Medium" },
  "Gujarat": { seismicZone: "Zone V", soilType: "Alluvial Soil", floodRisk: "Medium" }
};

const generateBtn = document.getElementById("generateBtn");

generateBtn.addEventListener("click", function () {
  const name = document.getElementById("userName").value;
  const state = document.getElementById("stateSelect").value;
  const area = document.getElementById("plotArea").value;
  const type = document.getElementById("constructionType").value;

  if (state === "" || name === "" || area === "") {
    alert("Please fill in all fields before generating your report.");
    return;
  }

  const info = stateData[state];
  let score = 70;

  if (info.seismicZone === "Zone V") score -= 20;
  else if (info.seismicZone === "Zone IV") score -= 10;
  else if (info.seismicZone === "Zone III") score -= 5;

  if (info.floodRisk === "High") score -= 15;
  else if (info.floodRisk === "Medium") score -= 8;

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name,
      state: state,
      area: area,
      constructionType: type,
      plotHealthScore: score
    })
  })
  .then(response => response.json())
  .then(data => console.log('Lead saved:', data))
  .catch(error => console.error('Error saving lead:', error));

  const resultBox = document.getElementById("reportResult");

  resultBox.innerHTML = `
    <div class="report-card">
      <h3>Report for ${name}</h3>
      <p class="score">Plot Health Score: <span>${score}/100</span></p>
      <ul>
        <li><strong>State:</strong> ${state}</li>
        <li><strong>Plot Area:</strong> ${area} sq ft</li>
        <li><strong>Construction Type:</strong> ${type}</li>
        <li><strong>Soil Type:</strong> ${info.soilType}</li>
        <li><strong>Seismic Zone:</strong> ${info.seismicZone}</li>
        <li><strong>Flood Risk:</strong> ${info.floodRisk}</li>
      </ul>
    </div>
  `;
});

const contactSubmitBtn = document.getElementById("contactSubmitBtn");

contactSubmitBtn.addEventListener("click", function () {
  const name = document.getElementById("contactName").value;
  const email = document.getElementById("contactEmail").value;
  const message = document.getElementById("contactMessage").value;
  const statusText = document.getElementById("contactStatus");

  if (name === "" || message === "") {
    alert("Please fill in your name and message.");
    return;
  }

  fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, email: email, message: message })
  })
  .then(response => response.json())
  .then(data => {
    statusText.textContent = "Message sent! We'll get back to you soon.";
    document.getElementById("contactName").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactMessage").value = "";
  })
  .catch(error => {
    statusText.textContent = "Something went wrong. Please try again.";
    statusText.style.color = "#EF4444";
    console.error(error);
  });
});