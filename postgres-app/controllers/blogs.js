const router = require("express").Router();

const { Blog, User } = require("../models");

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
  const blogs = await Blog.findAll({
    attributes: { exclude: ["userId"] },
    include: {
      model: User,
      attributes: ["name"],
    },
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
        //await Blog.destroy({
        //  where: {
        //    id: req.params.id,
        //  },
        //});
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

/*

const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
//const User = require("../models/user");
//const jwt = require("jsonwebtoken");

const middleware = require("../utils/middleware");

let voiPoistaa = false;
let uudetBlogit = null;
let indexi = 0;

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.post("/", middleware.userExtractor, async (request, response) => {
  const body = request.body;
  const user = request.user;
  if (user === null) {
    return response.status(401).json({ error: "token invalid" });
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete(
  "/:id",
  middleware.userExtractor,
  async (request, response) => {
    const user = request.user;
    if (user === null) {
      return response.status(401).json({ error: "token invalid" });
    }

    voiPoistaa = false;
    uudetBlogit = null;
    indexi = 0;
    for (let i = 0; i < user.blogs.length; i++) {
      if (user.blogs[i].toString() === request.params.id) {
        indexi = i;
        voiPoistaa = true;
        break;
      }
    }

    if (voiPoistaa) {
      await Blog.findByIdAndDelete(request.params.id);
      uudetBlogit = user.blogs.toSpliced(indexi, 1);
      user.blogs = uudetBlogit;
      await user.save();

      response.status(204).end();
    } else {
      response.status(401).json({ error: "only own blogs can be deleted" });
    }
  }
);

blogsRouter.put("/:id", async (request, response) => {
  const body = request.body;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });
  if (updatedBlog) {
    response.json(updatedBlog);
  } else {
    response.status(404).end();
  }
});

module.exports = blogsRouter;
*/
