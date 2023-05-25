const express = require('express');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const productModel = require('../models/product');
const url = 'mongodb+srv://admin:admin@shophere.goowmfm.mongodb.net/test';
const { config } = require('dotenv');

config({ path: './config/config.env' });

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
  console.log('connected');
});

const importData = async () => {
  try {
    res = JSON.stringify(await productModel.find({}));
    fs.writeFile('./product-data.json', res, (err) => {
      if (err) throw err;
    });
  } catch (e) {
    console.log(e);
  }
};

importData();
