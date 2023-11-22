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

function isAdmin(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.user.adminRights)
		return next();
	// if they aren't redirect them to the home page
	res.redirect('/login');
}

router.get('/blog',  function(req, res){
  const currentRoute = req.url; // or any logic to determine the current route
  
  let sql = 'SELECT * FROM 1of1blog ORDER By Id DESC' ;
  let query = db.query(sql,[req.params.id], (err, result) => {  
    
    
      //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors" 
      var description = "The marketplace where your can find an investment or and investor"
      
      res.render('bloghome', {result, title, description, currentRoute,user: req.user});    
      });  
      
 
  });


  router.get('/blogarticle/:title/:id',  function(req, res){
    const currentRoute = req.url; // or any logic to determine the current route
    
    let sql = 'SELECT * FROM 1of1blog WHERE Id = ?' ;
    let query = db.query(sql,[req.params.id], (err, result) => {  
      
          
        //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
        var title = "1 Of 1 Researching Ideas & Connecting Investors" 
        var description = "The marketplace where your can find an investment or and investor"
        
        res.render('blogarticle', {result, title, description, currentRoute,user: req.user});    
        });  
        
   
    });


    router.get('/adminblog', isLoggedIn, isAdmin, function(req, res){   
    
        const currentRoute = req.url;
        
      
        let sql = 'select * from 1of1blog';
        let query = db.query(sql, (err,result) => { 
            
           
            res.render('adminblog', {result, user: req.user, currentRoute});
            });
        });



      
      router.get('/adminaddblog', isLoggedIn, isAdmin, function(req, res){  
        const successMessage = req.flash('missingBit');
        const currentRoute = req.url;
          res.render('adminaddblog', {user: req.user, currentRoute, message: successMessage});
        });
      
      
      router.post('/adminaddblog', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
        const { title, description, imagetitle, smallbit } = req.body;
        const fieldsToCheck = [description, smallbit, title, imagetitle];
        
        if (fieldsToCheck.some(field => field.includes('<'))) {
          res.redirect('/careful');
        } else {



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
          let sql = 'INSERT INTO 1of1blog (Title, Icon, Description, Image, ImageTitle, SmallBit, author, dateWritten) VALUES (?,?,?,?,?,?,?, ?)';
          let query = db.query(sql, [req.body.title, req.body.icon, newpeewe, req.file.filename, req.body.imagetitle, req.body.smallbit, req.body.author, today],(err,res) => {
              
            
       
          });
          
          res.redirect('/adminblog');
        }
        });
      
      
      router.get('/admineditblog/:id', isLoggedIn, isAdmin, function(req, res){ 
        
        const successMessage = req.flash('missingBit');
        const currentRoute = req.url;
      
          let sql = 'select * from 1of1blog where Id = ?';
          let query = db.query(sql,[req.params.id], (err,result) => {       
                
              res.render('admineditblog', {result, user: req.user, currentRoute, message: successMessage});        
          });
        });
      
      
        router.post('/admineditthisblog/:id', isLoggedIn, isAdmin, upload.single('image'), async function (req, res) {
          const { title, icon, description, hiddenImage, imagetitle, smallbit } = req.body;

           
        const fieldsToCheck = [description, smallbit, title, imagetitle];
        
        if (fieldsToCheck.some(field => field.includes('<'))) {
            res.redirect('/careful');
          } else {

            const newDescription = description.replace(/(?:\r\n|\r|\n)/g, '<br>');
            let newImage = hiddenImage; // Initialize the new image variable
          
            
  
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
            const sql = 'UPDATE 1of1blog SET Title = ?, Icon = ?, Description = ?, Image = ?, ImageTitle = ?, SmallBit = ?, author = ? WHERE Id = ?';
            const queryParams = [title, icon, newDescription, newImage , imagetitle, smallbit, req.body.author, req.params.id];
         
            db.query(sql, queryParams, (err, result) => {
             
              res.redirect('/adminblog');
            });

          }
          
          
          
        
        });
        
        
      
      router.get('/admindeletthisblog/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
          let sql = 'DELETE FROM 1of1blog WHERE Id = ?';
          let query = db.query(sql, [req.params.id],(err,res) => {
              
            
            
          });
          
          res.redirect('/adminblog');
        });
        
      
      
      
        
      // Blog End **********************************************************


  module.exports = router;

