const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve frontend (IMPORTANT)
app.use(express.static(path.join(__dirname, "../client")));

// Database
const db = new sqlite3.Database("crm.db");

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

// Routes

// Get all leads
app.get("/api/leads", (req, res) => {
    db.all("SELECT * FROM leads", [], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

// Add new lead
app.post("/api/leads", (req, res) => {
    const { name, email, source, notes } = req.body;

    db.run(
        "INSERT INTO leads (name, email, source, notes) VALUES (?, ?, ?, ?)",
        [name, email, source, notes],
        function (err) {
            if (err) return res.status(500).json(err);
            res.json({ id: this.lastID });
        }
    );
});

// Update status
app.put("/api/leads/:id", (req, res) => {
    const { status } = req.body;

    db.run(
        "UPDATE leads SET status=? WHERE id=?",
        [status, req.params.id],
        function (err) {
            if (err) return res.status(500).json(err);
            res.json({ updated: true });
        }
    );
});

// Delete lead
app.delete("/api/leads/:id", (req, res) => {
    db.run(
        "DELETE FROM leads WHERE id=?",
        [req.params.id],
        function (err) {
            if (err) return res.status(500).json(err);
            res.json({ deleted: true });
        }
    );
});

// Fallback → serve frontend
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
