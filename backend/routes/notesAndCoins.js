var express = require("express");
var router = express.Router();

var cors = require('cors');

var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

var notes = require('../models/notes');

var app = express();
var config = require('../config');
app.set('secret', config.secret); 


var app = express();
var config = require('../config');
app.set('secret', config.secret); 
var jwt = require('jsonwebtoken');




// middleware
/*router.use(function(req, res, next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	if(token) {
		console.log(token);		
		jwt.verify(token, app.get('secret'), function(err,decoded){
			if(err){
				res.send({sucess: false, message: "auth failed"})				
			} else {
				res.decoded = decoded;
				next();
			}
		});
	} else {
		res.send({sucess: false, message: "failed"})
	}
});

*/
router.get('/' ,function(req, res, next){
	notes.find({}, '_id amount notetype', function(err, notes){
		res.send(notes);
	}).sort({notetype: -1});
});


/// user cannot post... notes will be created prior with this method 


router.post('/create', function(req, res, next){
	notes.create({
		notetype: req.body.notetype,
		amount: req.body.amount
	}, function(err, notes){
		res.send(notes);
	});
});


router.put('/update/:id', function(req, res, next){
	var data = {};
	data.amount = req.body.amount;

	var update = {};
	update.command = {};
	update.command.date = new Date();
	update.command.updatedBy = req.body.UpdatedBy;	
	
	notes.find({_id: req.params.id}, function(err, note){
		update.command.amount = note[0].amount;	
		
		notes.findByIdAndUpdate(req.params.id, 
		{
			$push: {
				history: update
			}
		}, {upsert : true}, function(err, notes){
			if (err) return res.status(500).send("There was a problem updating the user.");
			res.status(200).send(notes);
		});
		
		notes.findByIdAndUpdate(req.params.id, data, function(err, notes){	});
	});
});





module.exports = router;
