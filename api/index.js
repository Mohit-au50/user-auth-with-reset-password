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

// email verify route to check if the given email exsits in the database or not
app.post("/user/email_verify", async (req, res) => {
  try {
    const { email } = req.body;

    // find the User doucment
    const foundUserDoc = await User.findOne({ email });
    if (!foundUserDoc) {
      return res.status(220).json({ email, message: "New User" });
    }

    res.status(224).json({
      userName: foundUserDoc.userName,
      avatar: foundUserDoc.avatar,
      blur_hash: foundUserDoc.blur_hash,
    });
  } catch (error) {
    console.error("an error on line81", error);
    res.status(400).json(error);
  }
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
