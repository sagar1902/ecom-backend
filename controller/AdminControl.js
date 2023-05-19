const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
let success = false;
const getAllUsersInfo = async (req, res) => {
    try {
        const data = await User.find().select('-password');
        // console.log(data);
        res.send(data)

    } catch (error) {
        console.log(error);
        res.status(400).send("Something went wrong")
    }
}
const getSingleUserInfo = async (req, res) => {
    const { userId } = req.params;
    const findUser = await User.findById(userId)
    if (findUser) {
        try {
            const findUser = await User.findById(userId).select('-password');
            res.send(findUser);
        } catch (error) {
            res.status(400).send("Something went wrong")
        }
    }
    else {
        res.status(400).send("User Not Found")
    }

}
const getUserCart = async (req, res) => {
    const { userId } = req.params;
    const findUser = await User.findById(userId)
    if (findUser) {
        try {
            const findUserCart = await Cart.find({ user: userId })
                .populate("products.productId", "name price image rating type")
                .populate("user", "name email");
            res.send(findUserCart);
        } catch (error) {
            res.status(400).send("Something went wrong")
        }
    }
    else {
        res.status(400).send("User Not Found")
    }

}
const getUserWishlist = async (req, res) => {
    const { userId } = req.params;
    const findUser = await User.findById(userId)
    if (findUser) {
        try {
            const findUserWishlist = await Wishlist.find({ user: userId }).populate("productId")
            res.send(findUserWishlist);
        } catch (error) {
            res.status(400).send("Something went wrong")
        }
    }
    else {
        res.status(400).send("User Not Found")
    }

}
const getUserReview = async (req, res) => {
    const { userId } = req.params;
    const findUser = await User.findById(userId)
    if (findUser) {
        try {

            const findUserReview = await Review.find({ user: userId })
                .populate("productId", "name price image rating type")
                .populate("user", "firstName lastName");
            res.send(findUserReview);
        } catch (error) {
            res.send("Something went wrong")
        }
    }
    else {
        res.status(400).send("User Not Found")
    }

}

const adminAddUser = async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {

    //     return res.status(400).json({ error: errors.array() })
    // }
    const { firstName, lastName, email, phoneNumber, password, isAdmin } = req.body

    try {
        let user = await User.findOne({ $or: [{ email: email }, { phoneNumber: phoneNumber }] });
        if (user) {
            return res.status(400).send({ error: "Sorry a user already exists" })
        }

        // password hashing
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt)

        // create a new user
        user = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: secPass,
            isAdmin
        });
        const data = {
            user: {
                id: user._id
            }
        };
        success = true
        const authToken = jwt.sign(data, process.env.JWT_SECRET)
        res.send({ success, msg: "Registered User", authToken })
    }
    catch (error) {
        console.log(error)
        res.status(500).send("Internal server error")
    }
}

const deleteUserReview = async (req, res) => {
    const { id } = req.params;
    try {
        let deleteReview = await Review.findByIdAndDelete(id)
        res.send({ msg: "Review deleted successfully" })
    } catch (error) {
        res.status(400).send({ msg: "Something went wrong,Please try again letter", error })
    }
}


const deleteUserCartItem = async (req, res) => {
    // id is products._id not cart_id
    const { userId, id } = req.params;
    // const { pid } = req.body;
    try {
        const cart = await Cart.findOne({user: userId});
        cart.products = cart.products.filter(p => !p._id.equals(id));
        const savedCart = await cart.save();
        res.send({ success:true, msg: "Item deleted successfully" })
        // res.send(savedCart);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
}
// async (req, res) => {
//     const { id } = req.params;
//     try {
//         let deleteCart = await Cart.findByIdAndDelete(id)
//         success = true
//         res.send({ success, msg: "Review deleted successfully" })
//     } catch (error) {
//         res.status(400).send({ msg: "Something went wrong,Please try again letter1" })
//     }
// }
const deleteUserWishlistItem = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
        let deleteCart = await Wishlist.findByIdAndDelete(id)
        success = true
        res.send({ success, msg: "Review deleted successfully" })
    } catch (error) {
        res.status(400).send({ msg: "Something went wrong,Please try again letter" })
    }
}


const updateProductDetails = async (req, res) => {
    const updateProduct = req.body.productDetails;
    // updateProduct.price = parseFloat(updateProduct.price);
    // updateProduct.rating = parseFloat(updateProduct.rating);
    const { id } = req.params;
    const product = await Product.findById(id)
    if (product) {
        try {
            let update = await Product.findByIdAndUpdate(id, { $set: updateProduct })
            success = true
            const findType = await Product.find({ type: "book" }).distinct('category')

            res.send({ success, msg: "Product updated successfully", findType })

        } catch (error) {
            // return res.status(400).send({ success, error: error })
            return res.status(400).send(error)
        }
    }
    else {
        return res.status(400).send({ success, error: "Product not found" })
    }

}

const userPaymentDetails = async (req, res) => {
    const { id } = req.params;
    const findPayment = await Order.find({ user: id })    
    if (findPayment) {
        try {
            res.send(findPayment)
        } catch (error) {
            return res.status(400).send(error)
        }
    }
    else {
        return res.status(400).send({ total: 0 })
    }
}

const addProduct = async (req, res) => {
    const { name, brand, price, category, image, rating, type, author, description, gender } = req.body;
    try {
        await Product.create({ name, brand, price, category, image, rating, type, author, description, gender })
        success = true
        res.send(success)

    } catch (error) {
        console.log(error);
        return res.status(400).send(error)
    }
}

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    let findProduct = await Product.findById(id);
    if (findProduct) {
        try {
            await Product.findByIdAndDelete(id)
            success = true
            res.send(success)
        } catch (error) {
            return res.status(400).send(error)
        }
    }
    else {
        return res.status(400).send({ success, msg: "Product Not Found" })
    }
}

module.exports = {
    getAllUsersInfo, getSingleUserInfo,
    getUserCart, getUserWishlist,
    getUserReview, adminAddUser, deleteUserReview,
    deleteUserCartItem, deleteUserWishlistItem,
    updateProductDetails, userPaymentDetails, addProduct, deleteProduct
}