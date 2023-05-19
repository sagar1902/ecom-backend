const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Review = require("../models/Review");

const deleteAllUserData = async (req, res) => {
    const { userId } = req.params;
    const findUser = await User.findById(userId)
    if (findUser) {
        try {
            await User.findByIdAndDelete(userId);
            await Cart.deleteMany({ user: userId });
            await Wishlist.deleteMany({ user: userId });
            await Review.deleteMany({ user: userId });
            res.send("delete successfully")
        } catch (error) {
            res.send("Something went wrong")
        }
    }
    else {
        res.status(400).send("User Not Found")
    }
}
module.exports = { deleteAllUserData }