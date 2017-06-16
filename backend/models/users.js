var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	name: {type: String, required: true, unique: true },
	fullName: {type: String, required: true },
	password: {type: String, required: true},
	active: {type: Number, default: 1}
});


mongoose.model('Users', userSchema);



module.exports = mongoose.model('Users');


