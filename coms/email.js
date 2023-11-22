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

   static contactMailForm(name, email, comment) {

    var mailOptions = {
     from: 'me@liammccabe.ie', // Your email address here
      replyTo: email,
		  cc: [email],
      to: 'me@liammccabe.ie',
      subject: '1 Of 1 Website Contact',
    
      html: `
      <div style="background-color: #f2f7ff; padding: 20px;">
        <h2 style="color: #3498db;">New Contact Notification</h2>
        <p style="color: #555;"> Sender: ${name}.</p>
        <p style="color: #555;">${comment} is what they said.</p>
        <p style="color: #555;"> Sender Email Address: ${email}.</p>
      </div>
    ` 
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
      subject: 'Reset Password on 1 Of 1',
      
	  html: `<html><head>
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    </head><body class="w3-light-grey">  
    <header class="w3-container w3-center w3-padding-48 w3-white"><h1 class="w3-xxxlarge">
    <b><a href="https://www.1of1.ie" style="text-decoration: none;">1OF1.IE</a></b></h1>
    <h6>Research <span class="w3-tag">Agency</span></h6></header>
    <header class="w3-display-container w3-wide" id="home">
    <img class="w3-image" src="https://www.win.ie/images/fullvictory.jpg" alt="research is everything" width="1600" height="1060"><div class="w3-display-left w3-padding-large">
    <h1 class="w3-text-white">Reset Email Request</h1></div></header> <div class="w3-container w3-white w3-margin w3-padding-large"><div class="w3-justify"> <div class="w3-white w3-margin"> 
    <div class="w3-container w3-padding w3-black"><h4>What Next?</h4></div>
    <div class="w3-container w3-large w3-padding">
    <p>As you have requested a reset password for 1of1.ie we have reset it for you. Your temporary password is ' + newRandomPword + ' We recommend you change this through your profile when you log back in here 
    <a href="https://www.1of1.ie/login" style="text-decoration: none;">1of1.ie</a>.</p><p>If you did not request this email please reply immediately to this email and inform us what happened. Also immediately go to our website and reset your password again, 
    Thank you for using <a href = "https://1of1.ie" style="text-decoration:none;">1of1.ie</a></p></div></div></div></div><footer class="w3-container w3-dark-grey" style="padding:32px"><div class="w3-row "> <div class="w3-center"><p>Thank You, The 1of1.ie Team</p></div></div></footer></body></html>`
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
      html: `
      <div style="background-color: #f2f7ff; padding: 20px;">
        <h2 style="color: #3498db;">Password Reset Confirmation</h2>
        <p style="color: #555;">You have just reset your password on 1of1.ie. If you did not request this change, please contact us immediately.</p>
      </div>
    `
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
    from: 'me@liammccabe.ie',
    replyTo: 'me@liammccabe.ie',
    to: 'me@liammccabe.ie',
    subject: 'Subscription Updated',
    html: `
      <div style="background-color: #f2f7ff; padding: 20px;">
        <h2 style="color: #3498db;">Subscription Updated</h2>
        <p style="color: #555;">You have just successfully updated your subscription on 1OF1.ie. You are fully paid up for another 12 months now. Thank you.</p>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
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


static offerSubmitted(email, name ) {

  var mailOptions = {
   from: 'me@liammccabe.ie', // Your email address here
    replyTo: email,
    cc: [email],
    to: 'me@liammccabe.ie',
    subject: '1 Of 1 Offer Submitted',
  
    html: `
    <div style="background-color: #f2f7ff; padding: 20px;">
      <h2 style="color: #3498db;">New Offer Received</h2>
      
      <p style="color: #555;"> Good news! You have been made an offer on one of your inventions (${name}) in the 1 of 1 Marketplace. </p>
      <p style="color: #555;"> You can review this offer in your profile under the offers tab. You can also message the person who submitted the offer through your profile. </p>
      <p style="color: #555;"> Remember offers like this are most often a starting point for negotiations and for opening dialogue. </p>
      <p style="color: #555;"> Good luck with this process and we wish you all the best in the upcoming discussions. </p>
      </div>
  ` 
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