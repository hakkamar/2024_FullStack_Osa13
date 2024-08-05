const router = require("express").Router();

const { Readinglist, Membership } = require("../models");

router.post("/", async (req, res) => {
  console.log("******************************");
  console.log("readinglist POST");

  const { blog_id, user_id } = req.body;

  console.log("blog_id", blog_id);
  console.log("user_id", user_id);

  const readinglist = await Readinglist.create({ read: false });

  console.log("readinglistId", readinglist.id);

  const createdReadings = await Membership.create({
    blogId: blog_id,
    userId: user_id,
    readinglistId: readinglist.id,
  });

  console.log("createdReadings", createdReadings);

  console.log("******************************");

  res.json(createdReadings);
});

module.exports = router;
