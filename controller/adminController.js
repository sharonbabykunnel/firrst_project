const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Category = require('../model/categoryModel');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require("uuid");

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

const loadUsers = asyncHandler(async (req, res) => {
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }
        var page =  req.query.page;
        var limit = 5;
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
        res.render('adminView/page-users-list', { user: userData, totalPage: Math.ceil(count/limit), currentPage:page });
    } catch (error) {
        throw new error;
    }
});

const loadUserDetails = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id;
        const user = User.findById(id);
        res.render("adminView/page-user-details", { user:user });
  } catch (error) {
    throw new error;
  }
});

const loadProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.find();
        res.render('adminView/page-products-list',{product:product});
    } catch (error) {
        throw  error;
    }
})

const loadEditProduct = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id;
        const data = await Product.findById(id);
        const category = await Category.find();
        res.render('adminView/page-product-edit', { product: data, category: category, message: '' });
  } catch (error) {
    throw  error;
  }
});

const editProduct = asyncHandler(async (req, res) => {
    try {
        const { id, title, price, discription, color, size, brand, category, status } = req.body;
        if (price < 1) {
                    const data = await Product.findById(id);
                    const category = await Category.find();
                    res.render("adminView/page-product-edit", {
                      product: data,
                      category: category,
                      message: "prise can't be under 1$",
                    });
        }
        const data = await Product.findById(id);
        if (req.files && req.files.length > 0) {
           var image = req.files.map((image) => image.filename);
        } else {
           var image = data.image;
        }
        console.log(id, image, data);

        if (image) {
        console.log(id,image,data)
        }
        // const imageArray = image.map((image, i) => image === '' ? data.image[i] : image );
        await Product.findByIdAndUpdate({ _id: id },
            {
                $set: {
                    title: title,
                    price: price,
                    color: color,
                    brand: brand,
                    category: category,
                    discription: discription,
                    size: size,
                    status: status,
                    image:image
                }
            })
        res.redirect(`/admin/editProduct?id=${id}`)
    } catch (error) {
        throw error;
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id;
        await Product.findByIdAndDelete(id);
        res.redirect('/admin/product');
    } catch (error) {
        throw error;
    }
})

const loadAddProduct = asyncHandler(async (req, res) => {
    try {
        res.render('adminView/page-product-form-3');
  } catch (error) {
    throw new error;
  }
});

const addProduct = asyncHandler(async (req, res) => {
    try {
        const product_id = uuidv4();
        const imageArray = req.files.map((image) => image.filename);
        const { title, color, size, brand, discription, price, status, category, quantity } = req.body;
        const product = new Product({
            product_id: product_id,
            title: title,
            color: color,
            size: size,
            brand: brand,
            quantity: quantity,
            discription: discription,
            image: imageArray,
            price: price,
            status: status,
            category:category
        });
        product.save();
        res.render('adminView/page-product-form-3', { message: "Prodect added Successfully!." });
  } catch (error) {
    throw  error;
  }
});

const loadCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.query;
        const Cate = await Category.findOne({ _id: id });
        const category = await Category.find({});
        console.log(Cate, category);
        res.render("adminView/page-categories", { category: category, message: 'Category added Successfully', });
    } catch (error) {
        throw  error;
    }
});

const addCategory = asyncHandler(async (req, res) => {
    try {
        const { name, slug, discription, id } = req.body;
        const Name = Category.findOne({ name: name });
        // const Slug = Category.findOne({ slug: slug });
        // const Dis = Category.fingOne({ discription: discription });
        if (name === Name.name) {
            res.render('adminView/page-category',{category:category,message:'This category is already Exist.'})
        }
        if (id) {
            Category.findByIdAndUpdate({ _id: id }, { $set: { name: name, slug: slug, discription: discription ,category_id:category_id,order:order,status:status} });
            res.redirect("/admin/category");
        } else {
        const category_id = uuidv4();
        const category = new Category({
          name: name,
          slug: slug,
          discription: discription,
          category_id: category_id,
          status: status
        });
        category.save();
        res.redirect("/admin/category"); 
        }

  } catch (error) {
    throw  error;
  }
});

const deletCategory = asyncHandler(async (req, res) => {
  try {
      const id = req.query.id;
      console.log(id)
      const delet = await Category.findOneAndDelete({ _id: id });
      console.log(delet,'deleted')
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

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadUsers,
    loadUserDetails,
    loadProduct,
    loadEditProduct,
    editProduct,
    deleteProduct,
    loadAddProduct,
    addProduct,
    loadCategory,
    addCategory,
    deletCategory,
    status,
};
