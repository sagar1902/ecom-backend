const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const authUser = require("../middleware/authUser");

// get all cart products
router.get("/fetchcart", authUser, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate("products.productId", "name price image rating type")
            .populate("user", "name email");
        res.send(cart);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
});

const addcart = async (req, res) => {
    try {
        const { _id, quantity } = req.body;
        const findProduct = await Cart.findOne({ $and: [{ productId: _id }, { user: req.user.id }] })
        if (findProduct) {
            return res.status(400).json({ msg: "Product already in a cart" })
        }
        else {
            const user = req.header;
            const cart = new Cart({
                user: req.user.id,
                products: [{ productId: _id, quantity }],
            });
            const savedCart = await cart.save();
            return res.send(savedCart);
        }
    } catch (error) {
        return res.status(500).send("Internal server error");
    }
}

// add to cart

router.post("/addcart", authUser, addcart);

router.post("/addtocart", authUser, async (req, res) => {
    // const { id } = req.params;
    const { _id, quantity } = req.body;
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart || cart.length===0) { addcart(req,res) }
        else {
            if (!cart.products.some(item => item.productId.equals(_id))){
                cart.products.push({productId: _id, quantity})
            }
            else{
                cart.products.map(p=>{
                    if(p.productId.equals(_id)){
                        p.quantity+=quantity
                    }
                })
            }
            // cart.products = [...cart.products, { productId: _id, quantity }]
            const savedCart = await cart.save()
            res.send(savedCart);
        }
        // const result = await Cart.findById()
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

router.put("/updatecartitem/:id", authUser, async (req, res) => {
    const { id } = req.params;
    const { pid, quantity } = req.body;
    try {
        let cart = await Cart.findById(id);
        cart.products = cart.products.map(v => {
            if (v.productId.equals(pid)) {
                v.quantity = quantity;
            }
            return v;
        })
        const savedCart = await cart.save();
        res.send(savedCart)
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

router.delete("/deletefromcart/:pid", authUser, async (req, res) => {
    // id is products._id not cart_id
    const { pid } = req.params;
    // const { pid } = req.body;
    try {
        const cart = await Cart.findOne({user: req.user.id});
        cart.products = cart.products.filter(p => !p._id.equals(pid));
        const savedCart = await cart.save();
        res.send(savedCart);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

// remove from cart
router.delete("/deletecart/:id", authUser, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Cart.findByIdAndDelete(id)
        res.send(result);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
});
module.exports = router;
