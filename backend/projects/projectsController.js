var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var request = require('request');
router.use(bodyParser.urlencoded({ extended: true }));

var Projects = require('./projects');
var transaction = require('../models/projectTransaction');

var app = express();
var config = require('../config');
app.set('secret', config.secret); 
var jwt = require('jsonwebtoken')


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
});*/


router.post('/', function (req, res) {
	Projects.create({
		particular : req.body.particular,
		tallyBalance : req.body.tallyBalance,
		iou : req.body.iou
	}, 
	function (err, Projects) {
		if (err) return res.status(500).send("There was a problem adding the information to the database.");
		res.status(200).send(Projects);
	});
});




router.get('/', function(req, res, next) {
	var options = {
		url:'http://bank.maxrailwaytrack.com/projects/get_all_projects_list_dt',
		form: {
			global_search:'',
			orderby:'id_companies',
			ordertype:'asc',
			offset:0,
			limit:500
		},
		headers: {
			'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb25zdW1lcktleSI6IjEyNGFzNXFXNDU3OGZkc2ZEQVNEMlNEV0ZBd3E4NTIiLCJ1c2VySWQiOiI0MyIsInVzZXJfcGFzc3dvcmQiOiIxMDAldXJhZGh1cmFQYXNzIiwiaXNzdWVkQXQiOiIyMDE3LTAzLTE2VDA1OjI3OjI4KzAwMDAiLCJ0dGwiOjMxNTM5OTk5OTk5fQ.VGd7O9IIrIDpxgpGVXUp5r42KixjPJ9458m0WPmz08w'
		},
	}
	
	var callback = function(err,httpResponse,body){
		if(err) res.send(err);
		res.send(body);
	}
	request.post(options,callback);
});




router.get('/get_projects', function(req, res){
	console.log("projectId found");
	console.log(req.params.projectId);
	// transaction.aggregate([
	// { 
	// 	"$match": { "active": 1 , "iou": 1} 
	// },
	// {
	// 	"$group": {
	// 		"_id": "$projectId",
	// 		"project_name": {"$first": "$project_name"},
	// 		"paymentTk": {"$sum": "$paymentTk"},
	// 		"receivedTk": {"$sum": "$receivedTk"},
	// 	}},
	// 	{ "$project": {
	// 		"project_name": "$project_name",
	// 		"count": {"$subtract": ["$receivedTk", "$paymentTk"]},
	// 	}}
	// 	], function(err, transaction){
	// 		if(err){
	// 			return res.status(500).send("There was a problem adding the information to the database.");
	// 		} else {
	// 			console.log(transaction);
	// 			res.status(200).send(transaction);
	// 		}
	// 	});
	transaction.aggregate([
		{"$match" : {"active":1}},
		{"$group" : {
			"_id" : {"projectId" : "$projectId", "iouId" : "$iou"},
			"project_name": {"$first": "$project_name"},
			"iouCount" : {"$sum":1},
			"paymentTk": {"$sum": "$paymentTk"},
			"receivedTk": {"$sum": "$receivedTk"}
		}},
		{ "$project": {
			"_id" : 1,
			"iouCount" : 1,
			"project_name": 1,
			"count": {"$subtract": ["$receivedTk", "$paymentTk"]},
		}},{
			"$group":{
				"_id" :"$_id.projectId",
				"results" : {"$push" :  {"count":"$count", "iou" : "$_id.iouId", "project_name" : "$project_name"} }
			}
		}

	]).exec(function(error,doc){
		res.json(doc);
	});

});




router.get('/get_projects_io', function(req, res){
	console.log("projectId found");
	//console.log(req.params.projectId);
	transaction.aggregate([
	{ 
		"$match": { "active": 1, "iou": 0 } 
	},
	{
		"$group": {
			"_id": "$projectId",
			"project_name": {"$first": "$project_name"},
			"paymentTk": {"$sum": "$paymentTk"},
			"receivedTk": {"$sum": "$receivedTk"},
		}},
		{ "$project": {
			"project_name": "$project_name",
			"count": {"$subtract": ["$receivedTk", "$paymentTk"]}
		}}
		], function(err, transaction){
			if(err){
				return res.status(500).send("There was a problem adding the information to the database.");
			} else {
				console.log(transaction);
				res.status(200).send(transaction);
			}
		});

});





router.get('/get_balance/:id', function(req, res){
	transaction.aggregate([
	{	
		"$match": { "projectId": req.params.id }
	},
	{
		"$group": {
			"_id": "$projectId",
			"project_name": {"$first": "$project_name"},
			"paymentTk": {"$sum": "$paymentTk"},
			"receivedTk": {"$sum": "$receivedTk"},
		}},
		{ "$project": {
			"count": {"$subtract": ["$receivedTk", "$paymentTk"]}
		}}
		], function(err, transaction){
			if(err){
				return res.status(500).send("There was a problem adding the information to the database.");
			} else {
				console.log(transaction);
				res.status(200).send(transaction);
			}
		});

});



module.exports = router;


