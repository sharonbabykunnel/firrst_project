const Product = require('../model/productModel');
const Cart = require('../model/cartModel');
const User = require('../model/userModel');
const Category = require('../model/categoryModel');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

function calculateDiscountPrice() {
  return this.price - (this.price * this.discount) / 100;
}
      
const loadAddProduct = asyncHandler(async (req, res) => {
  try {
    const category = await Category.find();
    const message = req.query.message;
    res.render("adminView/page-product-form-3", { message , category});
  } catch (error) {
    throw  error;
  }
});

const addProduct = asyncHandler(async (req, res) => {
  try {
    const imageArray = req.files?.map((image) => image.filename);
    let { title, color, size, brand, discription, price, status, maincategory, subcategory, quantity, discount, } = await req.body;
    const category = [maincategory, subcategory];
    let Title = await Product.findOne({ title: title });
    if (Title) {
      res.redirect("/admin/addProduct?message=Product is Already Exist.");
    } else if (Number(quantity) < 1 || isNaN(Number(quantity))) {
      res.redirect("/admin/addProduct?message= INvalid Quantity Value.");
    } else if (Number(discount) < 0 || isNaN(Number(discount))) {
      res.redirect("/admin/addProduct?message= INvalid discount Value.");
    } else if (Number(price) < 1 || isNaN(Number(price))) {
      res.redirect("/admin/addProduct?message=Invalid Price Value.");
    } else if (!isNaN(Number(size)) && Number(size) < 1) {
      res.redirect("/admin/addProduct?message=Size is not correct.");
    } else {
      if (Array.isArray(category)) {
        const catPromise = category.map(async (name) => {
          const cat = await Category.findOne({ name, discount: { $gt: 0 } });
          return cat?.discount || 0;
        });
        const catResult = await Promise.all(catPromise);
        var catDiscount = catResult.reduce((acc, cat) => acc + cat, 0);
      } else {
        const cat = await Category.findOne({ name: category });
        var catDiscount = cat?.discount;
      }
      const totalDiscount = Number(catDiscount) + Number(discount);
      const productObj = {
        title,
        color,
        size,
        brand,
        quantity,
        discription,
        image: imageArray,
        price,
        status,
        category,
        discount,
        catDiscount,
        discountPrice: calculateDiscountPrice.call({price,discount:totalDiscount})
      };
      const product = new Product(productObj);
      product.save();
      res.redirect("/admin/addproduct?message=Product Added Successfuly!!");
    }
  } catch (error) {
    throw error;
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const id = req.query.id;
    await Product.findByIdAndDelete(id);
    res.redirect("/admin/product");
  } catch (error) {
    throw error;
  }
});

const loadProduct = asyncHandler(async (req, res) => {
  try {
    const page = 1
    const limit = 10
    const product = await Product.find().sort({ _id: -1 }).limit(limit).skip((page-1)*limit)
    const totalPage = 2
    res.render("adminView/page-products-list", { product: product ,totalPage});
  } catch (error) {
    throw error;
  }
});

const getProduct = asyncHandler(async (req, res) => {
  try {
    const { page, status, search, count } = req.query;
    const limit = count || 10
    let filter = {}
    if (status) {
      filter.status = status
    }
    if (search) {
      filter.title = { $regex: ".*" + search.trim() + ".*", $options: "i" };
    }
    const [product, productCount] = await Promise.all([ Product.find(filter).sort({ _id: -1 }).limit(limit).skip((page-1)*limit),Product.find(filter).countDocuments()])
    const totalPage = Math.ceil(productCount / limit)
    res.json({ product: product ,totalPage});
  } catch (error) {
    throw error;
  }
});

const loadEditProduct = asyncHandler(async (req, res) => {
  try {
    const { id, message } = req.query
    const objectId = mongoose.Types.ObjectId.isValid(id);
    if (objectId) {
      const data = await Product.findById(id);
      const category = await Category.find();
      res.render("adminView/page-product-edit", {
        product: data,
        category,
        message
      });
    } else {
      res.redirect("/*");
    }
  } catch (error) {
    throw error;
  }
});

const editProduct = asyncHandler(async (req, res) => {
  try {
    const {
      id,
      title,
      price,
      discription,
      color,
      size,
      brand,
      subcategory,
      maincategory,
      quantity,
      status,
      discount,
    } = req.body;
    const category = [subcategory,maincategory]
    const Title = await Product.findOne({ title: title, _id: { $ne: id } });
    const data = await Product.findById(id);
    const categoryData = await Category.find();
    let image = data.image;
    if (price < 1) {
      res.render("adminView/page-product-edit", {
        product: data,
        category: categoryData,
        message: "prise can't be under 1$",
      });
    } else if (Number(quantity) < 0 || isNaN(Number(quantity))) {
      res.render("adminView/page-product-edit", {
        product: data,
        category: categoryData,
        message: "INvalid Quantity Value.",
      });
    } else if (Number(price) < 1 || isNaN(Number(price))) {
      res.render("adminView/page-product-edit", {
        product: data,
        category: categoryData,
        message: "prise must be a number",
      });
    } else if (!isNaN(Number(size)) && Number(size) < 1) {
      res.render("adminView/page-product-edit", {
        product: data,
        category: categoryData,
        message: "size is not correct",
      });
    } else if (Title) {
      res.render("adminView/page-product-edit", {
        product: data,
        category:categoryData,
        message: "Product in the same Title is Already Exist",
      });
    } else {
      if (req.files && req.files.length > 0) {
        image = req.files.map((image) => image.filename);
      }
      if (Array.isArray(category)) {
        const catPromise = category.map(async (name) => {
          const cat = await Category.findOne({ name, discount: { $gt: 0 } })
          return cat?.discount || 0;
        })
        const catResult = await Promise.all(catPromise)
        var catDiscount = catResult.reduce((acc, cat) => acc + cat, 0);
      } else {
        const cat = await Category.findOne({ name: category })
        var catDiscount = cat?.discount;
      }
      const totalDiscount = Number(catDiscount)+Number(discount)
          const updateObj = {
            $set: {
              title,
              price,
              color,
              brand,
              category,
              discription,
              quantity,
              size,
              status,
              image,
              discount,
              catDiscount,
              discountPrice: calculateDiscountPrice.call({ price, discount:totalDiscount }),
            },
          };
    await Product.findByIdAndUpdate({ _id: id },updateObj );
      res.redirect(
        `/admin/editProduct?id=${id}&message='prouduct updated Succseefully'`
      );
    }
  } catch (error) {
    throw error;
  }
});

const rating = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    const { review, star } = req.body;
    const id = req.query.id;
    const product = await Product.findById(id);
    const alreadyRated = product.rating.find((userId) => userId.postedby == user._id);
    if (alreadyRated) {
      const ss = await Product.updateOne({ rating: { $elemMatch: alreadyRated } }, { $set: { "rating.$.star": star, "rating.$.review": review } }, { new: true });
    } else {
      await Product.findByIdAndUpdate(id, { $push: { rating: { review,star, postedby: user._id } } }, { new: true });
    }
    const getallratings = await Product.findById(id)
    const ratingsum = getallratings.rating.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
    const ratingcount = getallratings.rating.length || 1;
    const totalrating = Math.round(ratingsum / ratingcount);
    await Product.findByIdAndUpdate(id, { totalrating }, { new: true });
    res.redirect("/productDetails/" + id);
  } catch (error) {
    throw error;
  }
})



module.exports = {
  loadAddProduct,
  addProduct,
  deleteProduct,
  editProduct,
  loadEditProduct,
  loadProduct,
  rating,
  getProduct
}