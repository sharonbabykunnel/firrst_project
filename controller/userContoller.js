const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const bcrypt = require('bcrypt');





const loadSignin = asyncHandler(async (req, res) => {
    try {
        res.render('userView/signin');
        
    } catch (error) {
        throw new error;
    }
})

const verifySignin = asyncHandler(async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        if (email) {
            const userData = await User.findOne({ emali: email }) 
            if (userData) {
                const passwordMatch = await bcrypt.compare(password, userData.password);
                if (passwordMatch) {
                    res.redirect('/home');
                } else {
                    res.render('userView/signin', { massage: "Incorrect password.Please Retry." });
                }
            } else {
                res.render('userView/signin',{massage:"Email and Password are not Correct."})
            }
        } else {
            res.render('userView/signin', { massage: "Email and Password are not Found!.." });
        }
        
    } catch (error) {
        throw new error;
    }
})

const loadSignup = asyncHandler(async (req, res) => {
    try {
        res.render('userView/signup');
    } catch (error) {
        throw new error;
    }
})

const verifySignup = asyncHandler(async(req, res)=> {
    try {
        const Email = req.body.email;
        const userEmail = await User.findOne({ email: Email });
        if (Email === userEmail) {
            res.render('userView/signup', { massage: "The Email is Already Exist." });
        }
        const spassword = await bcrypt.hash(req.body.password);
        const signupData = new User({
            name: req.body.name,
            email: req.body.email,
            image: req.file.filename,
            password: spassword
        })
        const userData = await signupData.save();

        if (userData) {
            res.render('userView/signup', { massage: "Succsesful." });
        } else {
            res.render('userView/signup', { massage: 'Faild!.' });
        }
    } catch (error) {
        throw new error;
    }
})

const loadHome = asyncHandler(async (req, res) => {
    try {
        res.render('userView/home');
    } catch (error) {
        throw new error;
    }
})

const verifyEmail = asyncHandler(async (req, res) => {
    try {
        
    } catch (error) {
        throw new error;
    }
})

module.exports = {
    loadSignin,
    verifySignin,
    loadSignup,
    verifySignup,
    loadHome,
}