import Joi from 'joi';

const uploadValidatorSchema = {
  veryifyParamsId: Joi.object().keys({
    id: Joi.string().required().length(24).messages({
      'string.length': 'Invalid Params Id',
      'string.required': 'Params Id cannot be empty',
    }),
  }),

  uploadImageUrl: Joi.object().keys({
    imageUrl: Joi.string().required(),
  }),
};

export default uploadValidatorSchema;
