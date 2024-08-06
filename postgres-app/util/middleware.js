const logger = require("./logger");

const jwt = require("jsonwebtoken");
const { SECRET } = require("../util/config");

const { User, Session } = require("../models");
const { Op } = require("sequelize");

const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);
  //logger.error(error.name);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(400).json({ error: "token missing or invalid" });
  } else if (error.name === "TokenExpiredError") {
    return response.status(401).json({ error: "token expired" });
  } else if (error.name === "SequelizeValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "SequelizeUniqueConstraintError") {
    return response.status(400).json({ error: error.errors[0].message });
  } else if (error.name === "SequelizeDatabaseError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    const userToken = authorization.substring(7);

    try {
      const decodedToken = jwt.verify(userToken, SECRET);
      const user = await User.findByPk(decodedToken.id);

      // tutkitaan onko useri disabloitu
      if (user.disabled) {
        logger.info(
          "user ",
          user.username,
          " DISABLED!!!! - All sessions will be deleted..."
        );

        // Poistetaan KAIKKI sessiot käyttäjältä
        await Session.destroy({
          where: {
            userId: decodedToken.id,
          },
        });
        req.decodedToken = null;
        return res.status(401).json({
          error: "account disabled, please contact admin",
        });
      }

      const userinSessio = await Session.findOne({
        where: {
          [Op.and]: [{ userId: decodedToken.id }, { token: userToken }],
        },
      });

      if (!userinSessio) {
        return res.status(401).json({
          error: "No valid session!",
        });
      }

      req.decodedToken = decodedToken;
    } catch (error) {
      logger.error(error);
      return res.status(401).json({ error: "token invalid" });
    }
  } else {
    return res.status(401).json({ error: "token missing" });
  }
  next();
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
};
