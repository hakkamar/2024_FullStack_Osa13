const router = require("express").Router();

const { Readinglist, Membership, User } = require("../models");

const middleware = require("../util/middleware");

router.post("/", async (req, res) => {
  const { blog_id, user_id } = req.body;
  const readinglist = await Readinglist.create({ read: false });

  const createdReadings = await Membership.create({
    blogId: blog_id,
    userId: user_id,
    readinglistId: readinglist.id,
  });

  res.json(createdReadings);
});

router.put("/:id", middleware.tokenExtractor, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id);
  const readinglist = await Readinglist.findByPk(req.params.id);

  if (readinglist) {
    const membership = await Membership.findOne({
      where: { readinglistId: req.params.id },
    });

    if (user.id === membership.userId) {
      // Varsinainen temppu mitä tultiin tekemään, eli read:in vaihto true/false mitä on pyydetty
      readinglist.read = req.body.read;
      await readinglist.save();

      res.json(readinglist);
    } else {
      res.status(401).json({ error: "only own readinglist can be changed" });
    }
  }

  res.status(204).end();
});

module.exports = router;
