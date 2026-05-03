const API = "http://localhost:5000/api/leads";

// Add lead
document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    source: document.getElementById("source").value,
    notes: document.getElementById("notes").value
})
    });

    load();
});

// Load leads
async function load() {
    const res = await fetch(API);
    const data = await res.json();

    const list = document.getElementById("list");
    list.innerHTML = "";

    data.forEach(l => {
        const li = document.createElement("li");

       li.innerHTML = `
    <b>${l.name}</b> (${l.email}) <br>
    Status: ${l.status} <br>
    Notes: ${l.notes} <br>
    <button onclick="updateStatus(${l.id})">Update</button>
    <button onclick="deleteLead(${l.id})">Delete</button>
`;

        list.appendChild(li);
    });
}

load();
async function updateStatus(id) {
    const status = prompt("Enter: New / Contacted / Converted");

    await fetch(API + "/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    });

    load();
}

async function deleteLead(id) {
    await fetch(API + "/" + id, {
        method: "DELETE"
    });

    load();
}