var express = require('express');
var router = express.Router();
var cors = require('cors');			// cross site req can be made
var bcrypt = require('bcrypt'); 	// used to create encryption
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var app = express();
var config = require('../config');

app.set('secret', config.secret); // secret variable
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

var users = require('../models/users');

const saltRounds = 10;



router.post('/authenticate', function(req,res){
	users.findOne({ name: req.body.name}, function(err,user){
		if (!user) {
			res.send({success: false, message: "User not found"})			
		} else {
			bcrypt.compare(req.body.password, user.password).then(function(result) {			
				if(result){
					var token = jwt.sign(user, app.get('secret'), {
						expiresIn : 60*60*24
					});
					
					res.send ({
						success: true,
						id: user._id,
						name: user.fullName,
						message: "Token sent",
						token: token						
					});				
				} else {
					res.send({ success: false, message: 'Authentication failed. Wrong password.' });
				}
			});
		} 
	});
});




router.post('/', function(req, res) {
	bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
		users.create({
			name: req.body.name,
			fullName: req.body.fullName,
			password: hash
		}, 
		function (err, user) {
			if (err) return res.status(500).send("There was a problem adding the information to the database.");
			res.status(200).send(user);
		});
	});
});





router.use(function(req, res, next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if(token){
		jwt.verify(token, app.get('secret'), function(err, decoded){
			if(err){
				return res.send({sucess: false, message: "Failed to authenticate!"});
			} else {
				req.decoded = decoded;
				next();				
			} 
		});
	} else {
		return res.send({sucess: false, message: "Failed to authenticate!"});
	}	
});




router.get('/', function(req, res, next) {
	users.find({}, function(err, user){
		if (err) return res.status(500).send("There was a problem adding the information to the database.");
		res.status(200).send(user);
	}).where('active').equals(1);
});



router.put('/update/:id', function(req, res){
	var data = {};

	data.name = req.body.name;
	data.fullName = req.body.fullName;
	bcrypt.hash(req.body.password, saltRounds).then(function(hash){
		data.password = hash;
	});	

	users.findByIdAndUpdate(req.params.id, data, function(err, user){
		if (err) return res.status(500).send("There was a problem adding the information to the database.");
		res.status(200).send(user);
	});
});


router.put('/delete/:id', function(req, res){
	users.findByIdAndUpdate(req.params.id, {'active': 0}, function(err, user){
		if (err) return res.status(500).send("There was a problem adding the information to the database.");
		res.status(200).send(true);
	});
});



module.exports = router;

