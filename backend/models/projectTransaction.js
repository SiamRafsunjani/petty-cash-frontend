var mongoose = require('mongoose');

var transactionSchema = new mongoose.Schema({
	date: {type: Date, default: Date.now},
	projectId: {type: String, required: true},
	paymentTo: {type: String},
	receivedFrom: {type: String},
	paymentTk: {type: Number, default: 0},
	receivedTk: {type: Number, default: 0},
	particular: {type: String},
	active: {type: Number, default: 1},
	company_name: {type: String},
	iou: {type: Number, default: 1},
	project_name: {type: String},
	project_location: {type: String},
	insertedBy: {type: String},
	transaction_history: { type : Array , "default" : [] }
});


mongoose.model('Transaction', transactionSchema);

module.exports = mongoose.model('Transaction');