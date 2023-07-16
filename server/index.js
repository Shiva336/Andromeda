const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const app = express();
const url = 'mongodb+srv://admin:admin@andromeda.esfay3s.mongodb.net/andromeda';
const { config } = require('dotenv');

config({ path: './config/config.env' });

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false });
mongoose.connection.once('open', () => {
  console.log('connected');
});

//middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

const authRouter = require('./routes/Auth');
app.use('/auth', authRouter);
const userRouter = require('./routes/Users');
app.use('/user', userRouter);
const productRouter = require('./routes/Product');
app.use('/product', productRouter);
const cartRouter = require('./routes/Cart');
app.use('/order', cartRouter);
const paymentRouter = require('./routes/Payment');

const chatRouter = require('./routes/chat');
app.use('/gpt/chat', chatRouter);

app.use('/api', paymentRouter);

app.get('/run-python', (req, res) => {
  const pythonFile = '../graphrec/run_GraphRec_example.py';
  const pythonCommand = 'python';

  exec(`${pythonCommand} ${pythonFile}`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(`Error executing Python script: ${error.message}`);
      return;
    }

    const result = stdout || stderr || 'Python script executed successfully.';
    console.log(result)
    res.status(200).json(result);
  });
});


app.listen('3002', () => {});
