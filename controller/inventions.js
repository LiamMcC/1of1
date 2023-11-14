var express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp')
const fs = require('fs');
var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it


router.use(bodyParser.urlencoded({extended:true}));
var flash    = require('connect-flash');

var db = require('../db');
router.use(require('./user'))
// var Email = require("../coms/email.js");
router.use(flash()); // use connect-flash for flash messages stored in session

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
   
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
   
  var upload = multer({ storage: storage })


router.use(flash()); // use connect-flash for flash messages stored in session


function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
    
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}


function checkMembershipStatus(req, res, next) {
  // && new Date() <= req.user.membership_expiry_date
   if (req.user.membership_status === 'Active' ) {
     next(); // User has an active membership.
   } else {
     res.redirect('/1of1info/Membership');
   }
 }


router.get('/marketplace',  function(req, res){
  const currentRoute = req.url; // or any logic to determine the current route
  
  let sql = 'SELECT item_id, title, heading1, valuedAt, investType, image FROM inventItems ORDER By item_id DESC' ;
  let query = db.query(sql,[req.params.id], (err, result) => {  
    
      if(err) throw err;  
      //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors" 
      var description = "The marketplace where your can find an investment or and investor"
      
      res.render('marketplace', {result, title, description, currentRoute,user: req.user});    
      });  
      
 
  });

// function to render the individual invention page
router.get('/marketplace/:name/:id', isLoggedIn, function(req, res){
  const currentRoute = req.url; // or any logic to determine the current route
  
  let sql = 'SELECT * FROM inventItems WHERE item_id = ?' ;
  let query = db.query(sql,[req.params.id], (err, result) => {  
    
      if(err) throw err;  
      //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors" 
      var description = "Happy Kids Pre School is a fully outdoor pre-schooll in Dean Hill Navan co. Meath. We have fully qualified staff and pride ourselves on our facilities"
      
      res.render('invention', {result, title, description, currentRoute,user: req.user});    
      });  
      
 
  });






  router.get('/editinvention/:id', isLoggedIn, function (req, res) {
    const currentRoute = req.url; // or any logic to determine the current route
    let sql = 'SELECT * FROM inventItems WHERE item_id = ? AND createdBy = ?;';
    
    // Check if the item with the given ID exists and was created by the current user
    let query = db.query(sql, [req.params.id, req.user.userName], (err, result) => {
      if (err) throw err;
      
      if (result.length === 0) {
        // If no matching item is found, or it wasn't created by the user, do not render content
        return res.redirect('/deniedpermission');
      }
  
      const successMessage = req.flash('missingBit');
      // var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors";
      var description = "Connecting Inventors with Investors";
  
      res.render('editinvention', {
        result,
        title,
        description,
        currentRoute,
        user: req.user,
        flash: req.flash(),
        message: successMessage
      });
    });
  });
    
    
   
    

  router.post('/editinvention/:id', isLoggedIn, upload.single('image'), async function (req, res, next) {
    let sqlCheckOwnership = 'SELECT createdBy, image FROM inventItems WHERE item_id = ?';
    db.query(sqlCheckOwnership, [req.params.id], (err, result) => {
      if (err) throw err;
  
      if (result.length === 1 && result[0].createdBy === req.user.userName) {
        // Check for blank fields
        if (
          !req.body.title ||
          !req.body.heading1 ||
          !req.body.paragraph1 ||
          !req.body.heading2 ||
          !req.body.paragraph2 ||
          !req.body.mainfeature1 ||
          !req.body.mainfeature2 ||
          !req.body.mainfeature3 ||
          !req.body.mainfeature4 ||
          !req.body.mainfeature5 ||
          !req.body.valuedat
        ) {
          // Flash a message indicating that a field is blank
          req.flash('missingBit', 'All Fields here must be filled in');
          res.redirect(req.originalUrl);
          return; // Stop further execution
        }
  
        // Get the existing image from the database
        let image = result[0].image;
  
        if (req.file) {
          // If a new image is uploaded, process and replace the existing image
          const { filename } = req.file;
  
          // Process and replace the existing image
          sharp(req.file.path)
            .resize(500, 500)
            .jpeg({ quality: 90 })
            .toFile(path.resolve(req.file.destination, 'resized', filename))
            .then(() => {
              fs.unlinkSync(req.file.path);
  
              // Update the image variable to the new filename
              image = filename;
  
              // Continue with the update
              updateInvention(image);
            })
            .catch((err) => {
              console.error(err);
              res.redirect('/error'); // Handle the error as needed
            });
        } else {
          // No new image uploaded; use the existing image filename
          updateInvention(image);
        }
      } else {
        // The logged-in user does not own the invention; deny access
        res.redirect('/deniedpermission');
      }
    });
  
    // Function to update the invention with the provided image
    function updateInvention(image) {
      let sql =
        'update inventItems set title = ?, heading1 = ?, paragraph1 = ?, heading2 = ?, paragraph2 = ?, main_feature1 = ?, main_feature2 = ?, main_feature3 = ?, main_feature4 = ?, main_feature5 = ?, image = ?, valuedAt = ? WHERE item_id = ?';
  
      db.query(
        sql,
        [
          req.body.title,
          req.body.heading1,
          req.body.paragraph1,
          req.body.heading2,
          req.body.paragraph2,
          req.body.mainfeature1,
          req.body.mainfeature2,
          req.body.mainfeature3,
          req.body.mainfeature4,
          req.body.mainfeature5,
          image, // Use the image variable
          req.body.valuedat,
          req.params.id
        ],
        (err, result) => {
          if (err) throw err;
          res.redirect('/profile');
        }
      );
    }
  });
  

    router.get('/createinvention', isLoggedIn, function(req, res){
      const currentRoute = req.url; // or any logic to determine the current route
      const successMessage = req.flash('missingBit');
          var title = "1 Of 1 Researching Ideas & Connecting Investors" 
          var description = "Connecting Inventors with Investors"
          
          res.render('createinvention', {title, description, currentRoute,user: req.user, flash: req.flash(), message: successMessage});    
              
          
          
     
      });



      router.post('/createinvention', isLoggedIn, upload.single('image'), async function(req, res, next) {
        // Check for blank fields
        if (
          !req.body.title ||
          !req.body.heading1 ||
          !req.body.paragraph1 ||
          !req.body.heading2 ||
          !req.body.paragraph2 ||
          !req.body.mainfeature1 ||
          !req.body.mainfeature2 ||
          !req.body.mainfeature3 ||
          !req.body.mainfeature4 ||
          !req.body.mainfeature5 ||
          !req.body.valuedat
        ) {
          // Flash a message indicating that a field is blank
          req.flash('missingBit', 'All Fields here must be filled in');
          res.redirect(req.originalUrl);
          return; // Stop further execution
        }
      
        if (!req.file) {
          // Handle the case where no file was uploaded.
          req.flash('missingBit', 'Please upload an image');
          res.redirect(req.originalUrl);
          return; // Stop further execution
        }
      
        // You can now access the file properties properly
        const { filename: image } = req.file;
      
        // Handle image processing, database insert, and any other logic here
      
        // All fields are filled, proceed with the update
        let sql =
          'INSERT INTO inventItems (title, location, createdBy, creator_id, heading1, paragraph1, heading2, paragraph2, main_feature1, main_feature2, main_feature3, main_feature4, main_feature5, image, valuedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
      
        let query = db.query(
          sql,
          [
            req.body.title,
            "Nowhere",
            req.user.userName,
            req.user.Id,
            req.body.heading1,
            req.body.paragraph1,
            req.body.heading2,
            req.body.paragraph2,
            req.body.mainfeature1,
            req.body.mainfeature2,
            req.body.mainfeature3,
            req.body.mainfeature4,
            req.body.mainfeature5,
            image, // Use the image variable
            req.body.valuedat
          ],
          (err, result) => {
            if (err) throw err;
            res.redirect('/profile');
          }
        );
      });
      
 


  module.exports = router;

