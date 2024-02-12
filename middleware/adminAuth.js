const isAdminLogged = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

const isAdminNot = (req, res, next) => {
  if (!req.session.admin) {
      next();
    } else {
      res.redirect("/admin");
  }
};

module.exports = {
    isAdminLogged,
    isAdminNot
}