var express = require('express');

var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));
var db = require('../db');
router.use(require('./user'))
// var Email = require("../coms/email.js");
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp')

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, './uploads/');
  },
 
  filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
 
var upload = multer({ storage: storage })


function checkMembershipStatus(req, res, next) {
  // && new Date() <= req.user.membership_expiry_date
   if (req.user.membership_status === 'Active' ) {
     next(); // User has an active membership.
   } else {
     res.redirect('/1of1info/Membership');
   }
 }


 function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
    
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}

 function isAdmin(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.user.adminRights)
		return next();
	// if they aren't redirect them to the home page
	res.redirect('/login');
}


router.get('/research',  function(req, res){
  const currentRoute = req.url;
  const researchRoute = req.url;
  
  let sql = 'SELECT * FROM research ORDER BY RAND() LIMIT 8 ; SELECT * FROM category';
let query = db.query(sql, (err, result) => {  
  
    
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
    
      
      //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors" 
      var description = "Description Goes Here"
      
      res.render('research', {result, title, description, currentRoute, researchRoute ,user: req.user});    
      });  
    
  
  
  });



  router.get('/research/:title/:id', isLoggedIn, checkMembershipStatus,  function(req, res){
    const currentRoute = req.url;
    const researchRoute = req.url;
    
    let sql = 'SELECT * FROM research WHERE Id = ? ; SELECT * FROM category';
  let query = db.query(sql,[req.params.id], (err, result) => {  
    
       
      //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors" 
      var description = "Description Goes Here"
      
      res.render('uniqueresearch', {result, title, description, currentRoute, researchRoute ,user: req.user});    
      });  
    
  
  
  });



  // *** Research admin links 

  router.get('/adminresearch', isLoggedIn, isAdmin, function(req, res){   
    
    const currentRoute = req.url;
    
  
    let sql = 'select * from research';
    let query = db.query(sql, (err,result) => { 
        
       
        res.render('adminresearch', {result, user: req.user, currentRoute});
        });
    });



  
  router.get('/adminaddresearch', isLoggedIn, isAdmin, function(req, res){  
    const successMessage = req.flash('missingBit');
    const currentRoute = req.url;
    let sql = 'SELECT * FROM category';
    let query = db.query(sql, (err,result) => { 
      
     
      res.render('adminaddresearch', {result, user: req.user, currentRoute, message: successMessage});
      });

      
    });
  
  
  router.post('/adminaddresearch', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    if (req.file)  { 
      const { filename: image } = req.file;      
      await sharp(req.file.path)
          .resize(500, 500)
          .jpeg({ quality: 90 })
          .toFile(
              path.resolve(req.file.destination,'resized',image)
          )
          fs.unlinkSync(req.file.path)
          req.flash('missingBit', 'Please upload an image');
      var peewee = req.body.description
      var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')
      const today = new Date().toISOString().slice(0, 10).replace('T', ' ');
      let sql = 'INSERT INTO research (Title, Icon, Description, Image, ImageTitle, SmallBit, author, dateWritten) VALUES (?,?,?,?,?,?,?, ?)';
      let query = db.query(sql, [req.body.title, req.body.icon, newpeewe, req.file.filename, req.body.imagetitle, req.body.smallbit, req.body.author, today],(err,res) => {
          
         
   
      });
      
      res.redirect('/adminresearch');

    } else {
     
      var peewee = req.body.description
      var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')
      const today = new Date().toISOString().slice(0, 10).replace('T', ' ');
      let sql = 'INSERT INTO research (Title, Icon, Description, ImageTitle, SmallBit, author, dateWritten) VALUES (?,?,?,?,?,?, ?)';
      let query = db.query(sql, [req.body.title, req.body.icon, newpeewe, req.body.imagetitle, req.body.smallbit, req.body.author, today],(err,res) => {
          
         
   
      });
      
      res.redirect('/adminresearch');


    }
    

    });
  
  
  router.get('/admineditresearch/:id', isLoggedIn, isAdmin, function(req, res){ 
    
    const successMessage = req.flash('missingBit');
    const currentRoute = req.url;
  
      let sql = 'select * from research where Id = ?; select * from category;';
      let query = db.query(sql,[req.params.id], (err,result) => {       
              
          res.render('admineditresearch', {result, user: req.user, currentRoute, message: successMessage});        
      });
    });
  
  
    router.post('/admineditthisresearch/:id', isLoggedIn, isAdmin, upload.single('image'), async function (req, res) {
      const { title, icon, description, image, imagetitle, smallbit, category } = req.body;
      const newDescription = description.replace(/(?:\r\n|\r|\n)/g, '<br>');
      let newImage = null; // Initialize the new image variable
    
      if (!title || !icon || !description || !imagetitle || !smallbit) {
        // Check if any required elements are missing
        req.flash('missingBit', 'All required fields must be filled in');
        return res.redirect(req.originalUrl);
      }
    
      if (req.file) {
        // If a new image is uploaded, use it
        newImage = req.file.filename;
      }
    
      // Construct the SQL query with conditional image update
      const sql = 'UPDATE research SET title = ?, category = ?, Icon = ?, Description = ?, Image = ?, ImageTitle = ?, SmallBit = ?, author = ? WHERE Id = ?';
      const queryParams = [title, category, icon, newDescription, newImage || image, imagetitle, smallbit, req.body.author, req.params.id];
    
      db.query(sql, queryParams, (err, result) => {
      
        res.redirect('/adminresearch');
      });
    });
    
    
  
  router.get('/admindeletthisresearch/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
      let sql = 'DELETE FROM research WHERE Id = ?';
      let query = db.query(sql, [req.params.id],(err,res) => {
          
        
        
      });
      
      res.redirect('/adminresearch');
    });
    


    /// ********************** Research Categories
  
    router.get('/admincategories', isLoggedIn, isAdmin, function(req, res){  
      const successMessage = req.flash('missingBit');
      const currentRoute = req.url;
      let sql = 'SELECT * FROM category';
      let query = db.query(sql, (err,result) => { 
        
       
        res.render('admincategories', {result, user: req.user, currentRoute, message: successMessage});
        });
  
        
      });


      router.post('/adminaddcategories', isLoggedIn, isAdmin, function(req, res){  
        const successMessage = req.flash('missingBit');
        const currentRoute = req.url;
        let sql = 'INSERT INTO category (cat_blurb, title) VALUES (?,?)';
        let query = db.query(sql, [req.body.catblurb, req.body.title], (err,result) => { 
          
         
          res.redirect('/admincategories');
          });
    
          
        });



        router.get('/admineditcategory/:id', isLoggedIn, isAdmin, function(req, res){  
          const successMessage = req.flash('missingBit');
          const currentRoute = req.url;
          let sql = 'SELECT * FROM category WHERE cat_id = ?';
          let query = db.query(sql, [req.params.id], (err,result) => { 
          
           
            res.render('admineditcategory', {result, user: req.user, currentRoute, message: successMessage});
            });
      
            
          });



          router.post('/admineditcategories/:id', isLoggedIn, isAdmin, function(req, res){  
            const successMessage = req.flash('missingBit');
            const currentRoute = req.url;
            
            let sql = 'UPDATE category SET cat_blurb = ?,  title = ? where cat_id = ?';
            let query = db.query(sql, [req.body.catblurb, req.body.title, req.params.id], (err,result) => { 
           
             
              res.redirect('/admincategories');
              });
        
              
            });



            router.get('/admindeletthiscategory/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
              let sql = 'DELETE FROM category WHERE cat_id = ?';
              let query = db.query(sql, [req.params.id],(err,res) => {
                  
                 
                
              });
              
              res.redirect('/admincategories');
            });

  module.exports = router;

