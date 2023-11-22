var express = require('express');

var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));
var db = require('../db');
router.use(require('./user'))
var flash    = require('connect-flash');
// function to render the home page

var bcrypt = require('bcrypt-nodejs');
const saltRounds = 10;

const multer = require('multer');
const path = require('path');
const sharp = require('sharp')
const fs = require('fs');


router.use((req, res, next) => {
  res.locals.cookies = req.cookies;
  next();
});


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, './uploads/');
  },
 
  filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


 
var upload = multer({ storage: storage })



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


// ************** Get Admin Page

router.get('/administration', isLoggedIn, isAdmin, function(req, res){
  const currentRoute = req.url;
    res.render('adminpage', {user: req.user, currentRoute});

  });


// ************** Get Admin Site Content Page 
  router.get('/adminsitecontent', isLoggedIn, isAdmin, function(req, res){
    const currentRoute = req.url;
    let sql = 'select * from webContent ORDER BY location ASC';
  let query = db.query(sql,[req.params.id], (err,result) => {       
        
      const errorMessage = req.flash('error');
      res.render('adminsitecontent', {result, user: req.user, currentRoute, errorMessage});        
  });
    });


    // ************** Get Admin Add Site Content Page 
    router.get('/admineditcontent/:id', isLoggedIn, isAdmin, function(req, res){
      const currentRoute = req.url;
      let sql = 'select * from webContent where webContent_id = ?';
    let query = db.query(sql,[req.params.id], (err,result) => {       
        
        const errorMessage = req.flash('missingBit');
        res.render('admineditcontent', {result, user: req.user, currentRoute, message: errorMessage});        
    });
      });

      // ************** Admin Update Site Content Post Request
  
      router.post('/admineditcontent/:id', isLoggedIn, isAdmin, function(req, res, next) {
        // Check for blank fields
        if (
          !req.body.title ||
          !req.body.location ||
          !req.body.heading1 ||
          !req.body.paragraph1 ||
          !req.body.heading2 ||
          !req.body.paragraph2 ||
          !req.body.main_feature1 ||
          !req.body.home_show ||
          !req.body.icon 
        ) {
          // Flash a message indicating that a field is blank
          req.flash('missingBit', 'All Fields here must be filled in');
          res.redirect(req.originalUrl );
          return; // Stop further execution
        }
      
        // All fields are filled, proceed with the update
        let sql =
        'UPDATE webContent SET title = ?, location = ?, heading1 = ?, paragraph1 = ?, heading2 = ?, paragraph2 = ?, main_feature1 = ?, home_show = ?, icon = ? WHERE webContent_id = ?';
       //   'INSERT INTO webContent (title, location, heading1, paragraph1, heading2, paragraph2, main_feature1, home_show, icon) VALUES (?,?,?,?,?,?,?,?,?)';
      
        let query = db.query(
          sql,
          [
            req.body.title,
            req.body.location,
            req.body.heading1,
            req.body.paragraph1,
            req.body.heading2,
            req.body.paragraph2,
            req.body.main_feature1,
            req.body.home_show,
            req.body.icon,
            req.params.id
          ],
          (err, result) => {
            
            res.redirect('/administration');
          }
        );
      });




// ****************** Admin Inventions



router.get('/admineditinvention/:id', isLoggedIn, isAdmin, function (req, res) {
  const currentRoute = req.url; // or any logic to determine the current route
  let sql = 'SELECT * FROM inventItems WHERE item_id = ?;';
    
  
  let query = db.query(sql, [req.params.id, req.user.userName], (err, result) => {
    const successMessage = req.flash('missingBit');
    // var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
    var title = "1 Of 1 Researching Ideas & Connecting Investors";
    var description = "Connecting Inventors with Investors";

    res.render('admineditinvention', {
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
  
  
 
  

router.post('/admineditinvention/:id', isLoggedIn, isAdmin, upload.single('image'), async function (req, res, next) {
  let sqlCheckOwnership = 'SELECT adminRights FROM users WHERE Id = ?';
  db.query(sqlCheckOwnership, [req.user.Id], (err, result) => {
    

    if (result[0].adminRights === 1) {
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
        
        res.redirect('/admininventions');
      }
    );
  }
});







router.get('/admininventions',  function(req, res){
  const currentRoute = req.url; // or any logic to determine the current route
  
  let sql = 'SELECT item_id, title, heading1, valuedAt, investType, image FROM inventItems ORDER By item_id DESC' ;
  let query = db.query(sql,[req.params.id], (err, result) => {  
    
      
      //var cookiePolicyAccept = req.cookies.acceptCookieBrowsing
      var title = "1 Of 1 Researching Ideas & Connecting Investors" 
      var description = "The marketplace where your can find an investment or and investor"
      
      res.render('admininventions', {result, title, description, currentRoute,user: req.user});    
      });  
      
 
  });

  // ************ End Admin Inventions


// Users Start **********************************************************


router.get('/adminusers', isLoggedIn, isAdmin, function(req, res){  
  const currentRoute = req.url; 
  let sql = 'select * from users';
  let query = db.query(sql, (err,result) => { 
     
      res.render('adminusers', {result, user: req.user, currentRoute});
      });
  });



router.get('/adminadduser', isLoggedIn, isAdmin, function(req, res){  
  const currentRoute = req.url; 
  const successMessage = req.flash('wrongcombo');
  const errorMessage = req.flash('error');
  const adminMessageRegister = req.flash('signupMessage');
    res.render('adminadduser', {user: req.user, currentRoute , message: successMessage, errorMessage});
  });


  router.post('/adminadduser', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){

    
    //req.flash('signupMessage', 'That username is already taken.')

    if (!req.body.username || !req.body.password || !req.body.email) {
      // Set a flash message
      req.flash('error', 'Please fill in all required fields');
      return res.redirect('/adminadduser');
    }


    let checksql = 'SELECT * FROM users WHERE userName = ?';
    let checkquery = db.query(checksql, [req.body.username],(err,result) => {
        
          
              if (result.length) {
                  
                  req.flash('wrongcombo', 'That Username Has Been Taken By Someone Else!')
                  res.redirect('/adminadduser')
          } else {
    
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(req.body.password, salt);

    var newUserMysql = {
      username: req.body.username,
      email: req.body.email,
      password: hash  // use the generateHash function in our user model
    };

    let sql = 'INSERT INTO users ( userName, uemail, password ) values (?,?,?)';
    let query = db.query(sql, [newUserMysql.username, newUserMysql.email, newUserMysql.password],(err,result) => {
      
      res.redirect('/adminusers')
    });
  }
});


    
 
  });



  router.get('/adminedituser/:id', isLoggedIn,isAdmin, function(req, res, next) {
    const successMessage = req.flash('wrongcombo');
    const currentRoute = req.url;
    let sql = 'select * from users WHERE Id = ?';
    let query = db.query(sql,[req.params.id], (err,result) => {     
             
            res.render('admineditprofile', {result, user: req.user, currentRoute, message: successMessage });    
            });  
});


router.post('/admineditprofile/:id', isLoggedIn, isAdmin, function(req, res, next) {
    const somethingMissing = req.flash('This Field Can Not Be Blank');
    
    let sql = 'update users set uemail = ?, summary = ?, allAbout = ?, role = ?, adminRights = ? where Id = ?;update profileData set interests = ?, aboutMe = ?, expecting = ? where user_id = ?;'  
    let query = db.query(sql, [req.body.newemail, req.body.summary, req.body.allAbout, req.body.role, req.body.adminbit, req.params.id, req.body.interests, req.body.aboutme, req.body.expecting, req.params.id],(err,result) => {
       
        res.redirect('/adminusers')
        
    });
});




  router.get('/admindeleteuser/:id', isLoggedIn, isAdmin, function(req, res){
    var deletedP = process.env.DELETE_PASSWORD
    const hash = bcrypt.hashSync(deletedP);
      let sql = 'Update users set role = ?, membership_status = ? , password = ?   WHERE Id = ?';
      let query = db.query(sql, ["Deleted", "Deleted", hash, req.params.id],(err,res) => {
          
         
        
      });
      
      res.redirect('/adminusers');
    });
    


// Users End **********************************************************





// About Start **********************************************************


router.get('/adminabout', isLoggedIn, isAdmin, function(req, res){   
    

  let sql = 'select * from packageAbout';
  let query = db.query(sql, (err,result) => { 
      
     
      res.render('adminabout', {result, user: req.user, menubits: req.menubits});
      });
  });



  router.get('/admineditabout/:id', function(req, res){ 

 
      let sql = 'select * from packageAbout where Id = ?';
      let query = db.query(sql,[req.params.id], (err,result) => {       
            
          res.render('admineditabout', {result, user: req.user, menubits: req.menubits});        
      });
    });

    router.post('/admineditthisabout/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
      var peewee = req.body.description
      var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')
  
      let sql = 'UPDATE packageAbout SET Title = ? , Description = ?, Image = ? WHERE Id = ?';
      let query = db.query(sql, [req.body.title, newpeewe, req.body.image, req.params.id],(err,res) => {
          
          
        
      });
      
      res.redirect('/adminabout');
    });


  


  // About End **********************************************************

// Images Start **********************************************************

router.get('/allimages',  isLoggedIn, isAdmin, function(req, res){ 

 

    const testFolder = './uploads/resized/';
      fs.readdir(testFolder, (err, files) => {
      files.forEach(file => {
       
      });
      res.render('adminallimages', {user: req.user, files, menubits: req.menubits})
    });
});
  

router.get('/deleteimage/:id', isLoggedIn, isAdmin, function(req, res){ 
const path = './uploads/resized/'
fs.unlink(path + req.params.id, (err) => {
    if (err) {
    console.error(err)
    return
    }
    res.redirect('/allimages')
    //file removed
    })
});



router.get('/newimageupload',  isLoggedIn, isAdmin, function(req, res){ 

  res.render('newimage', {user: req.user, menubits: req.menubits})
});


router.post('/newimage', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
  const { filename: image } = req.file;      
  await sharp(req.file.path)
      .resize(500, 500)
      .jpeg({ quality: 90 })
      .toFile(
          path.resolve(req.file.destination,'resized',image)
      )
      // comment this out if you want to keep the image in the folder
      fs.unlinkSync(req.file.path)


  
  res.redirect('/allimages');
});

// Images End **********************************************************





// ************************ Admin Subscriptions


router.get('/adminsubscriptions', isLoggedIn, isAdmin, function(req, res) {
  let sql = 'SELECT COUNT(*) as total FROM subscriptions ';
  db.query(sql,(err, countResult) => {
    
    const totalCount = countResult[0].total;
    const offset = req.query.offset || 0;
    const numRowsPerPage = 2;

    // Calculate the total number of pages
    const numPages = Math.ceil(totalCount / numRowsPerPage);



    const currentRoute = req.url;
    let sql = 'SELECT * FROM subscriptions LIMIT ? OFFSET ? ; ';
    let query = db.query(sql, [numRowsPerPage, parseInt(offset)], (err, result) => {
      if (err) {
        // Handle errors
        console.log(err)
        //res.redirect("/error");
      } else {
        // Send the messages data as JSON
        res.render("adminsubscriptions", {result, user: req.user, currentRoute, 
          totalRows: totalCount,
          numRowsPerPage: numRowsPerPage,
          currentPage: (offset / numRowsPerPage) + 1,
          numPages: numPages // Pass the number of pages to your template
        
        });
        
      }
    });


  });


});

  module.exports = router;





