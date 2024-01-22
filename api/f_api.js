var express = require('express');
var app = module.exports = express();
var fcm_common = require('../fcm/push');
var pool = require('../db/config');

var pool2 = require('../db/database');

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
		fcm_common.sendFcm('c0_p1Gn0QE2sB4KvxPV_UH:APA91bEpRVNE5H1lUizRQ7zNgP-rmwSIh7pnWtiJgDNmQxefG4M8yk39RyCn40WUJM24s-RIFhLeMQtr-4vh_aj1HwL_rHuzyqlKCUeI-y31zUA7PBYFn-nGpDADinOsu7R9hp6kK5mc', 'Test', "1");
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


app.post('/friendMsg', async function(req, res) {
	console.log(req.body);
	var content = req.body.content
	var idx = req.body.pid;
	var from = req.body.fromUser;
	var selectIdx = req.body.selectIdx;
	var sendMykey = req.body.sendMykey;
	var fchk = 0;
	console.log(content);
	console.log(idx);
	console.log(from);
	console.log(selectIdx);

	if( content  == "" ) {
		if( selectIdx == "1" ) { content = "방가요";
		} else if( selectIdx == "2" ) { 
			fchk = await requestFriend( req.body.sendMyId, req.body.sendFromId ) ;
		} else if( selectIdx == "3" ) { content = "안운요";
		} else if( selectIdx == "4" ) { content = "함봐요";
		} else if( selectIdx == "5" ) { content = "졸지마요";
		}
	}

	if( selectIdx != "2" ) {
		fcm_common.sendMsgFcm(idx, content, "5", from, sendMykey, '');
	} else {
		if( fchk == 1 ) {
			content = "친구요청";
			fcm_common.sendMsgFcm(idx, content, "5", from, sendMykey, req.body.sendMyId);
		}
	}
    
	res.json("ok");
});


app.post('/friendUpdate', async function(req, res) {
	//내꺼
	var sendMyId = req.body.sendMyId;
	//친구꺼
	var sendFromId = req.body.sendFromId;
	//상태
	var status = req.body.status;

	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log(sendMyId);
	console.log(sendFromId);
	console.log(status);
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');

	if( status == "3" ) {
		var insertSql = `insert into tanggodb.friend ( mid, fid, status, writetime, setting_status ) values ( ${sendMyId}, ${sendFromId}, '3', now(), '1' )`;
		await executeQuery(pool2, insertSql, []);
		var updateSql = `update tanggodb.friend set status = '3' where mid = ${sendFromId} and fid = ${sendMyId}; `;
		await executeQuery(pool2, updateSql, []);
	} else if( status == "4" ) {
		var insertSql = `delete from tanggodb.friend  where mid = ${sendFromId} and fid = ${sendMyId};`;
		await executeQuery(pool2, insertSql, []);
	} 

	res.json("ok");
});



app.post('/updateMyPid', async function(req, res) {
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log(req.body);
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');

	var updateSql = `update tanggodb.userinfo set pid = '${req.body.pid}' where seq = ${req.body.seq}; `;
	await executeQuery(pool2, updateSql, []);
	res.json("ok");
});


app.get('/welcomeMsg', function(req, res) {
	fcm_common.sendFcm(req.query.pid, "다른트럭과 스치면 자동으로 알려주는 트럭놀이터 탱고입니다.", "4");
});


app.get('/nearMyFriend',  async function(req, res) {
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');

	console.log(req.query);
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');
	console.log('**********************');

	await redisClient.georadius("userposition", req.query.lng, req.query.lat, 10000, "m", async function (err, data) {
		console.log( data );
		if( data != undefined && data.length > 0 ) {
			var isNear = false;
			var fCount = 0;
			for( var i = 0; i < data.length; i++ ) {
				var userid = data[i];
				console.log(  req.query.myid + ' / ' + userid );
				if( req.query.myid != userid ) {
					var user = await redisClient.v4.get(`user:${userid}`); 
					var userJson = await JSON.parse(user);
					var dis_user_oid = userJson.user_id;
					var dis_user_nickname = userJson.nickname;
					var dis_pid = userJson.pid;

					console.log(dis_user_nickname);
					if(dis_user_nickname != undefined) {
						isNear = true;
						fCount ++;
					}
				}
			}

			console.log(isNear);
			if( fCount > 0 ) {
				fcm_common.sendFcmLong(req.query.pid, "", "1", fCount);
			}
		}
	});
});




app.get('/getChatlist', function(req, res) {
    redisClient.lrange('chatList', 0, -1, async function (err, reply) {
		if (err) throw err;
		res.json(reply);
	  });
	
});

app.get('/getAccList', function(req, res) {
    redisClient.lrange('accList', 0, -1, async function (err, reply) {
		if (err) throw err;
		res.json(reply);
	  });
	
});


app.get('/enteranceFriend', async function(req, res) {
	var checkSql = ` SELECT a.seq, a.nickname, a.car_number, a.pid, a.ment  FROM tanggodb.userinfo a, tanggodb.friend b where a.seq = b.mid and status = 3 and b.fid = ${req.query.seq} `;
	var chckData = await executeQuery(pool2, checkSql, []);
	if( chckData.length > 0 ) {
		chckData.forEach(function(item) {
			console.log("*****************************");
			console.log("*****************************");
			console.log("*****************************");
			console.log("*****************************");
			console.log("*****************************");
			console.log("*****************************");
			console.log(item);
			console.log("*****************************");
			console.log("*****************************");
			console.log("*****************************");
			console.log("*****************************");
			console.log("*****************************");

			fcm_common.sendFcm(item.pid, req.query.myName, "3");
		});
	}
});



function replaceAll(str, searchStr, replaceStr) {
   return str.split(searchStr).join(replaceStr);
}

async function requestFriend( toUserid, fromUserid ) {
	var checkSql = ` select * from tanggodb.friend where mid = ${toUserid} and fid = ${fromUserid} `;
	var chckData = await executeQuery(pool2, checkSql, []);

	if( chckData.length > 0 ) {
		return 2;
	} else {
		var insertSql = `insert into tanggodb.friend ( mid, fid, status, writetime, setting_status ) values ( ${toUserid}, ${fromUserid}, '1', now(), '1' )`;
		await executeQuery(pool2, insertSql, []);
		return 1;
	}
	
}