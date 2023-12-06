const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');



const generateOtp = asyncHandler(async () => {
    try {
        const OTP = otpGenerator.generate(6,{
            upperCaseAlphabets: true,
            specialChars:false
        })
        return OTP;
    } catch (error) {
        throw error;
    }
})

const securePassword = async (password) => {
    try {
        const spassword = await  bcrypt.hash(password, 10);
        return spassword;
    } catch (error) {
        throw error;
    }
};

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
            const userData = await User.findOne({ email: email });
            if (userData) {
                const passwordMatch =  bcrypt.compare(password, userData.password);
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
        const { email, name, mobile, password } = req.body;
        req.session.user = { email, name, mobile, password };
        console.log(req.session,'111111111111111111111111111111111111111111111111');
        const Email = req.body.email;
        const Name = req.body.name;
        const Mobile = req.body.mobile;
        const userName = await User.findOne({ name: Name });
        const userMobile = await User.findOne({ mobile: Mobile });
        console.log(userMobile)
        const userEmail = await User.findOne({ email: Email });
        if (Email === userEmail?.email) {
            res.render('userView/signup', {
              massage: "The Email is Already Exist."
            });
        }
        else if (Name === userName?.name) {
            res.render("userView/signup", {
              massage: "The Name is Already Exist.",
            });
            
        }
        else if (Mobile === userMobile?.mobile) {
            res.render("userView/signup", {
              massage: "The Mobile No. is Already Exist.",
            });
            
        }
        else {
                    const spassword = await securePassword(req.body.password);
                    const signupData = new User({
                      name: req.body.name,
                      email: req.body.email,
                      // image: req.file.filename,
                      mobile: req.body.mobile,
                      password: spassword,
                    });
                    const userData = await signupData.save();

            if (userData) {
                    sentOtp(req.body.email, generateOtp);
                    res.redirect('/verify');
                    //   res.render("userView/signup", { massage: "Succsesful." });
                    } else {
                      res.render("userView/signup", { massage: "Faild!." });
                    }
        }

    } catch (error) {
        throw  error;
    }
})

const loadHome = asyncHandler(async (req, res) => {
    try {
        res.render('userView/home');
    } catch (error) {
        throw new error;
    }
})

const loadOtp = asyncHandler(async (req, res) => {
    try {
        res.render("userView/otp");
    } catch (error) {
        throw new error;
    }
})

const sentOtp = asyncHandler(async (email, otp) => {
    try {
        console.log('1');
        
        console.log(email);
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: 'mqrt vpym ersh yhug',
            },
        });
        console.log(process.env.USER);
        const mailOptios = {
            form: process.env.USER,
            to: email,
            subject: "Verify Your Signup",
            text: `${otp} is $}`,
        };
        transporter.sendMail(mailOptios, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("email send successfully!");
                console.log("massage sent:%s", info.massageId);
            }
        });
    } catch (error) {
        throw  error;
    }
});



module.exports = {
  loadHome,
  loadSignin,
  verifySignin,
  loadSignup,
    verifySignup,
  sentOtp,
  loadOtp,

};