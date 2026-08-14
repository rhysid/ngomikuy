
const express = require('express'); 
const app = express();

app.get('/', async(req,res) => {
  res.send("njir")
})

app.listen("80")
