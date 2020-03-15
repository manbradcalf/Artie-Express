let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('contact', {
        firstName: "Ben",
        lastName: "Medcalf",
        occupation: "Software Engineer",
        location: "Richmond, VA",
        imgSrc: "http://benmedcalf.com/images/prof_pic.png"
    });
});

module.exports = router;
