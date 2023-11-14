var express = require('express');

var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));
var db = require('../db');
router.use(require('./user'))
// var Email = require("../coms/email.js");




function checkMembershipStatus(req, res, next) {
  // && new Date() <= req.user.membership_expiry_date
   if (req.user.membership_status === 'Active' ) {
     next(); // User has an active membership.
   } else {
     res.redirect('/1of1info/Membership');
   }
 }


router.get('/research',  function(req, res){
  const currentRoute = req.url;
  const researchRoute = req.url;
  
  let sql = 'SELECT * FROM research ORDER BY RAND() LIMIT 8 ; SELECT * FROM category';
let query = db.query(sql, (err, result) => {  
  
    if(err) throw err;  
    //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
    var title = "1 Of 1 Researching Ideas & Connecting Investors" 
    var description = "Description Goes Here"
    
    res.render('research', {result, title, description, currentRoute, researchRoute ,user: req.user});    
    });  
  


});


router.get('/research/:cat',  function(req, res){
    const currentRoute = req.url;
    const researchRoute = req.url;
    
    let sql = 'SELECT * FROM research WHERE category = ? ORDER BY Id DESC; SELECT * FROM category';
  let query = db.query(sql,[req.params.cat], (err, result) => {  
    
      if(err) throw err;  
      //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors" 
      var description = "Description Goes Here"
      
      res.render('research', {result, title, description, currentRoute, researchRoute ,user: req.user});    
      });  
    
  
  
  });




  router.get('/research/:title/:id',  function(req, res){
    const currentRoute = req.url;
    const researchRoute = req.url;
    
    let sql = 'SELECT * FROM research WHERE Id = ? ; SELECT * FROM category';
  let query = db.query(sql,[req.params.id], (err, result) => {  
    console.log(result)
      if(err) throw err;  
      //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors" 
      var description = "Description Goes Here"
      
      res.render('uniqueresearch', {result, title, description, currentRoute, researchRoute ,user: req.user});    
      });  
    
  
  
  });


  module.exports = router;

