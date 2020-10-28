const Joi = require("joi");

const registerVal = (data) => {
  console.log("utli", data);
  const schema = Joi.object({
    name: Joi.string(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(6).max(1025).required(),
    confirmpassword: Joi.string().required().valid(Joi.ref("password")),
  });
  return schema.validate(data);
};

const loginVal = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().min(6).max(1025).required(),
  });
  return schema.validate(data);
};

const resetVal = (data) => {
  const schema = Joi.object({
    password: Joi.string().min(6).max(1025).required(),
    confirmpassword: Joi.string().required().valid(Joi.ref("password")),
  });
  return schema.validate(data);
};

module.exports.registerVal = registerVal;
module.exports.loginVal = loginVal;
module.exports.resetVal = resetVal;
