var express = require('express');

var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));
var db = require('../db');
router.use(require('./user'))
var flash    = require('connect-flash');
var Email = require("../coms/email.js");
const stripe = require('stripe')(process.env.STRIPE_KEY);

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
    
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}




// **************** Stripe Routes

router.post('/paynow/:id', async (req, res) => {
   
    let grandtotal = 99
      
    const session = await stripe.checkout.sessions.create({
  
        line_items: [
            {
                price_data: {
                    currency: "eur",
                    tax_behavior: "inclusive",
                    product_data: {
                        name: "1 Of 1 Membership (1 Year)" 
                    },
                    unit_amount: grandtotal * 100,
                },
                quantity: 1,
            },
        ],
      mode: 'payment',
      success_url: 'https://1of1.ie/',
      cancel_url: 'https://1of1.ie/category/Shoes/1',
      automatic_tax: {enabled: true},
    });
  
    res.redirect(303, session.url);
  });
  
  router.get('/kjsdkafkahfkhkrhjhskhdhshdkshdsasuccesskdksgdkgsdkgdkdkskasdggsadkgd/:id', isLoggedIn,  function(req, res, next){  // I have this restricted for admin just for proof of concept
      //let sql = 'select * FROM clue where status = "active"; ' 
      const currentTimestamp = new Date();
        let sql = 'update users SET membership_status = ?,  date_paid = ? Where Id = ? ; INSERT INTO subscriptions (userName, userId, amt) VALUES (?,?,?)';
        let query = db.query(sql, ["Active",  currentTimestamp, req.params.id, req.user.userName, req.user.Id, 99], (err,result) => {
          if(err) {
            console.log(err); // Redirect to error page
          }   
    
       
          
        
            Email.orderConfirmed(req.user.userName, req.user.uemail)
            res.redirect("/profile")
        });
     
  
   });
  
   router.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
    const payload = request.body;
  
   
  
    response.status(200);
  });
  
  
  
  
  // **************** Stripe Routes End


module.exports = router;










// sample 

// router.get('/profile', isLoggedIn, function(req, res) {
//     const successMessage = req.flash('wrongcombo');
//     const currentRoute = req.url;
  
//     // SELECT * FROM Messages WHERE (receiver_id = ?) OR (sender_id = ? AND replied_to = ?)
//     let sql =
//       'SELECT * FROM users WHERE userName = ?; ' +
//       'SELECT * FROM profileData WHERE user_id = ?; ' +
//       'SELECT userName, summary FROM users ORDER BY Id DESC LIMIT 1; ' +
//       'SELECT title, item_id FROM inventItems WHERE createdBy = ?; ' +
//       'SELECT * FROM Messages WHERE (receiver_id = ? AND erad_Status = 0) OR (sender_id = ? AND previously_opened = ? ) OR (receiver_id = ? AND previously_opened = ? ); ' +
//       'UPDATE users SET subscription_status = CASE ' +
//       '  WHEN (SELECT MAX(date_paid) FROM subscriptions WHERE user_id = ?) < DATE_SUB(NOW(), INTERVAL 2 MINUTE) ' +
//       '  THEN "Expired" ELSE subscription_status END;';
  
//     let query = db.query(sql, [req.user.username, req.user.Id, req.user.userName, req.user.Id, req.user.Id, req.user.Id, req.user.Id, req.user.Id, req.user.Id], (err, results) => {
//       if (err) {
//         // Handle the error appropriately
//       }
  
//       const [userResults, profileResults, latestUserResult, inventItemsResults, messagesResults] = results;
  
//       // Continue with rendering the profile page using the obtained results
//       res.render('profile', {
//         user: req.user,
//         currentRoute,
//         message: successMessage,
//         userResults,
//         profileResults,
//         latestUserResult,
//         inventItemsResults,
//         messagesResults
//       });
//     });
//   });
  