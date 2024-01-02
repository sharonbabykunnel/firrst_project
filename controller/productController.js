const Product = require('../model/productModel');
const Cart = require('../model/cartModel');
const User = require('../model/userModel');
const Category = require('../model/categoryModel');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

const loadAddProduct = asyncHandler(async (req, res) => {
  try {
    console.log('p')
    const message = req.query.message;
    res.render("adminView/page-product-form-3", { message });
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
    } = await req.body;
    console.log(req.body);
    let Title = await Product.findOne({ title: title });
    console.log(Title,"kjook");
    if (Title) {
      res.redirect('/admin/addProduct?message=Product is Already Exist.');
    } else if (Number(quantity)<1 || isNaN(Number(quantity))) {
      res.redirect("/admin/addProduct?message= INvalid Quantity Value."); 
    } else if (Number(price) < 1 || isNaN(Number(price))) {
      res.redirect("/admin/addProduct?message=Invalid Price Value.");
    } else if (!isNaN(Number(size)) && Number(size) < 1 ) {
      res.redirect("/admin/addProduct?message=Size is not correct.");
    } else {
      const product = new Product({
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
      });
      product.save();
      res.render("adminView/page-product-form-3", {
        message: "Prodect added Successfully!.",
      });
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
      await Product.findByIdAndUpdate(
        { _id: id },
        {
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
          },
        }
      );
      res.redirect(
        `/admin/editProduct?id=${id}&message='prouduct updated Succseefully'`
      );
    }
  } catch (error) {
    throw error;
  }
});


module.exports = {
  loadAddProduct,
  addProduct,
  deleteProduct,
  editProduct,
  loadEditProduct,
  loadProduct
}