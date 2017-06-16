var express = require('express');
var router = express.Router();
var cors = require('cors');

var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

var transaction = require('../models/projectTransaction');

var app = express();
var config = require('../config');
app.set('secret', config.secret); 


var app = express();
var config = require('../config');
app.set('secret', config.secret); 
var jwt = require('jsonwebtoken')




router.get('/', function(req, res){
	console.log("");
	transaction.find({}, function(err, transaction){
		if(err){
			return res.status(500).send("There was a problem adding the information to the database.");
		} else {
			res.status(200).send(transaction);
		}
	}).where('active').equals(1);
});



router.use(function(req, res, next){
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




router.post('/', function (req, res) {
	console.log(req.body)

	transaction.create({
		date: req.body.date,
		projectId: req.body.projectId,
		paymentTo: req.body.paymentTo,
		receivedFrom: req.body.receivedFrom,
		paymentTk: req.body.paymentTk,
		receivedTk: req.body.receivedTk,
		particular: req.body.particular,
		iou: req.body.iou,
		company_name: req.body.company_name,
		project_name: req.body.project_name,
		project_location: req.body.project_location,
		insertedBy : req.body.insertedBy
	}, 

	function (err, transaction) {
		if (err) return res.status(500).send("There was a problem adding the information to the database.");
		res.status(200).send(transaction);
	});
});




router.get('/projectId/:projectId', function(req, res){
	console.log("projectId found");
	var x = parseInt(req.params.skip);

	transaction.find({"projectId": req.params.projectId, "active": 1, "iou": 1}, 
	null
	,{
		sort:
		{
		    date: 1 //Sort by Date Added DESC
		}
	},  
	function(err, transaction){
		if(err){
			return res.status(500).send("There was a problem adding the information to the database.");
		} else {
			res.status(200).send(transaction);
		}
	});
});




router.get('/projectIou/:projectId', function(req, res){
	console.log("projectId found");
	transaction.find({"projectId": req.params.projectId, "active": 1, "iou": 0}, 
	null
	,{
		sort:
		{
		    date: 1 //Sort by Date Added DESC
		}
	}, 
	function(err, transaction){
		if(err){
			return res.status(500).send("There was a problem adding the information to the database.");
		} else {
			res.status(200).send(transaction);
		}
	});
});



router.get('/getTransactionById/:id', function(req, res){
	transaction.find({"_id": req.params.id}, function(err, transaction){
		if(err){
			return res.status(500).send("There was a problem adding the information to the database.");
		} else {
			res.status(200).send(transaction);
		}
	}).where('active').equals(1);
});




router.put('/update/:id' , function(req, res){
	var data = {};
	/*if (req.body.paymentTo) {
		data.paymentTo = req.body.paymentTo;
		console.log(data);
	}*/
	//console.log(req.body);
	data.date = req.body.date;
	data.particular = req.body.particular;
	data.paymentTo = req.body.paymentTo;
	data.paymentTk = req.body.paymentTk;

	data.projectId = req.body.projectId;

	data.project_name = req.body.project_name;
	data.receivedTk = req.body.receivedTk;
	data.receivedFrom = req.body.receivedFrom;
	
	
	transaction.findByIdAndUpdate(req.params.id, data, {upsert: true}, function (err, transaction) {
		//if (err) return res.status(500).send("There was a problem updating the user.");
		//res.status(200).send(transaction);
	}); 
	

	var update = {};
	update.command = {};
	update.command.date = req.body.oldDate;
	update.command.paymentTk = req.body.oldPaymentTk;
	update.command.particular = req.body.oldParticular;
	update.command.paymentTo = req.body.oldPaymentTo;
	update.command.paymentTk = req.body.oldPaymentTk;
	update.command.projectId = req.body.oldProjectId;
	update.command.project_name = req.body.oldProject_name;
	update.command.receivedFrom = req.body.oldReceivedFrom;
	update.command.receivedTk = req.body.oldReceivedTk;
	update.updatedBy = req.body.updatedBy;
	update.date = new Date();



	transaction.findByIdAndUpdate(req.params.id, 
	{
		$push: {
			transaction_history: update
		}
	},
	{upsert: true}, function (err, transaction) {		
		if (err) return res.status(500).send("There was a problem updating the user.");
		res.status(200).send(transaction);
	}); 	

});


/*
MyModel.findOneAndUpdate(query, req.newData, {upsert:true}, function(err, doc){
	if (err) return res.send(500, { error: err });
	return res.send("succesfully saved");
});*/




router.put('/delete/:id', function (req, res) {
	console.log(req.params.id);
	transaction.findByIdAndUpdate(req.params.id, { 'active': 0 }, {upsert: true}, function (err, transaction) {
		if (err) return res.status(500).send("There was a problem updating the user.");
		res.status(200).send(transaction);
	});
});


/*
/// update
router.put('/:id', function (req, res) {
	transaction.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, transaction) {
		if (err) return res.status(500).send("There was a problem updating the user.");
		res.status(200).send(transaction);
	});
});

*/






module.exports = router;