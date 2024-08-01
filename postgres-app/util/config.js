require("dotenv").config();

let PORT = process.env.PORT || 3001;
const POSTGRESDB_URL = process.env.POSTGRESDB_URI;

module.exports = {
  POSTGRESDB_URL,
  PORT,
};
