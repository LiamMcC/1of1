'use strict';
require('dotenv').config();

const res = require('express/lib/response');
var db = require('../db');
var nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({

    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // your domain email user set this in .env file
      pass: process.env.EMAIL_PASS // your password for your email server outbox this in .env file
    },
    tls:{
      rejectUnauthorized: false
    }
  });


module.exports = class Email {
    // An email to all users
    // you can change the message here 
    // call this message in any route by calling the method in the route

    static liamo() {

    let sql = 'select email from users' 
    let query = db.query(sql, (err,result) => {
       if(err) throw err;
       
       result.forEach(function(row) {
           

        var mailOptions = {
            from: 'me@liammccabe.ie',
            to: row.uemail,
            subject: "Test MAil", // Chnage the subject as needed
            text: 'Can I just check that the email was sent! ' + row.email ,
            html: "<div style='width:100%;background:#a7c7d1'>Welcome to Win.ie.....</div>"
          };
          
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              
            }
          });

          

       })
       
        
    });

   }    
	
	// ***** End Email To All Users
	
	
	
	
	
	

   // ********** Contact Form Email

   static contactMailForm(name, email, comment, verifyBox) {

    var mailOptions = {
     from: 'me@liammccabe.ie', // Your email address here
      replyTo: email,
		cc: email,
      to: 'me@liammccabe.ie',
      subject: 'Website Contact',
      text: comment + " is what they said This is an email from " + name +" the verify answer was " + verifyBox + "the email is " + email
		//html: '<html><head><link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"></head><body class="w3-light-grey">  <header class="w3-container w3-center w3-padding-48 w3-white"><h1 class="w3-xxxlarge"><b><a href="https://www.win.ie" style="text-decoration: none;">WIN.IE</a></b></h1><h6>Competitions <span class="w3-tag">Club</span></h6></header> <div class="w3-container w3-white w3-margin w3-padding-large"><div class="w3-justify"> <div class="w3-white w3-margin"> <div class="w3-container w3-padding w3-black"><h4>Website Contact</h4></div><div class="w3-container w3-large w3-padding"><p>' + comment + '</p><p>Verified by ' + verifyBox + '</p></div></div></div></div><footer class="w3-container w3-dark-grey" style="padding:32px"><div class="w3-row "> <div class="w3-center"><p>Thank You, The Win.ie Team</p></div></div></footer></body></html>'
    };
    
    // Remove these console logs before production
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(" A Wee Problem " + error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    
 
   }  




   static rmaiReset(xxemail, newRandomPword) {

    var mailOptions = {
      from: 'me@liammccabe.ie', // this is your websites email address
      replyTo: 'me@liammccabe.ie', // set this to an email you will see if the user needs to reply to a reset password email
      to: xxemail,
      subject: 'Reset AAAGGGH.COM Password from winners',
      
	  html: '<html><head><link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"></head><body class="w3-light-grey">  <header class="w3-container w3-center w3-padding-48 w3-white"><h1 class="w3-xxxlarge"><b><a href="https://www.win.ie" style="text-decoration: none;">WIN.IE</a></b></h1><h6>Competitions <span class="w3-tag">Club</span></h6></header><header class="w3-display-container w3-wide" id="home"><img class="w3-image" src="https://www.win.ie/images/fullvictory.jpg" alt="winning is everything" width="1600" height="1060"><div class="w3-display-left w3-padding-large"><h1 class="w3-text-white">Reset Email Request</h1></div></header> <div class="w3-container w3-white w3-margin w3-padding-large"><div class="w3-justify"> <div class="w3-white w3-margin"> <div class="w3-container w3-padding w3-black"><h4>What Next?</h4></div><div class="w3-container w3-large w3-padding"><p>As you have requested a reset password for Win.ie we have reset it for you. Your temporary password is ' + newRandomPword + ' We recommend you change this through your profile when you log back in here <a href="https://www.aaagggh.com/login" style="text-decoration: none;">AAAGGGH.COM</a>.</p><p>If you did not request this email please reply immediately to this email and inform us what happened. Also immediately go to our website and reset your password again, Thank you for using <a href = "https://aaagggh.com" style="text-decoration:none;">Win.ie</a></p></div></div></div></div><footer class="w3-container w3-dark-grey" style="padding:32px"><div class="w3-row "> <div class="w3-center"><p>Thank You, The Win.ie Team</p></div></div></footer></body></html>'
    };
    
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

   }  


   static passwordResetNotice(xxemail) {
    var mailOptions = {
      from: 'me@liammccabe.ie', // this is your websites email address
      replyTo: 'me@liammccabe.ie', // set this to an email you will see if the user needs to reply to a reset password email
      to: xxemail,
      subject: '1 Of 1 Password Has Been Reset Through Your Profile',
      text: "You have just reset your password on 1of1.ie"
	  };
    
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

   }  


// *************************** Order Confirmed Mail To Be Configured

   static orderConfirmed(xxemail) {
    var mailOptions = {
      from: 'me@liammccabe.ie', // this is your websites email address
      replyTo: 'me@liammccabe.ie', // set this to an email you will see if the user needs to reply to a reset password email
      to: xxemail,
      subject: 'An order has been placed',
      text: "An order has been placed and this email needs to be customised to send to the customer"
	  };
    
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

   }  
 



   static adminOrderNotice(xxemail) {
    var mailOptions = {
      from: 'me@liammccabe.ie', // this is your websites email address
      replyTo: 'me@liammccabe.ie', // set this to an email you will see if the user needs to reply to a reset password email
      to: xxemail,
      subject: 'Ab order has been placed',
      text: "An order has been placed and this email needs to be customised to send to the business"
	  };
    
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

   }  
// *************************** Order Confirmed Mail To Be Configured

 
}




 







// Gmail

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//   host: 'smtp.gmail.com',
//   auth: {

   
//     user: "PUT YOUR USER HERE", 
//     pass: "PUT YOUR PASSWORD HERE",
//   }
// });