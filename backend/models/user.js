import mongoose from "mongoose";
import { Schema } from "mongoose";

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
    unique: true
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

const User = mongoose.model("User", userSchema);

export default User;
