var express = require('express');
var app = module.exports = express();
var fcm_common = require('../fcm/push');
var pool = require('../db/config');
const RealLog = require('../model/realLog');

app.use(function(req, res, next) {
	res.header("Cache-Control", "no-store");
	res.header("Expires", "-1");
	res.header("Pragma", "no-cache");
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	next(); 
});
/********************************************************************************************************** */

app.get('/test', function(req, res) {
	RealLog
	.find({})
	.then(( user ) => { res.json(user); })
	.catch((err) => { console.error(err)} );
});


app.get('/fcm_test', function(req, res) {
	var content = req.body.content
    fcm_common.sendFcm('cqtEa2cJStmw3pu-HdDWeB:APA91bFKWXzzNo1QizeJuDEyRmEtIvyOtR7emZK2yo6hGR2c9rGJts_VAZhCtNRqwrBN3WcYmhajKWFflVb7dZcBwcAJnZGoLIkG7h7cn8d53vk0W3l75pAeVQXgXcsexJvhnB3SJjKz','Push테스트', "1");
	res.json("ok");
});




app.post('/userlist', function(req, res) {
	pool.getConnection(function(err,connection){
		var pushSql = `select * from tanggodb.user where pid is not null and pid != '' and status = 'Y'`;
		
        var query = connection.query(pushSql, function (err, rows) {
            if(err){
        		console.log(err);
        		connection.release();
                res.send(500, 'error');
                return;
            }

			connection.release();
			res.json(rows);
        });
    });
});


app.post('/initArr', function(req, res) {
	serverPushArray = new Array();
});


app.post('/allfcm', function(req, res) {
	
	var content = req.body.content
	
	pool.getConnection(function(err,connection){
		var pushSql = `select * from tanggodb.user where pid is not null and pid != '' and status = 'Y'`;
		
        var query = connection.query(pushSql, function (err, rows) {
            if(err){
        		console.log(err);
        		connection.release();
                res.send(500, 'error');
                return;
            }

			for( var i = 0; i < rows.length; i++ ) {
				var obj = rows[i];
				console.log(obj.pid);
				fcm_common.sendFcm(obj.pid, content);
			}

			connection.release();
			res.json("ok");
        });
    });
});

app.get('/getArr', function(req, res) {
	res.json(serverPushArray);
});
