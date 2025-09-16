const form = document.getElementById("passengerForm");
const seatMap = document.getElementById("seatMap");

// Fetch passengers and display
async function loadPassengers() {
  const res = await fetch("/api/passengers");
  const passengers = await res.json();

  seatMap.innerHTML = "";

  passengers.forEach(p => {
    const card = document.createElement("div");
    card.className = "col";
    card.innerHTML = `
      <div class="card p-3 shadow-sm ${p.status === "Confirmed" ? "border-success" : "border-warning"}">
        <h5 class="text-primary">${p.name}</h5>
        <p><strong>Seat:</strong> ${p.seatNumber} (${p.coach})</p>
        <p><strong>From:</strong> ${p.fromStation}</p>
        <p><strong>To:</strong> ${p.toStation}</p>
        <p><span class="badge ${p.status === "Confirmed" ? "bg-success" : "bg-warning text-dark"}">${p.status}</span></p>
        <button class="btn btn-sm btn-danger" onclick="deletePassenger('${p._id}')">🗑️ Delete</button>
      </div>
    `;
    seatMap.appendChild(card);
  });
}

// Add passenger
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const passenger = {
    name: document.getElementById("name").value,
    seatNumber: parseInt(document.getElementById("seatNumber").value),
    coach: document.getElementById("coach").value,
    fromStation: document.getElementById("fromStation").value,
    toStation: document.getElementById("toStation").value,
    status: document.getElementById("status").value
  };

  await fetch("/api/passengers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passenger)
  });

  form.reset();
  loadPassengers();
});

// Delete passenger
async function deletePassenger(id) {
  await fetch(`/api/passengers/${id}`, { method: "DELETE" });
  loadPassengers();
}

// Update train progress (station reached)
async function stationReached() {
  const station = document.getElementById("stationName").value;
  if (!station) return alert("Enter a station name");

  const res = await fetch("/api/stationReached", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ station })
  });

  const data = await res.json();
  alert(`🚉 ${station} reached! Seats updated.`);
  loadPassengers();
}

loadPassengers();
