const router = require("express").Router();

const { User, Blog, Readinglist } = require("../models");

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
  let where = {};
  // Mikäli annetu myös /api/users/:id?read=
  // haetaan kaikki vain annetun ehdon mukaan read true/false
  if (req.query.read) {
    where = {
      read: req.query.read,
    };
  }

  const user = await User.findOne({
    where: { id: req.params.id },
    //attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: Blog,
        attributes: { exclude: ["userId"] },
      },
      {
        model: Readinglist,
        as: "readings",
        where,
        attributes: ["id", "read"],
        through: {
          attributes: [],
        },
        include: {
          model: Blog,
          //attributes: [],
          attributes: { exclude: ["userId"] },
        },
      },
    ],
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
