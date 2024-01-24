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
		test = "fzlIt7_7RQuAECipNCfp0R:APA91bFqWNqFPPnKLIwPnBEHGIB1Q3y6LT2M9d4RBzK-6WmBA9LvpFttyem0Y51WJQn4ihKewf_uGO3bPdyN2WfE07joq9eYP1iraTmLN3UCUunMvSAsk_ZYd7aNFt1CZXh3B3nnqeLt";
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


app.get('/getNowVersion', function(req, res) {
	pool.getConnection(function(err,connection){
		var pushSql = `select * from tanggodb.app_version_mg`;
		
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

app.get('/getHiddenLocation', async function(req, res) {
	const longitude = 0;
	const latitude = 0;
	const radius = 20000; // 20000 킬로미터
	// "hiddenList" 키에 저장된 모든 지리 공간 데이터 검색
	redisClient.georadius("hiddenList", longitude, latitude, radius, "km", 'WITHCOORD', (err, data) => {
		if (err) throw err;
		console.log(data); // 검색 결과 출력
		res.json(data);
	});
});


app.get('/updateVersion', function(req, res) {
	pool.getConnection(function(err,connection){
		var pushSql = `update tanggodb.app_version_mg set android = '${req.query.android}'`;
		
        var query = connection.query(pushSql, function (err, rows) {
            if(err){
        		console.log(err);
        		connection.release();
                res.send(500, 'error');
                return;
            }

			connection.release();
			res.json("ok");
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
