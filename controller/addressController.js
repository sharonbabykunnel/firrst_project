const asyncHandler = require("express-async-handler");
const Address = require("../model/addressModel");
const Wishlist = require("../model/wishlistModel");
const Cart = require("../model/cartModel");

const loadProfile = asyncHandler(async (req, res) => {
  try {
      const user = req.session.user;
      const [wishlist, cart, addressData] = await Promise.all([Wishlist.findOne({ user: user._id }, { product: 1 }), Cart.findOne({ user: user._id }), Address.findOne({ user: user._id })]);
      const cartNum = cart?.product.length;
    res.render('userView/profile', { user, wishlist, cartNum ,addressData})
  } catch (error) {
    throw error;
  }
});

const addAddress = asyncHandler(async (req, res) => {
    try {
        const user = req.session.user
        const { name, mobile, building, streat, district, state, country, pincode, landmark } = req.body;
        await Address.findOneAndUpdate(
            { user: user._id },
            { $push: { address: { name, mobile, building, streat, district, state, country, pincode, landmark } } },
            { upsert: true, new: true }
        );
        res.redirect("/profile");
    } catch (error) {
        throw error;
    }
});

const editAddress = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        const { country, state, district, streat, building, pincode, mobile, landmark, name } = req.body;
        await Address.updateOne({ 'address._id': id }, { $set: { 'address.$': { country, state, district, streat, building, pincode, mobile, landmark, name } } });
        res.redirect("/profile");
    } catch (error) {
        throw error;
    }
});

const deleteAddress = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        await Address.updateOne({}, { $pull: { address: { _id: id } } });
        res.redirect("/profile");
    } catch (error) {
        throw error;
    }
})

module.exports = {
    addAddress,
    loadProfile,
    editAddress,
    deleteAddress,
}
