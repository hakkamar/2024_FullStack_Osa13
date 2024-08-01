/*
const app = require("./app"); // varsinainen Express-sovellus
const config = require("./utils/config");
const logger = require("./utils/logger");

//require("dotenv").config();


app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
*/

require("dotenv").config();
const { Sequelize, Model, DataTypes } = require("sequelize");
const express = require("express");
const app = express();

app.use(express.json());

const sequelize = new Sequelize(process.env.POSTGRESDB_URI);

class Blog extends Model {}

Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    author: {
      type: DataTypes.TEXT,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: "blog",
  }
);

Blog.sync();

app.get("/api/blogs", async (req, res) => {
  const blogs = await Blog.findAll();
  res.json(blogs);
});

app.post("/api/blogs", async (req, res) => {
  try {
    console.log(req.body);
    const blog = await Blog.create(req.body);
    // jos tarvetta tämäkin käy...
    //const blog = Blog.build(req.body);
    //blog.likes = 1;
    //await blog.save();
    return res.json(blog);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

app.get("/api/blogs/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  console.log(JSON.stringify(blog, null, 2));

  if (blog) {
    res.json(blog);
  } else {
    res.status(404).end();
  }
});

// Liketys....
app.put("/api/blogs/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    blog.likes = blog.likes + 1;
    await blog.save();
    res.json(blog);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/blogs/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    await Blog.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(204).end();
  } else {
    res.status(404).end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
