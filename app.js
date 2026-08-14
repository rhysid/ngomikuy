const express = require('express'); 
const app = express();

app.get('/', async(req,res) => {
  res.send("coming soon")
})

app.listen("80")
