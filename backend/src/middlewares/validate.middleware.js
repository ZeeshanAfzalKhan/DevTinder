import Joi from "joi";
import validator from "express-joi-validation";

const validate = validator.createValidator({
  passError: true // important! this makes Joi errors go to next()
});


const signUpSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).required(),
  lastName: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});


export const signUpValidator = validate.body(signUpSchema);
export const loginValidator = validate.body(loginSchema);