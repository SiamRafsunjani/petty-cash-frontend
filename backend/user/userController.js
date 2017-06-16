var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

var User = require('./user');

router.post('/', function (req, res) {
	User.create({
		name : req.body.name,
		email : req.body.email,
		password : req.body.password
	}, 
	function (err, user) {
		if (err) return res.status(500).send("There was a problem adding the information to the database.");
		res.status(200).send(user);
	});
});

router.get('/', function(req, res){
	User.find({}, function(err, user){
		if(err){
			return res.status(500).send("There was a problem adding the information to the database.");
		} else {
			res.status(200).send(user);
		}
	});
});


module.exports = router;


