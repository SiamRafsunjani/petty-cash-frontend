var mongoose = require('mongoose');

var notesSchema = new mongoose.Schema({
	notetype: {type: Number, required: true },
	amount: {type: Number, required: true }, 
	history: { type : Array , "default" : [] }
});


mongoose.model('Notes', notesSchema);



module.exports = mongoose.model('Notes');


