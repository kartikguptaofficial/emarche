const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs")
const jwt = require("jsonwebtoken");
const { User, Product } = require("./database");
const path = require("path")
require("dotenv").config({path: "./config.env"});

const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors(
    // origin: "http://localhost:3000"
));

app.post("/signup", async (req,res) => {
    const { name, phone, email, password } = req.body;
    const admin = false
    const findUser = await User.findOne({email})
    if(findUser){
        res.status(500).json({msg: "You are already registered"})
    }
    else{
        const saveData = new User({name, phone, email, password, admin});
        const data = await saveData.save();
        
        if(data) {
            res.status(200).json({msg: "Data sent"})
        }
    }
})

app.post("/login", async (req,res) => {
    const { email,password } = req.body;

    const checkUser = await User.findOne({email})
    if(!checkUser) {
        res.status(500).json({msg: "Not registered"})
    }
    else if(password != checkUser.password){
        res.status(500).json({msg: "Invalid Password"})
    }
    else{
        const token = jwt.sign(
            {name: checkUser.name, phone: checkUser.phone ,email: checkUser.email, password: checkUser.password, admin: checkUser.admin, cart: checkUser.cart},
            "secret123")
        res.status(500).json({msg: checkUser, token: token})
    }
})

app.get("/home", async (req,res) => {
    const token = req.headers.authorization;
    // console.log(token)
    if(token) {
        const verifyToken = jwt.verify(token, "secret123", (err,user) => {
            if(user) {

                res.status(200).json({user})
            }
        });
    }
})

app.get("/products", async (req,res) => {
    const getData = await Product.find().sort({_id: -1});
    if(getData) {
        res.status(200).json({data: getData})
    }
    else{
        res.json("error")
    }
})

// app.get("/getusers", async (req,res) => {
//     const getData = await User.find({});
//     if(getData) {
//         res.status(200).json({data: getData})
//     }
// })

app.post("/admin", async (req,res) => {
    const { name, description, costprice, sellingprice, mrp, category, gender, img1, img2, img3, img4, img5, img6, img7, img8, linkToProduct } = req.body;

    const newData = new Product({name, description, costprice, sellingprice, mrp, category, gender, img1, img2, img3, img4, img5, img6, img7, img8, linkToProduct});
    const saveData = await newData.save();

    if(saveData) {
        res.status(200).json({msg: "inserted!"})
    }
})

app.post("/edit/:id", async (req,res) => {
    const id = req.params.id;
    const { name, costprice, sellingprice, img1, img2, img3, img4 } = req.body;
    const update = await Product.updateOne({_id: id}, {$set: {name, costprice, sellingprice, img1, img2, img3, img4}})

    if(update){
        res.json({msg: "Updated"})
    }
})

app.get("/allproducts/:category/:gender/:filter", async(req,res) => {
    const category = req.params.category;
    const gender = req.params.gender;
    const filter = req.params.filter;
    
    let findProduct;
    if(gender === "male" || gender === "female"){
        findProduct = await Product.find({category, gender}).sort({_id: -1});
    } else if(gender === "both" || gender === "unisex"){
        findProduct = await Product.find({category}).sort({_id: -1});
        // console.log(findProduct.name)
    }
    if(filter === "lowtohigh"){
        findProduct = findProduct.sort((a, b) => (a.sellingprice > b.sellingprice) ? 1 : -1)
    } else if(filter === "hightolow"){
        findProduct = findProduct.sort((a, b) => (a.sellingprice < b.sellingprice) ? 1 : -1)
    } else if(filter === "all"){
        findProduct;
    } 
    if(findProduct){
        res.json(findProduct)
        // console.log(findProduct.length)
    }
})

app.post("/addToCart/:id", async (req,res) => {
    const token = req.headers.authorization;
    // console.log(token)
    if(token) {
        const verifyToken = jwt.verify(token, "secret123", (err,user) => {
            if(user) {
                // if(!User.cart.includes(req.params.id)){
                //     const updateCart = await User.updateOne({$push: {cart: req.params.id}})
                // }
                res.status(200).json(user.cart)
            }
        });
    } else {
        res.status(500).json("Login first!")
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})