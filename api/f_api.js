var express = require('express');
var app = module.exports = express();
var fcm_common = require('../fcm/push');
var pool = require('../db/config');

app.use(function(req, res, next) {
	
	res.header("Cache-Control", "no-store");
	res.header("Expires", "-1");
	res.header("Pragma", "no-cache");
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	next(); 
});
/********************************************************************************************************** */
app.post('/fcm', function(req, res) {
	var originUlist = req.body.ulist;
	var name = req.body.name
	
	var ulist = replaceAll( originUlist, "|", "," );
	console.log(ulist);
	//fcm_common.sendFcm(req.body.dkey);

	pool.getConnection(function(err,connection){
		var pushSql = `select name, pid from user where id in (${ulist})`;
		
        var query = connection.query(pushSql, function (err, rows) {
            if(err){
        		console.log(err);
        		connection.release();
                res.send(500, 'error');
                return;
            }
            //console.log(rows);
			//console.log(rows.length);
			
			for( var i = 0; i < rows.length; i++ ) {
				var obj = rows[i];
				fcm_common.sendFcm(obj.pid, name);
			}

			connection.release();
			res.json("ok");
        });
    });



});


app.get('/test', function(req, res) {
		fcm_common.sendFcm('fUrbtLvHRDaSxl0fUTWuOX:APA91bFt90sUkR88T58PZ6SGhTo8J6AILJu7zyxpKdcxKKVwjqg9yNl9jnWBCJfXm2ObZUtTkWArRpVxFqSJlPNPvNtfcyj-5I2-D-M3nkgffZnAUY9yr7fi5FFPGSh5vCnHLxE75spB', '');
		res.json("ok");
});

function replaceAll(str, searchStr, replaceStr) {
   return str.split(searchStr).join(replaceStr);
}