const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Category = require('../model/categoryModel');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const loadLogin = asyncHandler(async (req, res) => {
    try {
        res.render('auth/page-admin-login');
    } catch (error) {
        throw error;
    }
});

const verifyLogin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email,password)
        const adminData = await User.findOne({ email: email, is_admin: 1 });
        if (adminData) {
            const passwordMatch = await bcrypt.compare(password, adminData.password);
            if ( passwordMatch) {
                req.session.admin = adminData;
                res.redirect('/admin');
            } else {
                console.log('2')
                res.render('auth/page-admin-login', { message: "Incorrect Password." });
            }
        } else {
            console.log('3')
            res.render('auth/page-admin-login.ejs', { message: "Your are not Admin." });
        }
    } catch (error) {
        throw error;
    }
})

const loadDashboard = asyncHandler(async (req, res) => {
    try {
        const products = (await Product.find()).length;
        const category = (await Category.find()).length;
        res.render('adminView/index',{products, category});
    } catch (error) {
        throw error;
    }
})

const loadUsers = asyncHandler(async (req, res) => {
    try {
        let search = '';
        if (req.query.search) {
            search = req.query.search;
        }
        let page =  req.query.page;
        let limit = 5;
        const userData = await User.find({
            is_admin: 0,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const count = await User.find({
            is_admin: 0,
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        })
            .countDocuments();
        res.render('adminView/page-users-list', { user: userData, totalPage: Math.ceil(count/limit), currentPage:page ,search});
    } catch (error) {
        throw error;
    }
});

const loadUserDetails = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id;
        const objectId = mongoose.Types.ObjectId.isValid(id);
        if (objectId) {
            const user = User.findById(id);
            res.render("adminView/page-user-details", { user:user });
        } else {
            res.redirect('/*');
        }
  } catch (error) {
    throw error;
  }
});

const loadCategory = asyncHandler(async (req, res) => {
    try {
        const { id, message, search } = req.query;
        let Cate
        if (id) { 
            Cate = await Category.findById( id );
        }
        let query = {};
        if (search) {
            query.$or = [{ name: { $regex: new RegExp(search, 'i') } }, { discription: { $regex: new RegExp(search, 'i') } }];
        }
        let category = await Category.find(query);
        
        res.render("adminView/page-categories", { category: category, Cate:Cate, message: message, });
    } catch (error) {
        throw  error;
    }
});

const addCategory = asyncHandler(async (req, res) => {
    try {
        const { name, slug, discription, id } = req.body;
        const Name = await Category.find({ name: name });
        console.log(Name);
        const Slug = await Category.findOne({ slug: slug });
        if ( Name[0] && id != Name[0]?._id) {
            res.redirect(`/admin/category?id=${id}&message='The Product is Already Exist'`);
        }
        else if (Slug && id != Slug._id) {
            res.redirect(`/admin/category?id=${id}&message='The Slug is already exist'`);
        }
        else if (id) {
            await Category.findByIdAndUpdate( id , { $set: { name: name, slug: slug, discription: discription ,status:status} });
            res.redirect(`/admin/category?&message='Category Updatd successfully'`);
        } else {
        const category = new Category({
          name: name,
          slug: slug,
          discription: discription,
          status: status
        });
        category.save();
        res.redirect(`/admin/category?${id}&message='Category Added Successfully'`); 
        }

  } catch (error) {
    throw  error;
  }
});

const deletCategory = asyncHandler(async (req, res) => {
  try {
      const id = req.query.id;
      await Category.findOneAndDelete({ _id: id });
      res.redirect('/admin/category',);
  } catch (error) {
    throw  error;
  }
});

const status = asyncHandler(async (req, res) => {
  try {
      const { id, status } = req.query;
      if(status == 0){
          await User.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: 1 } });
      } else {
            await User.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: 0 } });
      }
    res.redirect("/admin/users");
  } catch (error) {
    throw error;
  }
});

const loadError = asyncHandler(async (req, res) => {
  try {
    res.render("userView/error-404");
  } catch (error) {
    throw error;
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
    try {
        res.render('auth/page-forgot-password');
    } catch (error) {
        throw error;
    }
});

const changePassword = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        const Email = await User.findOne({ email: email });
        if (Email) {
            const spassword = await bcrypt.hash(password, 10);
            await User.updateOne({ email: email }, { $set: { password: spassword } });
            res.redirect('/admin/login')
        } else {
            res.render('auth/page-forgot-password',{message:'Email Not registerd'})
        }
    } catch (error) {
        throw error;
    }
});

const logout = asyncHandler(async (req, res) => {
    try {
        console.log("logout");
        console.log(req.session);
        req.session.destroy();
        console.log(req.session);
        res.redirect('/admin/login');
  } catch (error) {
    throw error;
  }
});

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadUsers,
    loadUserDetails,
    loadCategory,
    addCategory,
    deletCategory,
    status,
    loadError,
    forgotPassword,
    changePassword,
    logout,
};
