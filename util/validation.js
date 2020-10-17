const Joi = require("joi");

const registerVal = (data) => {
  const schema = Joi.object({
    name: Joi.string(),
    email: Joi.string().required().email(),
    password: Joi.string().min(6).max(1025).required(),
    confirmPassword: Joi.string().required().valid(Joi.ref("password")),
  });
  return schema.validate(data);
};

module.exports.registerVal = registerVal;
