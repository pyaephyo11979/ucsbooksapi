//expres
const express = require('express');
const app = express();
const router = require('./router');
//bodyparser
const bodyParser = require('body-parser');
const port=process.env.PORT || 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
  });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/',router);
app.listen(port,()=>{
    console.log(`Server is starting at https://localhost:${port}`);
})