const router = require("express").Router();

const { User, Session } = require("../models");
const { Op } = require("sequelize");
const middleware = require("../util/middleware");

router.delete("/", middleware.tokenExtractor, async (req, res) => {
  const authorization = req.get("authorization");
  const userToken = authorization.substring(7);

  if (!req.decodedToken.id) {
    return res.status(401).json({
      error: "invalid logout/token",
    });
  }
  const user = await User.findByPk(req.decodedToken.id);
  if (!user) {
    return res.status(401).json({
      error: "invalid logout/user",
    });
  }

  // Poistetaan vain ko. sessio käyttäjältä, ei kaikkia.
  await Session.destroy({
    where: {
      [Op.and]: [{ userId: req.decodedToken.id }, { token: userToken }],
    },
  });

  res.status(200).json();
});

module.exports = router;
