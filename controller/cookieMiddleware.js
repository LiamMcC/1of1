function checkCookieAcceptance(req, res, next) {
    // Check if the user has accepted the cookie policy
    // You might want to adjust this logic based on how you store cookie acceptance information
    const cookieStatus = req.cookies.cookie_status;
  
    if (!cookieStatus || cookieStatus !== 'Accepted') {
      // If the cookie doesn't exist or the status is not 'Accepted', set the cookie
      res.cookie('cookie_status', 'Accepted', { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true });
    }
  
    res.locals.cookieAccepted = true; // Set the flag to true
    next();
  }
  
  module.exports = checkCookieAcceptance;