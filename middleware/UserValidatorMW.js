// middlewares/userValidatorMiddleware.js
const validate = require("../util/UserValidator");

const userValidatorMiddleware = (req, res, next) => {
  const valid = validate(req.body);
  if (!valid) {
    const errors = validate.errors.map(err => `${err.instancePath} ${err.message}`).join(', ');
    return res.status(400).send({ error: `Validation error: ${errors}` });
  }
  next();
};

module.exports = userValidatorMiddleware;
