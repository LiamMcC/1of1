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
const Email = require('../coms/email');
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

router.use((req, res, next) => {
  res.locals.cookies = req.cookies;
  next();
});

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
    
      
      //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors" 
      var description = "The marketplace where your can find an investment or and investor"
      
      res.render('marketplace', {result, title, description, currentRoute,user: req.user});    
      });  
      
 
  });

// function to render the individual invention page
router.get('/marketplace/:name/:id', isLoggedIn, checkMembershipStatus, function(req, res){
  const currentRoute = req.url; // or any logic to determine the current route
  
  let sql = 'SELECT * FROM inventItems WHERE item_id = ?' ;
  let query = db.query(sql,[req.params.id], (err, result) => {  
    
      
      //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors" 
      var description = "Research Is Key Visit 1 of 1"
      
      res.render('invention', {result, title, description, currentRoute,user: req.user});    
      });  
      
 
  });






  router.get('/editinvention/:id', isLoggedIn, function (req, res) {
    const currentRoute = req.url; // or any logic to determine the current route
    let sql = 'SELECT * FROM inventItems WHERE item_id = ? AND createdBy = ?;';
    
    // Check if the item with the given ID exists and was created by the current user
    let query = db.query(sql, [req.params.id, req.user.userName], (err, result) => {
      
      
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
    const {title, heading1, paragraph1, heading2, paragraph2, mainfeature1, mainfeature2, mainfeature3, mainfeature4, mainfeature5 } = req.body;
    const fieldsToCheck = [title, heading1, paragraph1, heading2, paragraph2, mainfeature1, mainfeature2, mainfeature3, mainfeature4, mainfeature5 ];
    
    if (fieldsToCheck.some(field => field.includes('<'))) {
      res.redirect('/careful');
    } else {
    
      var peewee = req.body.paragraph1
      var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')
      var peeweeb = req.body.paragraph2
      var newpeeweb = peeweeb.replace(/(?:\r\n|\r|\n)/g, '<br>')
    
    
    let sqlCheckOwnership = 'SELECT createdBy, image FROM inventItems WHERE item_id = ?';
    db.query(sqlCheckOwnership, [req.params.id], (err, result) => {
      
  
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
          newpeewe,
          req.body.heading2,
          newpeeweb,
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
        
          res.redirect('/profile');
        }
      );
    }

    }
  });
  

    router.get('/createinvention', isLoggedIn, checkMembershipStatus, function(req, res){


      
      const currentRoute = req.url; // or any logic to determine the current route
      const successMessage = req.flash('missingBit');
          var title = "1 Of 1 Researching Ideas & Connecting Investors" 
          var description = "Connecting Inventors with Investors"
          
          res.render('createinvention', {title, description, currentRoute,user: req.user, flash: req.flash(), message: successMessage});    
              
          
          
     
      });



      router.post('/createinvention', isLoggedIn, checkMembershipStatus, upload.single('image'), async function(req, res, next) {
        const {title, heading1, paragraph1, heading2, paragraph2, mainfeature1, mainfeature2, mainfeature3, mainfeature4, mainfeature5,
          image } = req.body;
        const fieldsToCheck = [title, heading1, paragraph1, heading2, paragraph2, mainfeature1, mainfeature2, mainfeature3, mainfeature4, mainfeature5,
          image];
        
        if (fieldsToCheck.some(field => field.includes('<'))) {
          res.redirect('/careful');
        } else {
        
          var peewee = req.body.paragraph1
          var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')
          var peeweeb = req.body.paragraph2
          var newpeeweb = peeweeb.replace(/(?:\r\n|\r|\n)/g, '<br>')




        
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
            newpeewe,
            req.body.heading2,
            newpeewe2,
            req.body.mainfeature1,
            req.body.mainfeature2,
            req.body.mainfeature3,
            req.body.mainfeature4,
            req.body.mainfeature5,
            image, // Use the image variable
            req.body.valuedat
          ],
          (err, result) => {
            
            res.redirect('/profile');
          }
        );
        }
      });
      
 


      router.post('/submitoffer/:id/:whatid/:whatName', isLoggedIn, checkMembershipStatus, function(req, res) {

        const { offer } = req.body;
        const fieldsToCheck = [offer];
        
        if (fieldsToCheck.some(field => field.includes('<'))) {
          res.redirect('/careful');
        } else {
            const successMessage = req.flash('messagesent', "Thank you for sending the message");
            const currentRoute = req.url;
            const currentTimestamp = new Date();
            let sql = 'INSERT INTO Messages (message_subject, sender_id, receiver_id, timestamp) VALUES (?,?,?,?);';
            sql += 'INSERT INTO MessageThreads (message_id, sender_id, receiver_id, message_text, timestamp, sender_name) VALUES (LAST_INSERT_ID(),?,?,?,?,?);';
            sql += 'INSERT INTO offers (offerfrom, offerTo, offerValue, inventId, inventTitle) VALUES (?, ?, ?, ?, ?)'
            let query = db.query(sql, ["Offer On Invention" , req.user.Id, req.params.id, currentTimestamp, req.user.Id, req.params.id, "I am interested in your invention " + req.params.whatName + " and would like to submit a provisional offer of " + req.body.offer, currentTimestamp, req.user.userName,  req.user.userName, req.params.id, req.body.offer, req.params.whatid, req.body.aboutinvention ], (err, result) => {    
         
                    Email.offerSubmitted(req.user.uemail, req.body.aboutinvention)

                    res.redirect('/profile');    
                    });  
    
                  }
        });


  module.exports = router;

