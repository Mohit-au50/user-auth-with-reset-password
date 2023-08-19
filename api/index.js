require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const User = require("./model/userModel");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();

// middlewares
app.use(express.json());

// Cloudinary config file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// function to encode image path with a blurhash string
const encodeImageToBlurhash = async (path) => {
  try {
    const { data, info } = await sharp(path)
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: "inside" })
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    return encode(new Uint8ClampedArray(data), width, height, 4, 4);
  } catch (error) {
    console.error("error in backend line 48", error);
    res.status(400).json({
      name: "Blurhash Error",
      message: "Error generating blurhash",
    });
  }
};

// create an instance of multer object and initialize it with diskstorage option
const upload = multer({ storage: multer.diskStorage({}) });

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

// signup route to create a userDoc in database
app.post("/user/signup", upload.single("avatar"), async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const { path } = req.file;

    // pass the path to encodeImageToBlurhash function
    const blurHashString = await encodeImageToBlurhash(path);
    if (!blurHashString) {
      return res.json({
        name: "Blurhash error",
        message: "Error encoding blurhash",
      });
    }

    // hash the password before saving it to database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.toString(), salt);
    if (!hashedPassword) {
      return res.json({
        name: "Bcrypt error",
        message: "Error hashing password",
      });
    }

    // upload the image on cloudinary and store the link in the userDoc
    const result = await cloudinary.uploader.upload(path, {
      folder: "mern_resetPass/user",
    });
    if (!result) {
      res.json({
        name: "Cloudinary error",
        message: "Image upload error",
      });
      return;
    }

    // create a new userDocument
    const newUserDoc = await User.create({
      avatar: result.secure_url,
      blur_hash: blurHashString,
      email,
      password: hashedPassword,
      userName,
    });
    if (!newUserDoc) {
      return res.json({
        name: "Mongoose error",
        message: "Error creating user",
      });
    }

    // optionally you can directly log th user in after signup
    const loggedUser = jwt.sign(
      {
        avatar: newUserDoc.avatar,
        blur_hash: newUserDoc.blur_hash,
        email: newUserDoc.email,
        id: newUserDoc._id,
        userName: newUserDoc.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    // save the token in users browser
    const expirationTime = new Date(Date.now() + 6 * 60 * 60 * 1000);
    res
      .cookie("loggedUser", loggedUser, {
        expires: expirationTime,
        sameSite: "none",
        secure: true,
      })
      .status(224)
      .json({
        avatar: newUserDoc.avatar,
        blur_hash: newUserDoc.blur_hash,
        cookieToken: "generated",
        email: newUserDoc.email,
        id: newUserDoc._id,
        userName: newUserDoc.userName,
      });
  } catch (error) {
    console.error("Error in line 169", error);
    res.status(400).json(error);
  }
});

// login route
app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUserDoc = await User.findOne({ email });

    // verify the user password with database password
    const verifyUserPassword = await bcrypt.compare(
      password.toString(),
      foundUserDoc.password
    );
    if (!verifyUserPassword)
      return res.json({
        name: "passwordError",
        message: "Wrong password",
      });

    // if password is matched then create a token for the log in the user
    const loggedUser = jwt.sign(
      {
        avatar: foundUserDoc.avatar,
        blur_hash: foundUserDoc.blur_hash,
        email: foundUserDoc.email,
        id: foundUserDoc._id,
        userName: foundUserDoc.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    const expirationTime = new Date(Date.now() + 6 * 60 * 60 * 1000);
    res
      .cookie("loggedUser", loggedUser, {
        expires: expirationTime,
        sameSite: "none",
        secure: true,
      })
      .status(224)
      .json({
        avatar: foundUserDoc.avatar,
        blur_hash: foundUserDoc.blur_hash,
        cookieToken: "generated",
        email: foundUserDoc.email,
        id: foundUserDoc._id,
        userName: foundUserDoc.userName,
      });
  } catch (error) {
    console.error("error in /user/login", error);
    res.status(400).json(error);
  }
});

// route to get the currect user using cookies
app.get("/current_loggedInUser", async (req, res) => {
  try {
    const { loggedUser } = req.cookies;

    if (!loggedUser)
      return res.json({
        name: "JsonWebToken Error",
        message: "Please Login",
      });

    // verify the token, extract the values out of it and send it to the client
    const verifiedUserToken = jwt.verify(loggedUser, process.env.JWT_SECRET);
    if (!verifiedUserToken) return res.json("token is not authentic");

    res.status(224).json(verifiedUserToken);
  } catch (error) {
    console.error("error in line244", error);
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
