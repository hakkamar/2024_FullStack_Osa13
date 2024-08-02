const router = require("express").Router();

const { Blog } = require("../models");
const { sequelize } = require("../util/db");

/*
const { QueryTypes } = require("sequelize");

router.get("/", async (req, res) => {
  const blogs = await sequelize.query(
    "SELECT author, count(*) AS blogs, sum(likes) AS likes from blogs group by author order by 3 DESC",
    {
      type: QueryTypes.SELECT,
    }
  );
  res.json(blogs);
});
*/

router.get("/", async (req, res) => {
  const blogs = await Blog.findAll({
    attributes: {
      include: [
        [sequelize.fn("COUNT", sequelize.col("*")), "blogs"],
        [sequelize.fn("SUM", sequelize.col("likes")), "likes"],
      ],
      exclude: ["userId", "id", "likes", "url", "title", "year"],
    },
    group: ["author"],
    order: [["likes", "DESC"]],
  });
  res.json(blogs);
});

module.exports = router;
