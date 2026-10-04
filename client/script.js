const isDashboard = document.getElementById("leadList") !== null;
const isLeadsPage = document.getElementById("leadsTableBody") !== null;

const API = "/api/leads";

// =========================
// DOM ELEMENTS
// =========================

const leadList = document.getElementById("leadList");
const emptyState = document.getElementById("emptyState");

const totalLeads = document.getElementById("totalLeads");
const newLeads = document.getElementById("newLeads");
const contactedLeads = document.getElementById("contactedLeads");
const convertedLeads = document.getElementById("convertedLeads");

const leadModal = document.getElementById("leadModal");
const addLeadBtn = document.getElementById("addLeadBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

const leadForm = document.getElementById("leadForm");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editStatus = document.getElementById("editStatus");

const closeEditModalBtn = document.getElementById("closeEditModalBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let editingLeadId = null;
let allLeads = [];

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

let toastTimer;

function showToast(message) {
    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}
// =========================
// LOAD LEADS
// =========================

async function loadLeads() {
    if (isDashboard) {
        totalLeads.textContent = "—";
        newLeads.textContent = "—";
        contactedLeads.textContent = "—";
        convertedLeads.textContent = "—";
    }

    try {
        const response = await fetch(API);

        if (!response.ok) {
            throw new Error("Failed to load leads");
        }

        const leads = await response.json();

        allLeads = leads;

        updateSourceFilter();

        displayLeads(leads);
        updateStatistics(leads);

    } catch (error) {
        console.error("Error loading leads:", error);
    }
}


// =========================
// DISPLAY LEADS
// =========================

function displayLeads(leads) {
    const tableBody = isDashboard
        ? document.getElementById("leadList")
        : document.getElementById("leadsTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (leads.length === 0) {
        if (isDashboard && emptyState) {
            emptyState.style.display = "block";
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="loading-cell">
                        No leads found.
                    </td>
                </tr>
            `;
        }
        return;
    }

    if (isDashboard && emptyState) {
        emptyState.style.display = "none";
    }

    leads.forEach(lead => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><strong>${lead.name || "Unnamed Lead"}</strong></td>
            <td>${lead.email || "-"}</td>
            <td>${lead.source || "-"}</td>
            <td>
                <span class="status-badge status-${(lead.status || "New").toLowerCase().replace(/\s+/g, "-")}">
                    ${lead.status || "New"}
                </span>
            </td>
            <td>${lead.notes || "-"}</td>
            <td>
                <div class="action-buttons">
                    <button class="table-btn edit-btn" onclick="${isDashboard ? `updateLead(${lead.id})` : `editLeadFromLeadsPage(${lead.id})`}">Edit</button>
                    <button class="table-btn delete-btn" onclick="deleteLead(${lead.id})">Delete</button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// =========================
// UPDATE STATISTICS
// =========================

function updateStatistics(leads) {

    if (!isDashboard) return;
    totalLeads.textContent = leads.length;

    const newCount = leads.filter(
        lead => lead.status === "New"
    ).length;

    const contactedCount = leads.filter(
        lead => lead.status === "Contacted"
    ).length;

    const convertedCount = leads.filter(
        lead => lead.status === "Converted"
    ).length;

    newLeads.textContent = newCount;
    contactedLeads.textContent = contactedCount;
    convertedLeads.textContent = convertedCount;
}


// =========================
// OPEN MODAL
// =========================

if (addLeadBtn && leadModal) {
    addLeadBtn.addEventListener("click", () => {
        leadModal.style.display = "flex";
    });
}


// =========================
// CLOSE MODAL
// =========================

function closeModal() {
    leadModal.style.display = "none";
    leadForm.reset();
}

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
}

if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
}


// Close modal when clicking outside it

if (leadModal) {
    leadModal.addEventListener("click", (event) => {

        if (event.target === leadModal) {
            closeModal();
        }

    });
}


// =========================
// ADD LEAD
// =========================

if (leadForm) {
    leadForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const source = document.getElementById("source").value;
    const notes = document.getElementById("notes").value.trim();

    if (!name || !email) {
        alert("Please enter the lead name and email.");
        return;
    }

    try {

        const response = await fetch(API, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                source,
                notes
            })
        });

        if (!response.ok) {
            throw new Error("Failed to add lead");
        }

        closeModal();

        await loadLeads();

        showToast("Lead added successfully");

        } catch (error) {

        console.error("Error adding lead:", error);

        alert("Something went wrong while adding the lead.");
    }
    });
}

// =========================
// UPDATE LEAD STATUS
// =========================

function updateLead(id) {
    const lead = allLeads.find(lead => lead.id === id);

    if (!lead) return;

    editingLeadId = id;

    document.getElementById("editStatus").value = lead.status || "New";

    if (editModal) {
        editModal.style.display = "flex";
    }
}

// =========================
// EDIT MODAL
// =========================

function closeEditModal() {
    editModal.style.display = "none";
    editForm.reset();
    editingLeadId = null;
}

if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener("click", closeEditModal);
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", closeEditModal);
}

if (editModal) {
    editModal.addEventListener("click", (event) => {

        if (event.target === editModal) {
            closeEditModal();
        }

    });
}


// =========================
// SAVE UPDATED STATUS
// =========================
if(editForm){
editForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!editingLeadId) return;

    const lead = allLeads.find(lead => lead.id === editingLeadId);

if (!lead) return;

const name = lead.name || "";
const email = lead.email || "";
const source = lead.source || "Other";
const status = document.getElementById("editStatus").value;
const notes = lead.notes || "";

    if (!name || !email) {
        alert("Please enter the lead name and email.");
        return;
    }

    try {
        const response = await fetch(`${API}/${editingLeadId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                source,
                status,
                notes
            })
        });

        if (!response.ok) {
            throw new Error("Failed to update lead");
        }

        closeEditModal();
        await loadLeads();

        showToast("Lead updated successfully");

    } catch (error) {
        console.error("Error updating lead:", error);
        alert("Something went wrong while updating the lead.");
    }
});
}

// =========================
// DELETE LEAD
// =========================

async function deleteLead(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this lead?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete lead");
        }

        await loadLeads();

        showToast("Lead deleted successfully");

    } catch (error) {

        console.error("Error deleting lead:", error);

        alert("Something went wrong while deleting the lead.");
    }
}

// =========================
// SEARCH & FILTERS
// =========================

const searchInput = document.getElementById(
    isDashboard ? "searchInput" : "leadSearch"
);

const statusFilter = document.getElementById(
    isDashboard ? "statusFilter" : "leadStatusFilter"
);

const sourceFilter = document.getElementById(
    isDashboard ? "sourceFilter" : "leadSourceFilter"
);

function updateSourceFilter() {
    const filter = isDashboard
        ? document.getElementById("sourceFilter")
        : document.getElementById("leadSourceFilter");

    if (!filter) return;

    const currentValue = filter.value;

    const sources = [
        "Website",
        "LinkedIn",
        "Instagram",
        "Referral",
        "Other"
    ];

    filter.innerHTML = `<option value="">All Sources</option>`;

    sources.forEach(source => {
        const option = document.createElement("option");
        option.value = source;
        option.textContent = source;
        filter.appendChild(option);
    });

    filter.value = sources.includes(currentValue) ? currentValue : "";
}

function applyFilters() {

    const searchTerm = searchInput.value
        .toLowerCase()
        .trim();

    const selectedStatus = statusFilter.value;
    const selectedSource = sourceFilter.value;

    const filteredLeads = allLeads.filter(lead => {

        const matchesSearch =
            (lead.name || "").toLowerCase().includes(searchTerm) ||
            (lead.email || "").toLowerCase().includes(searchTerm) ||
            (lead.source || "").toLowerCase().includes(searchTerm) ||
            (lead.status || "").toLowerCase().includes(searchTerm) ||
            (lead.notes || "").toLowerCase().includes(searchTerm);

        const matchesStatus =
            !selectedStatus ||
            lead.status === selectedStatus;

        const matchesSource =
            !selectedSource ||
            lead.source === selectedSource;

        return matchesSearch && matchesStatus && matchesSource;

    });

    displayLeads(filteredLeads);
}


if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
}

if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
}

if (sourceFilter) {
    sourceFilter.addEventListener("change", applyFilters);
}

// =========================
// LEAD EDIT MODAL (FROM LEADS PAGE)
// =========================
const leadEditModal = document.getElementById("leadEditModal");
const leadEditForm = document.getElementById("leadEditForm");
const closeLeadEditModal = document.getElementById("closeLeadEditModal");
const cancelLeadEdit = document.getElementById("cancelLeadEdit");

let editingLeadsPageId = null;

function editLeadFromLeadsPage(id) {
    const lead = allLeads.find(lead => lead.id === id);

    if (!lead || !leadEditModal) return;

    editingLeadsPageId = id;

    document.getElementById("leadEditName").value = lead.name || "";
    document.getElementById("leadEditEmail").value = lead.email || "";
    document.getElementById("leadEditSource").value = lead.source || "Other";
    document.getElementById("leadEditStatus").value = lead.status || "New";
    document.getElementById("leadEditNotes").value = lead.notes || "";

    leadEditModal.style.display = "flex";
}

if (leadEditForm) {
    leadEditForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!editingLeadsPageId) return;

        const name = document.getElementById("leadEditName").value.trim();
        const email = document.getElementById("leadEditEmail").value.trim();
        const source = document.getElementById("leadEditSource").value;
        const status = document.getElementById("leadEditStatus").value;
        const notes = document.getElementById("leadEditNotes").value.trim();

        if (!name || !email) {
            alert("Please enter the lead name and email.");
            return;
        }

        try {
            const response = await fetch(`${API}/${editingLeadsPageId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    source,
                    status,
                    notes
                })
            });

            if (!response.ok) {
                throw new Error("Failed to update lead");
            }

            leadEditModal.style.display = "none";
            editingLeadsPageId = null;

            await loadLeads();

            showToast("Lead updated successfully");

        } catch (error) {
            console.error("Error updating lead:", error);
            alert("Something went wrong while updating the lead.");
        }
    });
}

// Close Leads edit modal
if (closeLeadEditModal) {
    closeLeadEditModal.addEventListener("click", () => {
        leadEditModal.style.display = "none";
        editingLeadsPageId = null;
    });
}

// Cancel Leads edit modal
if (cancelLeadEdit) {
    cancelLeadEdit.addEventListener("click", () => {
        leadEditModal.style.display = "none";
        editingLeadsPageId = null;
    });
}

// Close when clicking outside the modal
if (leadEditModal) {
    leadEditModal.addEventListener("click", (event) => {
        if (event.target === leadEditModal) {
            leadEditModal.style.display = "none";
            editingLeadsPageId = null;
        }
    });
}
// =========================
// INITIAL LOAD
// =========================

loadLeads();