const express = require('express');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const productModel = require('../models/product');
const url = 'mongodb+srv://admin:admin@andromeda.esfay3s.mongodb.net/andromeda';
const { config } = require('dotenv');

config({ path: '../config/config.env' });
mongoose.set('strictQuery', false);
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once('open', () => {
  console.log('connected');
});

// READ JSON FILE
const product = JSON.parse(fs.readFileSync(`./product-data.json`, 'utf-8'));
// IMPORT DATA INTO DB
console.log(product.length);
const importData = async () => {
  try {
    for (i = 0; i < product.length; i++) {
      const newProduct = new productModel({
        name: product[i].name,
        highlights: product[i].highlights,
        category: product[i].category,
        price: product[i].price,
        img: product[i].img,
        featured: product[i].featured,
      });
      console.log(newProduct);
      const Product = await newProduct.save();
    }
  } catch (err) {
    console.log(err);
  }
};

importData();
