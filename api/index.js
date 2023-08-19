require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const User = require("./model/userModel");
const app = express();

// middlewares
app.use(express.json());

// sample route to check if the app is working or not
app.get("/", (req, res) => {
  res.json("home route working");
});

// mongoose connection and listening to port
const PORT = process.env.PORT || 8080;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("mongodb connected");
    app.listen(PORT, console.log(`server is live:  http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("An error occured while connecting", error);
  });
