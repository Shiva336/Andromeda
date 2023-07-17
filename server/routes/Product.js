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
    console.log(req.body);
    const user = await userModel.findOne({ name: req.body.username });
    const idx = JSON.stringify(user.userindex+1);
    let filePath = '../graphrec/data/user_item_ratings.json';
    const product = await productModel.findOne({_id: req.body.id})
    const productIndex = product.index;
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
        return res.status(500).json({ message: 'Error reading the file' });
      }
  
      try {
        const jsonData = JSON.parse(data);
        jsonData[idx] = jsonData[idx].push(req.body.rating);
        fs.writeFile(filePath, JSON.stringify(jsonData), 'utf8', (err) => {
          if (err) {
            console.error('Error writing to the file:', err);
            return res.status(500).json({ message: 'Error writing to the file' });
          }
        });
      } catch (parseError) {
        console.error('Error parsing the file content as JSON:', parseError);
        res.status(500).json({ message: 'Error parsing the file content as JSON' });
      }
    })
    //item user rating
    
    filePath = '../graphrec/data/item_user_ratings.json';
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
        return res.status(500).json({ message: 'Error reading the file' });
      }
  
      try {
        const pidx = JSON.stringify(productIndex);
        const jsonData = JSON.parse(data);
        jsonData[pidx] = jsonData[pidx].push(req.body.rating);
        fs.writeFile(filePath, JSON.stringify(jsonData), 'utf8', (err) => {
          if (err) {
            console.error('Error writing to the file:', err);
            return res.status(500).json({ message: 'Error writing to the file' });
          }
        });
      } catch (parseError) {
        console.error('Error parsing the file content as JSON:', parseError);
        res.status(500).json({ message: 'Error parsing the file content as JSON' });
      }
    })
  }
  catch(err) {
      return res.status(500).json(err);
  }
});

module.exports = router;