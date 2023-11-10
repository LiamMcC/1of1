var express = require('express');

var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));
var db = require('../db');
router.use(require('./user'))
// var Email = require("../coms/email.js");




// function to render the home page
router.get('/',  function(req, res){
  const currentRoute = req.url; // or any logic to determine the current route
  let sql = 'SELECT * FROM webContent WHERE home_Show = ? LIMIT 3 ;SELECT * FROM inventItems LIMIT 4;';
  let query = db.query(sql,[1], (err, result) => {  
    
      if(err) throw err;  
      //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors" 
      var description = "Description Goes Here"
      
      res.render('home', {result, title, description, currentRoute,user: req.user});    
      });  
      
 
  });


  router.get('/1of1info/:location',  function(req, res){
    const currentRoute = req.url;
    
    let sql = 'SELECT * FROM webContent WHERE location = ? LIMIT 1;';
  let query = db.query(sql,[req.params.location], (err, result) => {  
    
      if(err) throw err;  
      //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors" 
      var description = "Description Goes Here"
      
      res.render('localSitedetail', {result, title, description, currentRoute,user: req.user});    
      });  
    


});





router.get('/investors', function (req, res) {
  const currentRoute = req.url; // or any logic to determine the current route
  let sql = 'SELECT COUNT(*) as total FROM users WHERE role = ? && public_show = ?';
  db.query(sql, ["Investor", 1], (err, countResult) => {
    if (err) throw err;
    const totalCount = countResult[0].total;
    const offset = req.query.offset || 0;
    const numRowsPerPage = 10;

    // Calculate the total number of pages
    const numPages = Math.ceil(totalCount / numRowsPerPage);

    // Fetch the actual data for the current page
    sql = 'SELECT * FROM users WHERE role = ? && public_show = ? LIMIT ? OFFSET ?';
    db.query(sql, ["Investor", 1, numRowsPerPage, parseInt(offset)], (err, result) => {
      if (err) throw err;

      const title = "1 Of 1 Researching Ideas & Connecting Investors";
      const description = "Description Goes Here";

      res.render('investors', {
        result,
        title,
        description,
        currentRoute,
        user: req.user,
        totalRows: totalCount,
        numRowsPerPage: numRowsPerPage,
        currentPage: (offset / numRowsPerPage) + 1,
        numPages: numPages // Pass the number of pages to your template
      });
    });
  });
});



router.get('/investor/:userName',  function(req, res){
  const currentRoute = req.url;
  
  let sql = 'SELECT * FROM users WHERE userName = ? ;';
let query = db.query(sql,[req.params.userName], (err, result) => {  
  
    if(err) throw err;  
    //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
    var title = "1 Of 1 Researching Ideas & Connecting Investors" 
    var description = "Description Goes Here"
    
    res.render('investorprofile', {result, title, description, currentRoute,user: req.user});    
    });  
  


});


  module.exports = router;

