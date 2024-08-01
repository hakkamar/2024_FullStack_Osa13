const router = require("express").Router();

const { User, Blog } = require("../models");

router.get("/", async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ["userId"] },
    },
  });
  res.json(users);
});

router.post("/", async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

router.get("/:id", async (req, res) => {
  const user = await User.findOne({
    where: { id: req.params.id },
    //attributes: { exclude: ["createdAt", "updatedAt"] },
    include: {
      model: Blog,
      attributes: { exclude: ["userId"] },
    },
  });
  if (user) {
    res.json(user);
  } else {
    res.status(404).end();
  }
});

// nimen muutos - kaikki voi muuttaa kaikkien?
// ehkä myöhemmin estetään muiden kuin oman muutos...
router.put("/:username", async (req, res) => {
  const body = req.body;
  const user = await User.findOne({
    where: { username: req.params.username },
    include: {
      model: Blog,
    },
  });

  if (user) {
    user.name = body.name;
    await user.save();

    res.json(user);
  } else {
    res.status(404).end();
  }
});

module.exports = router;

/*
const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  });

  response.json(users);
});

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  switch (true) {
    case password === undefined:
      return response.status(400).json({ error: "password missing" });
    case password.length < 3:
      return response
        .status(400)
        .json({ error: "password too short (minimum 3 characters)" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
*/
