const user = require('../model/userModel');

const isLogged = ((req, res, next) => {
    if (req.session.user) {
        console.log(req.session.user,'user')
        user.findById(req.session.user._id).lean()
            .then((data) => {
                console.log(data,'data');
                if (data.is_blocked == false) {
                    console.log(data,'ta');
                    next();
                } else {
                    console.log(data,'da');
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
  if (!req.session.user) {
      next();
  } else {
      res.redirect("/");
  }
};



module.exports = {
    isNOtLogged,
    isLogged
}
