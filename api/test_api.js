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
	var idx = req.query.id;
	var test = "";

	if( idx == 1 ) {
		test = "c5Vs2GTGTfu5om95GLWsFH:APA91bFYWAFEbNcY01oG71I4y2rVBirKLllCGNnyA88CrmuPGvrRUjRZR2Ul46MHIQG1rcSmvje0Aaxl53yUzePPglZcYy4lYXpJavGcJDzwknqRbCAnXZXbK1V6o8dM7DRcn9ow8KNm";
	} else if( idx == 2 ) {
		test = "efyucHM3RSmiYoajPOam6x:APA91bFLd3s1m0BqEN7KMCbWUTCEvEzfh3XvOeaNVGCArFZYsHS-S8n3ovORJYf7zt6MpcqeIPz4FzR4raPtMt3nf4yNXevUgkZC32ArLesy7Gc1L9eIAtzcELZp7fVTnqLwKcWE1WLb";
	}
    fcm_common.sendFcm(test,'Push테스트', "4");
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



app.post('/updateIcon', function(req, res) {
	pool.getConnection(function(err,connection){
		var pushSql = `update userinfo set icon = ${req.body.icon} where seq = ${req.body.u_id}`;
		
        connection.query(pushSql, function (err, rows) {
            if(err){
        		console.log(err);
        		connection.release();
                res.send(500, 'error');
                return;
            }

			connection.release();
			res.json('ok');
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
