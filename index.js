var express = require("express"); // call express to be used by the application.
var app = express();


var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var db = require('./db');
// set the template engine 
app.set('view engine', 'ejs'); 

const path = require('path');

app.use(express.static("views")); 
app.use(express.static("images")); 
app.use(express.static("sass")); 
app.use(express.static("js")); 
app.use(express.static("css")); 
app.use(express.static("fonts")); 
app.use(express.static("partials")); 
app.use(express.static("uploads")); 
app.use(express.static("uploads/resized")); 
// app.use(express.static("coms")); 
// app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views', 'cart')]);

app.use(require('./routes.js'));

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0" , function(){
    console.log("App is Running ......... Yessssssssssssss!")
  });