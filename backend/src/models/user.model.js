import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  age: { 
    type: Number,
  },
  gender: {
    type: String,
  },
  bio: {
    type: String,
  },
  interests: {
    type: [String],
  },
  profilePicture: {
    type: String,
  },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAuthToken = function() {
  return jwt.sign({ 
    _id: this._id, 
    email: this.email 
  }, process.env.JWT_SECRET, 
  { expiresIn: '7d' });
}

const User = mongoose.model("User", userSchema);

export default User;
