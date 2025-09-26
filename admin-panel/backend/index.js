const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ai_social_media_db",
  password: "postgres",
  port: 5432,
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email, plan } = req.body;
    const newUser = await pool.query(
      "INSERT INTO users (name, email, plan) VALUES ($1, $2, $3) RETURNING *",
      [name, email, plan]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});


