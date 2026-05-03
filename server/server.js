const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Create / connect database
const db = new sqlite3.Database("./crm.db");

// Create table if not exists
db.run(`
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    source TEXT,
    status TEXT DEFAULT 'New',
    notes TEXT
)
`);

// Test route
app.get("/", (req, res) => {
    res.send("Server is running");
});
// ADD Lead
app.post("/api/leads", (req, res) => {
    const { name, email, source, notes } = req.body;

    db.run(
        "INSERT INTO leads (name, email, source, notes) VALUES (?, ?, ?, ?)",
        [name, email, source, notes],
        function (err) {
            if (err) return res.status(500).send(err);
            res.send({ id: this.lastID });
        }
    );
});

// GET all Leads
app.get("/api/leads", (req, res) => {
    db.all("SELECT * FROM leads", [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});
// UPDATE status
app.put("/api/leads/:id", (req, res) => {
    const { status } = req.body;

    db.run(
        "UPDATE leads SET status = ? WHERE id = ?",
        [status, req.params.id],
        function (err) {
            if (err) return res.status(500).send(err);
            res.send("Updated");
        }
    );
});

// DELETE lead
app.delete("/api/leads/:id", (req, res) => {
    db.run("DELETE FROM leads WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).send(err);
        res.send("Deleted");
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
