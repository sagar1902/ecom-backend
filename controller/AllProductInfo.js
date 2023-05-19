const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Review = require("../models/Review");
const Payment = require("../models/Payment")
const Order = require("../models/Order");
const Product = require("../models/Product")


const chartData = async (req, res) => {
    try {
        const cart = await Cart.find().populate("products.productId");
        const wishlist = await Wishlist.find().populate("productId");

        // const payment = await Payment.find();
        const payment = await Order.find();
        const product = await Product.find();
        const review = await Review.find();
        res.send({ review:review?review:{}, product:product?product:{}, payment:payment?payment:{}, wishlist:wishlist?wishlist:{}, cart:cart?cart:{} });
    } catch (error) {
        res.status(400).send(error);

    }
}
module.exports = { chartData }