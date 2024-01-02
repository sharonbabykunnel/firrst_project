const isAdminLogged = (req, res, next) => {
  console.log(req.session.admin);
  if (req.session.admin) {
    next();
  } else {
    // next();
    res.redirect("/admin/login");
  }
};

const isAdminNot = (req, res, next) => {
  console.log(req.session.admin);
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