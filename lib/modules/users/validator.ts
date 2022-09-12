import Joi from 'joi';
const strongPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const stringPassswordError =
  'Password must be strong. At least one upper case alphabet. At least one lower case alphabet. At least one digit. At least one special character. Minimum eight in length';

const userValidatorSchema = {
  signUp: Joi.object().keys({
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).regex(strongPasswordRegex).required().label('Password').messages({
      'string.min': 'Must have at least 8 characters',
      'object.regex': 'Must have at least 8 characters',
      'string.pattern.base': stringPassswordError,
    }),
  }),

  signin: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).regex(strongPasswordRegex).required().label('Password').messages({
      'string.min': 'Must have at least 8 characters',
      'object.regex': 'Must have at least 8 characters',
      'string.pattern.base': stringPassswordError,
    }),
  }),

  verifyConfirmationCode: Joi.object().keys({
    confirmationCode: Joi.string().min(50).required().messages({
      'string.min': 'Invalid Confirmation Code',
      'string.required': 'Confirmation Code cannot be empty',
    }),
  }),

  verifyParamsId: Joi.object().keys({
    id: Joi.string().length(24).required().messages({
      'string.length': 'Invalid Params Id',
      'string.required': 'Params Id cannot be empty',
    }),
  }),

  verifyEmail: Joi.object().keys({
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid Email',
      'string.required': 'Email is required',
    }),
  }),

  resetPassword: Joi.object().keys({
    token: Joi.string().min(50).required(),
    password: Joi.string().min(8).regex(strongPasswordRegex).required().label('Password').messages({
      'string.min': 'Must have at least 8 characters',
      'object.regex': 'Must have at least 8 characters',
      'string.pattern.base': stringPassswordError,
    }),
  }),
};
export default userValidatorSchema;
