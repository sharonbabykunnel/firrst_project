const user = require('../model/userModel');

const isLogged = ((req, res, next) => {
    if (req.session.user) {
        user.findById(req.session.user._id).lean()
            .then((data) => {
                if (data.is_blocked == false) {
                    next();
                } else {
                    // next();
                    res.redirect('/signin');
                }
            })
    } else {
        // next();
        res.redirect('/signin');
    }
});

const isNOtLogged = (req, res, next) => {
  if (!req.session.user?._id) {
      next();
  } else {
      res.redirect("/");
  }
};



module.exports = {
    isNOtLogged,
    isLogged
}
