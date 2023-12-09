const asyncHandler = require('express-async-handler');
const user = require('../model/userModel');
const bcrypt = require('bcrypt');

const loadLogin = asyncHandler(async (req, res) => {
    try {
        res.render('adminView/login');
    } catch (error) {
        throw error;
    }
});

const verifyLogin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email,password)
        const adminData = await user.findOne({ email: email, is_admin: 1 });
        console.log(adminData)
        if (adminData) {
            const passwordMatch = await bcrypt.compare(password, adminData.password);
            if (passwordMatch) {
                res.redirect('/admin/dashboard');
            } else {
                res.render('adminView/login', { message: "Incorrect Password." });
            }
        } else {
            res.render('adminView/login', { message: "Your are not Admin." });
        }
    } catch (error) {
        throw error;
    }
})

const loadDashboard = asyncHandler(async (req, res) => {
    try {
        res.render('adminView/index');
    } catch (error) {
        throw new error;
    }
})

const loadUser = asyncHandler(async (req, res) => {
    try {
        const userData = await user.find({
            is_admin:0
        })
        res.render('adminView/user',{user:userData});
    } catch (error) {
        throw new error;
    }
})

const loadProdect = asyncHandler(async (req, res) => {
    try {
        res.render('adminView/page-form-Product-1');
    } catch (error) {
        throw new error;
    }
})

const loadAddProdect = asyncHandler(async (req, res) => {
  try {
      res.render('adminView/addProdect');
  } catch (error) {
    throw new error();
  }
});

const loadCategory = asyncHandler(async (req, res) => {
  try {
    res.render("adminView/page-categories");
  } catch (error) {
    throw new error();
  }
});

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadUser,
    loadProdect,
    loadAddProdect,
    loadCategory,
};