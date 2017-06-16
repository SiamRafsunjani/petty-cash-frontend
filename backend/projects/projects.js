var mongoose = require('mongoose');
var ProjectSchema = new mongoose.Schema({
	particular: String,
	iou: Number,
	tallyBalance: Number
});

mongoose.model('Projects', ProjectSchema);

module.exports = mongoose.model('Projects');