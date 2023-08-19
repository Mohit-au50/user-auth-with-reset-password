require("dotenv").config();
const express = require("express");
const app = express();

// middlewares
app.use(express.json());

// sample route to check if the app is working or not
app.get("/", (req, res) => {
  res.json("home route working");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`server is live:  http://localhost:${PORT}`));
