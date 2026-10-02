const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Middleware to read JSON data
app.use(express.json());

// SQLite database
const db = new sqlite3.Database("./subscriptions.db", (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

// Create subscription table
db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        plan TEXT NOT NULL,
        price REAL NOT NULL
    )
`, (err) => {
    if (err) {
        console.error("Table creation error:", err.message);
    } else {
        console.log("Subscriptions table ready");
    }
});


// CREATE - Add Subscription
app.post("/subscriptions", (req, res) => {

    const { name, plan, price } = req.body;

    if (!name || !plan || price === undefined) {
        return res.status(400).json({
            message: "Please provide name, plan and price"
        });
    }

    const sql = `
        INSERT INTO subscriptions (name, plan, price)
        VALUES (?, ?, ?)
    `;

    db.run(sql, [name, plan, price], function(err) {

        if (err) {
            return res.status(500).json({
                message: "Error adding subscription",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Subscription added successfully",
            id: this.lastID
        });
    });
});


// READ - View All Subscriptions
app.get("/subscriptions", (req, res) => {

    const sql = "SELECT * FROM subscriptions";

    db.all(sql, [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching subscriptions",
                error: err.message
            });
        }

        res.status(200).json(rows);
    });
});


// READ - View One Subscription
app.get("/subscriptions/:id", (req, res) => {

    const id = req.params.id;

    const sql = "SELECT * FROM subscriptions WHERE id = ?";

    db.get(sql, [id], (err, row) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching subscription",
                error: err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                message: "Subscription not found"
            });
        }

        res.status(200).json(row);
    });
});


// UPDATE - Update Subscription
app.put("/subscriptions/:id", (req, res) => {

    const id = req.params.id;
    const { name, plan, price } = req.body;

    if (!name || !plan || price === undefined) {
        return res.status(400).json({
            message: "Please provide name, plan and price"
        });
    }

    const sql = `
        UPDATE subscriptions
        SET name = ?, plan = ?, price = ?
        WHERE id = ?
    `;

    db.run(sql, [name, plan, price, id], function(err) {

        if (err) {
            return res.status(500).json({
                message: "Error updating subscription",
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                message: "Subscription not found"
            });
        }

        res.status(200).json({
            message: "Subscription updated successfully"
        });
    });
});


// DELETE - Delete Subscription
app.delete("/subscriptions/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM subscriptions WHERE id = ?";

    db.run(sql, [id], function(err) {

        if (err) {
            return res.status(500).json({
                message: "Error deleting subscription",
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                message: "Subscription not found"
            });
        }

        res.status(200).json({
            message: "Subscription deleted successfully"
        });
    });
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});