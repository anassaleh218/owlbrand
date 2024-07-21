const Ajv = require("ajv");
const ajv = new Ajv();

const schema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      pattern: "^[A-Za-z]+( [A-Za-z]+)*$",
      minLength: 5,
      maxLength: 50,
    },
    email: { type: "string", pattern: ".+@.+..+" },
    password: { type: "string", minLength: 5 },
  },
  required: ["name", "email", "password"],
};

module.exports = ajv.compile(schema);

