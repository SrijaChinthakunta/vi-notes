const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let sessions = [];

app.get("/", (req, res) => {
    res.send("Vi-Notes API Running");
});

app.post("/api/save-session", (req, res) => {
    const session = req.body;
    sessions.push(session);

    res.json({
        message: "Session saved",
        totalSessions: sessions.length
    });
});

app.get("/api/sessions", (req, res) => {
    res.json(sessions);
});

app.listen(5000);