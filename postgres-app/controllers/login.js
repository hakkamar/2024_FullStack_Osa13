const jwt = require("jsonwebtoken");
const router = require("express").Router();

const { SECRET } = require("../util/config");

const { User, Session } = require("../models");

router.post("/", async (request, response) => {
  const body = request.body;

  const user = await User.findOne({
    where: {
      username: body.username,
    },
  });

  const passwordCorrect = body.password === "salainen";

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }

  if (user.disabled) {
    // Poistetaan varmuuden välttämiseksi KAIKKI sessiot käyttäjältä
    await Session.destroy({
      where: {
        userId: user.id,
      },
    });
    return response.status(401).json({
      error: "account disabled, please contact admin",
    });
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  };

  const token = jwt.sign(userForToken, SECRET);
  await Session.create({ userId: userForToken.id, token: token });

  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = router;
