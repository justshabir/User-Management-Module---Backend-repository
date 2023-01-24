import Joi from 'joi';
const orgValidatorSchema = {
  register: Joi.object().keys({
    businessName: Joi.string().min(3).required(),
    businessSize: Joi.string().min(3).required(),
    businessEmail: Joi.string().email().required(),
    businessLogo: Joi.string().length(24).messages({
      'string.length': 'Invalid Logo',
    }),
  }),
};
export default orgValidatorSchema;
