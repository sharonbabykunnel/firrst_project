const user = require('../model/userModel');

const isLogged = ((req, res, next) => {
    if (req.session.user) {
        user.findById(req.session.user.id).lean()
            .then((data)=> {
    if (data.is_blocked == false) {
        next();
    } else {
        res.redirect('/signin');
    }
        })
    } else {
        res.redirect('/signin');
    }
})

const isAdminLogged = ((req, res, next) => {
    if (req.session.admin==true) {
        next();
    } else {
        res.redirect('/login');
    }
})

module.exports = {
    isAdminLogged,
    isLogged
}
