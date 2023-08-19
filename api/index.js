require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const User = require("./model/userModel");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { encode } = require("blurhash");
const sharp = require("sharp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const cors = require("cors");
const app = express();

// middlewares
app.use(
  cors({
    origin: "https://user-auth-delta.vercel.app/",
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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

// post route to send the confirmation mail to the user with apassword reset link
app.post("/user/request/reset_password", async (req, res) => {
  try {
    const { email } = req.body;

    // find the userdocument with the email
    const foundUserDoc = await User.findOne({ email });
    if (!foundUserDoc)
      return res.json({
        name: "Document not found",
        message: "User doesn't exsits",
      });

    // if userDoc is found then create a unique token only for password reseting
    const JWT_SECRET = process.env.JWT_SECRET + foundUserDoc.password;

    // create a token
    const resetPasswordToken = jwt.sign(
      {
        id: foundUserDoc._id,
        email: foundUserDoc.email,
      },
      JWT_SECRET,
      { expiresIn: "10m" }
    );
    const emailUrlLink = `http://localhost:8080/request/authenticate_url/${foundUserDoc._id}/${resetPasswordToken}`;

    // create a config option for gmail
    const mailServiceConfig = {
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASSWORD,
      },
    };

    // create a transporter with th config options
    const transporter = nodemailer.createTransport(mailServiceConfig);

    // define the mailgen object
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        // appears in header and footer
        name: "Auth",
        link: "http://localhost:5173",
        // logo: "your product logo",
      },
    });
    // create a mail body
    const response = {
      body: {
        name: foundUserDoc.userName,
        intro: [
          "<h1>Reset password</h1>",
          "A password change has been requested for your account. If this was you, please use the link below to reset your password.",
          "This link is valid for only 10minutes",
        ],
        action: {
          button: {
            color: "#48bb78",
            text: "Reset password",
            link: emailUrlLink,
          },
        },
        outro:
          "If you did not request a password reset, no further action is required on your part.",
      },
    };
    // create the mail body with the given html
    const mail = mailGenerator.generate(response);

    // send mail details from, to, subject, mail body
    const emailConfig = {
      // specify the same email as emailConfig,
      // if you don't the emails will be moved to spam folder by default
      from: {
        name: "Auth",
        address: process.env.GMAIL_ID,
      },
      to: email,
      subject: "Change password of your Auth account",
      html: mail,
    };

    transporter
      .sendMail(emailConfig)
      .then(() => {
        return res.status(224).json({
          name: "NodeMail Success",
          message: "Mail sent successfully",
        });
      })
      .catch((error) => {
        return res.status(400).json(error);
      });
  } catch (error) {
    console.error("error in line346", error);
    res.status(400).json(error);
  }
});

// this is the the url that we will send in the email, if hit it will create a token in the user browser
app.get(
  "/request/authenticate_url/:userId/:resetPasswordToken",
  async (req, res) => {
    try {
      const { userId, resetPasswordToken } = req.params;

      // find the userdocument with the id
      const foundUserDoc = await User.findOne({ _id: userId });
      if (!foundUserDoc)
        return res.json({
          name: "Document not found",
          message: "User doesn't exsits",
        });

      // if user is found in the database then verify the token with the modified secret
      const JWT_SECRET = process.env.JWT_SECRET + foundUserDoc.password;
      const verifyResetPasswordToken = jwt.verify(
        resetPasswordToken,
        JWT_SECRET
      );
      if (verifyResetPasswordToken) {
        // for additional security store the last 7 digits of userDocument _id
        const uniqueIdentifier = userId.slice(-7);
        const headers = encodeURIComponent(
          JSON.stringify({
            Authorization: `Bearer u19e189d${uniqueIdentifier} ${resetPasswordToken}`,
          })
        );
        const redirectUrl = `http://localhost:5173/u/reset_password/${userId}?headers=${headers}`;
        return res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("Error in line384", error);
      // redirect the user to 404 page with the error message
      const redirectUrl = "http://localhost:5173/";
      res.status(400).redirect(`${redirectUrl}${error.message}`);
    }
  }
);

// update the user password
app.put("/user/update_password", async (req, res) => {
  try {
    const { userId, isAuthor, password } = req.body;

    // find the user document with the userId
    const foundUserDoc = await User.findOne({ _id: userId });
    if (!foundUserDoc) {
      return res.json({
        name: "Document Not Found",
        message: "User doesn't Exsits",
      });
    }
    const tokenValue = isAuthor.slice(33, -2);
    const resetPasswordToken = tokenValue.slice(8);

    // verify the token
    const JWT_SECRET = process.env.JWT_SECRET + foundUserDoc.password;
    const verifyResetPasswordToken = jwt.verify(resetPasswordToken, JWT_SECRET);
    if (verifyResetPasswordToken) {
      // hash the user password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password.toString(), salt);
      if (!hashedPassword) {
        return res.json({
          name: "Bcrypt Error",
          message: "Password not hashed",
        });
      }
      if (verifyResetPasswordToken.id === userId) {
        // update the user password
        const updateUserDoc = await User.findByIdAndUpdate(
          userId,
          { password: hashedPassword },
          { new: true }
        );
        return res.status(224).json({
          name: "Document Update",
          message: "User updated succesfully",
        });
      }
    }
  } catch (error) {
    console.error("error in line434", error);
    res.status(400).json(error);
  }
});

// logout route
app.post("/user/logout", (req, res) => {
  try {
    res
      .clearCookie("loggedUser", { expires: new Date(0) })
      .status(224)
      .json({ name: "Logout", message: "Logout Success" });
  } catch (error) {
    console.error("error in line447", error);
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
