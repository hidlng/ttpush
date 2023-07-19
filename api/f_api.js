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
		fcm_common.sendFcm('fpp-oGSmSMidexrXUixdzH:APA91bHAbeBdQeec8e2jG-L4muShlR0M0DDHqc5OZCQZLgNbb9_HNYZDH4ntW7P0HQ8xsI6VsoleTKT6B4YslOHRmRIAtgPDxV7sR3lWFsfdzd_ktudvVb52AVhukkGOZtRVoDWxAK5o', 'Test', "1");
		res.json("ok");
});

app.get('/del', function(req, res) {
	redisClient.keys('*user:*', async function (err, keys) {
		if (err) {
			console.log(err);
			return;
		};

		if( keys != undefined && keys.length > 0 ) {

			for( var i = 0; i < keys.length; i++ ) {
				var d = keys[i];
				redisClient.del(d);
			}
		}
	});
	res.json("ok");
});


app.get('/welcomeMsg', function(req, res) {
	fcm_common.sendFcm(req.pid, nickname, "4");
});


app.get('/getChatlist', function(req, res) {
    redisClient.lrange('chatList', 0, -1, async function (err, reply) {
		if (err) throw err;
		res.json(reply);
	  });
	
});

function replaceAll(str, searchStr, replaceStr) {
   return str.split(searchStr).join(replaceStr);
}