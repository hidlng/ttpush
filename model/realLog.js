const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema(
{
	lng : { type : String, default : false },
	lat : { type : String, default : false },
	nickname : { type : String, default : false },
	user_id : { type : String, default : false },
	carnumber : { type : String, default : false },
	pid : { type : String, default : false },
	writetime : { type : Number, default : false }
}
,{collection : 'real_log'}
);


module.exports = mongoose.model('real_log', dataSchema);