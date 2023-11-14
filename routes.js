var express = require('express');

var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));

router.use(require('./controller/inventions'))
router.use(require('./controller/staticpages'))
router.use(require('./controller/user'))
router.use(require('./controller/admincontroller'))
router.use(require('./controller/researchcontroller'))
router.use(require('./controller/blogcontroller'))
router.use(require('./controller/cartcontroller'))
// router.use(require('./controller/subscribers'))
// router.use(require('./controller/cookie'))
// router.use(require('./controller/cart'))




module.exports = router;