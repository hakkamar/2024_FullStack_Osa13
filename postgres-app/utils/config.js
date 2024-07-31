require("dotenv").config();

let PORT = process.env.PORT;
const POSTGRESDB_URI = process.env.POSTGRESDB_URI;

module.exports = {
  POSTGRESDB_URI,
  PORT,
};
