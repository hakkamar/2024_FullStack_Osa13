const Blog = require("./blog");
const User = require("./user");
const Readinglist = require("./readinglist");
const Membership = require("./membership");

User.hasMany(Blog);
Blog.belongsTo(User);

Blog.belongsToMany(Readinglist, { through: Membership });
Readinglist.belongsToMany(Blog, { through: Membership });

User.belongsToMany(Readinglist, { through: Membership, as: "readings" });
Readinglist.belongsToMany(User, { through: Membership, as: "readinglists" });

// Siirrytään Integraatioon
//Blog.sync({ alter: true });
//User.sync({ alter: true });

module.exports = {
  Blog,
  User,
  Readinglist,
  Membership,
};
