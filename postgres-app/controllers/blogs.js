const router = require("express").Router();

const { Blog, User } = require("../models");
const { Op } = require("sequelize");

const middleware = require("../util/middleware");

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findOne({
    where: { id: req.params.id },
    attributes: { exclude: ["userId"] },
    include: {
      model: User,
      attributes: ["name"],
    },
  });
  next();
};

router.get("/", async (req, res) => {
  let where = {};
  if (req.query.search) {
    let hakuehto = "%" + req.query.search + "%";
    where = {
      [Op.or]: [
        {
          title: {
            [Op.iLike]: hakuehto,
          },
        },
        {
          author: {
            [Op.iLike]: hakuehto,
          },
        },
      ],
    };
    /*
    where.title = {
      [Op.iLike]: hakuehto,
    };    
    */
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ["userId"] },
    include: {
      model: User,
      attributes: ["name"],
    },
    where,
    order: [["likes", "DESC"]],
  });
  res.json(blogs);
});

router.post("/", middleware.tokenExtractor, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id);
  const blog = await Blog.create({ ...req.body, userId: user.id });

  // jos tarvetta tämäkin käy...
  //const blog = Blog.build(req.body);
  //blog.likes = 1;
  //await blog.save();
  return res.json(blog);
});

router.get("/:id", blogFinder, async (req, res) => {
  //const blog = await Blog.findByPk(req.params.id);
  //console.log(JSON.stringify(blog, null, 2));

  if (req.blog) {
    res.json(req.blog);
  } else {
    res.status(404).end();
  }
});

// Liketys....
router.put("/:id", blogFinder, async (req, res) => {
  //const blog = await Blog.findByPk(req.params.id);
  const body = req.body;

  if (req.blog) {
    req.blog.likes = body.likes;
    await req.blog.save();
    res.json(req.blog);
  } else {
    res.status(404).end();
  }
});

router.delete("/:id", middleware.tokenExtractor, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id);
  const blog = await Blog.findByPk(req.params.id);

  if (blog) {
    if (user) {
      if (user.id === blog.userId) {
        await blog.destroy();
      } else {
        res.status(401).json({ error: "only own blogs can be deleted" });
      }
    } else {
      return res.status(401).json({ error: "token invalid" });
    }
  }
  res.status(204).end();
});

module.exports = router;
