const mongoose = require("mongoose");
// destructure Schema and model from mongoose, after destructuring we can reduce code lines
// "new mongoose.Schema()" > "new Schema()" & "mongoose.model()" > "model()"
const { Schema, model } = mongoose;

// create a user Schema, I'll perform every validation from frontend so no validations here
const UserSchema = new Schema(
  {
    avatar: {
      type: String,
      required: true,
    },
    blur_hash: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// store the instance of user model inside a variable and export it to use it outside this file
const User = model("User", UserSchema);
module.exports = User;
