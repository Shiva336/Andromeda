const router = require("express").Router();
const productModel = require("../models/product");
const userModel = require("../models/users");

//get all products
router.get("/", async(req,res)=> {
  try{
    const products =  await productModel.find({});  
    res.status(200).json(products);
  }
  catch(err) {
    return res.status(500).json(err);
  }
});

router.get("/featured", async(req,res)=> {
  try{
    const products =  await productModel.find({ featured: true});
    res.status(200).json(products);
  }
  catch(err) {
    return res.status(500).json(err);
  }
});

//get one product
router.get("/:id", async(req,res)=> {
  try{
    const products =  await productModel.findById(req.params.id);

    res.status(200).json(products);
  }
  catch(err) {
    return res.status(500).json(err);
  }
});

//get products by category
router.get("/category/:category", async(req,res)=> {
    try{
        const products = await productModel.find({ category: req.params.category});
        res.status(200).json(products);
      }
      catch(err) {
        return res.status(500).json(err);
      }
});

//get products by name
router.get("/productname/:name", async(req,res)=> {
  try{
      const products = await productModel.find({ name: req.params.name});
      res.status(200).json(products);
    }
    catch(err) {
      return res.status(500).json(err);
    }
});

//add product
router.post("/", async(req,res)=> {
    try {
        const newProduct = new productModel({
            name: req.body.name,
            highlights: req.body.highlights,
            category: req.body.category,
            price: req.body.price,
            img: req.body.img,
            featured:req.body.featured
        });

        const Product = await newProduct.save();
        res.status(200).json(Product);
    }
    catch(err) {
        return res.status(500).json(err);
    }
});

//product search
router.put("/search",async(req,res)=> {
  try{
    const user = userModel.findOne({name: req.body.username}); 
    const product = productModel.findById(req.body.product_id);
    let flag = -1;
    user.searchData.map((item)=> {
      if(product.name === item.product) {
        flag = 1;
        item.value = item.value+1;
      }
    });
    
    if(flag === -1) {
      const data = {product: product.name, value: 1}
      user.searchData.push(data);
      await user.save();
    }

  }
  catch(error) {
    return res.status(500).json(error);
  }
})

//update rating
router.put("/:id/rating", async(req,res)=> {
    try {
        const product = await productModel.findById(req.params.id);
        if(product.rating) {
          product.rating.map((rate)=> {
            if(rate.username === req.body.username)
            {
              flag = 1;
              res.status(200).json(product);
            }
          })
        }
        const updatedRating = {
          rating: req.body.newrating,
          username: req.body.username
        }
        await product.updateOne({ $push: { rating: updatedRating} });

        //user item rating
        const products = await productModel.find({});
        const i = products.findIndex({name: req.body.id});

        //item user rating
        res.status(200).json("The rating has been updated");
    }
    catch(err) {
        console.log(err);
    }
});

//update review
router.put("/:id/review", async(req,res)=> {
  try {
      const product = productModel.findById(req.params.id);
      await product.updateOne({ $push: { reviews: req.body.newreview} });
      console.log(req.body.newreview);
      res.status(200).json("The review has been updated");
  }
  catch(err) {
      console.log(err);
  }
});

router.put("/remove", async (req,res)=> {
  try {
      const product = await productModel.findById(req.body.id);
      if(req.body.username === "admin") {  
          await product.deleteOne({ id: req.body.id});
          res.status(200).json("the product has been removed");
      }   
      else {
          res.status(403).json("you are not an admin");
      }
  }
  catch(err) {
      res.status(500).json(err);
  }
});

//update rating dataset
router.put("/rating-updation", async(req,res)=> {
  try {
    //user item rating
    const user = req.body.username;
    const users = await userModel.find({});
    const userarray = Object.values(users).map(ob=>ob)
    const idx = userarray.findIndex(obj=> obj.name === user)

    const person = await userModel.find({name: user});
    await person.updateOne({$push: {rated: req.body.rating}});

    //item user rating
    const product = req.body.product;
    const products = await productModel.find({});
    const productarray = Object.values(products).map(ob=>ob)
    const index = productarray.findIndex(obj => obj._id === product);
    
  }
  catch(err) {
      return res.status(500).json(err);
  }
});

module.exports = router;