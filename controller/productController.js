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
    let {
      title,
      color,
      size,
      brand,
      discription,
      price,
      status,
      category,
      quantity,
      discount,
    } = await req.body;
    let Title = await Product.findOne({ title: title });
    if (Title) {
      res.redirect("/admin/addProduct?message=Product is Already Exist.");
    } else if (Number(quantity) < 1 || isNaN(Number(quantity))) {
      res.redirect("/admin/addProduct?message= INvalid Quantity Value.");
    } else if (Number(discount) < 1 || isNaN(Number(discount))) {
      res.redirect("/admin/addProduct?message= INvalid discount Value.");
    } else if (Number(price) < 1 || isNaN(Number(price))) {
      res.redirect("/admin/addProduct?message=Invalid Price Value.");
    } else if (!isNaN(Number(size)) && Number(size) < 1) {
      res.redirect("/admin/addProduct?message=Size is not correct.");
    } else {
      const productObj = {
        title: title,
        color: color,
        size: size,
        brand: brand,
        quantity: quantity,
        discription: discription,
        image: imageArray,
        price: price,
        status: status,
        category: category,
        discount,
        discountPrice: calculateDiscountPrice.call({price,discount})
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
    const product = await Product.find();
    res.render("adminView/page-products-list", { product: product });
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
      category,
      quantity,
      status,
      discount,
    } = req.body;
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
    } else if (Number(quantity) < 1 || isNaN(Number(quantity))) {
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
          const updateObj = {
            $set: {
              title: title,
              price: price,
              color: color,
              brand: brand,
              category: category,
              discription: discription,
              quantity: quantity,
              size: size,
              status: status,
              image: image,
              discount: discount,
              discountPrice: calculateDiscountPrice.call({ price, discount }),
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
    console.log(review,star,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    const id = req.query.id;
    const product = await Product.findById(id);
    const alreadyRated = product.rating.find((userId) => userId.postedby == user._id);
    console.log(alreadyRated);

    if (alreadyRated) {
      console.log('enene');
      const ss = await Product.updateOne({ rating: { $elemMatch: alreadyRated } }, { $set: { "rating.$.star": star, "rating.$.review": review } }, { new: true });
      console.log(ss,'kkkk');
    } else {
      await Product.findByIdAndUpdate(id, { $push: { rating: { review,star, postedby: user._id } } }, { new: true });
    }
    const getallratings = await Product.findById(id)
    console.log(getallratings,'ttt');
    

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
}