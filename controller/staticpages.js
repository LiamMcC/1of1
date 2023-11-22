var express = require('express');

var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));
var db = require('../db');
var Email = require("../coms/email.js");
var flash    = require('connect-flash');
router.use(flash()); // use connect-flash for flash messages stored in session
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

// function to render the home page
router.get('/',  function(req, res){
  const currentRoute = req.url; // or any logic to determine the current route
  let sql = 'SELECT * FROM webContent WHERE home_Show = ? LIMIT 3 ;SELECT * FROM inventItems LIMIT 4;';
  let query = db.query(sql,[1], (err, result) => {  
    
       
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
    
    const totalCount = countResult[0].total;
    const offset = req.query.offset || 0;
    const numRowsPerPage = 10;

    // Calculate the total number of pages
    const numPages = Math.ceil(totalCount / numRowsPerPage);

    // Fetch the actual data for the current page
    sql = 'SELECT * FROM users WHERE role = ? && public_show = ? LIMIT ? OFFSET ?';
    db.query(sql, ["Investor", 1, numRowsPerPage, parseInt(offset)], (err, result) => {
      

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
  
    
    //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
    var title = "1 Of 1 Researching Ideas & Connecting Investors" 
    var description = "Description Goes Here"
    
    res.render('investorprofile', {result, title, description, currentRoute,user: req.user});    
    });  
  


});



// ****** Email Contact handlers
router.get('/contact', function(req, res, err){
  const currentRoute = req.url;
 
  if(err) {
    res.redirect('/error'); // Redirect to error page
  } else { 
    res.render('contactus', {result, user: req.user, currentRoute, message});
  }
  });


  router.post('/contact', function(req, res){
         if (req.body.verifybox == "Madrid" || req.body.verifybox == "madrid" || req.body.verifybox == "MADRID" ) {

          if (!req.body.fullname || !req.body.email || !req.body.comment) {
            res.redirect('/missingdata')
          } else {
            Email.contactMailForm(req.body.fullname, req.body.email, req.body.comment)
            res.redirect('/thankyou')
          }

          } else {

            res.redirect('/wrongcaptcha')
              
          }


     
    });

    router.get('/missingdata', function(req, res){
      const currentRoute = req.url;
      res.render('missingcontact', {user: req.user, currentRoute});
      });

    router.get('/thankyou', function(req, res){
      const currentRoute = req.url;
        res.render('thankyou', {user: req.user, currentRoute});
      });
    


      router.get('/wrongcaptcha', function(req, res){
        const currentRoute = req.url;

            let sql = 'SELECT * FROM webContent WHERE location ="Wrong"';
            let query = db.query(sql, (err,result) => {
              if(err) {
                res.redirect('/error'); // Redirect to error page
              } else { 
                res.render('wrongcaptcha', {currentRoute});
              }
            });
         
        });
  
// ****** End Email Contact Handlers

// ****************** Error Route 

router.get('/servererror', function(req, res){
  //let grandItems = 0
  const currentRoute = req.url;

  let sql = 'SELECT * FROM webContent WHERE location ="Error"';
  let query = db.query(sql, (err,result) => {
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
      res.render('servererror', {result, user: req.user, currentRoute});
    }
  });
});


router.get('/error', function(req, res){
  //let grandItems = 0
  const currentRoute = req.url;

  let sql = 'SELECT * FROM webContent WHERE location ="Error"';
  let query = db.query(sql, (err,result) => {
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
      res.render('error', {result, user: req.user, currentRoute});
    }
  });
});


router.get('/careful', function(req, res){
  //let grandItems = 0
  const currentRoute = req.url;

  let sql = 'SELECT * FROM webContent WHERE location ="Careful"';
  let query = db.query(sql, (err,result) => {
    
      res.render('careful', {result, user: req.user, currentRoute});
    });
});




// ****************** Error Route 



  module.exports = router;

