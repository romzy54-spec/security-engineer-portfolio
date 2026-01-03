const express = require('express');
const app = express();

// ❌ Hardcoded secret (intentional vulnerability)
const API_KEY = "sk_test_123456789";

// ❌ SQL Injection vulnerability
app.get('/user', (req, res) => {
  const userId = req.query.id;
  const query = "SELECT * FROM users WHERE id = '" + userId + "'";
  res.send(query);
});

// ❌ Command injection vulnerability
app.get('/ping', (req, res) => {
  const host = req.query.host;
  require('child_process').exec("ping " + host);
  res.send("Ping sent");
});

app.listen(3000, () => {
  console.log("App running");
});
