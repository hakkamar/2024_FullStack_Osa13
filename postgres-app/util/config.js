require("dotenv").config();

let PORT = process.env.PORT || 3001;
const POSTGRESDB_URL = process.env.POSTGRESDB_URI;
let SECRET = process.env.SECRET;

module.exports = {
  POSTGRESDB_URL,
  PORT,
  SECRET,
};
