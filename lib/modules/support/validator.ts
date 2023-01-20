import Joi from "joi";

const technicalSupportSchema = {
  validateId: Joi.object().keys({
    id: Joi.string().required().length(39).messages({
      'string.length': 'Invalid Params Id',
      'string.required': 'Params Id cannot be empty',
    }),
  }),
  requestSupport: Joi.object().keys({
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().required(),
    message: Joi.string(),
    file: Joi.any(),
  }),
  updateSupport: Joi.object().keys({
    status: Joi.boolean().required().messages({'string.status':'input required'}),
  }),
};

export default technicalSupportSchema;