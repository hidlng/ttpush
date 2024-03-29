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


app.get('/test', async function(req, res) {
	const longitude = 0;
	const latitude = 0;
	const radius = 20000; // 20000 킬로미터
	

	await redisClient.geoadd("hiddenList", 126.9771397, 37.5366059,  7);
	// 예를 들어, 3600초(1시간) 후에 만료되도록 설정
	await redisClient.expire("hiddenList", 300);
	
	// "hiddenList" 키에 저장된 모든 지리 공간 데이터 검색
	redisClient.georadius("hiddenList", longitude, latitude, radius, "km", 'WITHCOORD', (err, data) => {
		if (err) throw err;
		console.log(data); // 검색 결과 출력
		res.json(data);
	});
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


app.get('/getNowTango', function(req, res) {
	redisClient.keys('*user:*', async function (err, keys) {
		if (err) {
			console.log(err);
			return;
		};
		var returnArray = new Array();
		if( keys != undefined && keys.length > 0 ) {
			for( var i = 0; i < keys.length; i++ ) {
				var d = keys[i];
				var userid = d.substring(5);
				var user = await redisClient.v4.get(`user:${userid}`); 
				var userJson = await JSON.parse(user);
				var dis_pid = userJson.pid;
				var dataObj = new Object();
				dataObj.lng  = userJson.lng;
				dataObj.lat  = userJson.lat;
				dataObj.nickname  = userJson.nickname;
				dataObj.myicon = userJson.myicon;
				dataObj.speed = userJson.speed;
				dataObj.pid = userJson.pid;
				dataObj.my_user_id = userJson.user_id;
				returnArray.push(dataObj);
			}
		}
		res.json(returnArray);
	});
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
	await redisClient.georadius("userposition", req.query.lng, req.query.lat, 10000, "m", async function (err, data) {
		if( data != undefined && data.length > 0 ) {
			var isNear = false;
			var fCount = 0;
			for( var i = 0; i < data.length; i++ ) {
				var userid = data[i];
				if( req.query.myid != userid ) {
					var user = await redisClient.v4.get(`user:${userid}`); 
					if( user != null ) {
						var userJson = await JSON.parse(user);
						if( userJson != undefined ) {
							var dis_user_nickname = userJson.nickname;
							if(dis_user_nickname != undefined) {
								isNear = true;
								fCount++;
							}
							console.log(fCount);
						}
					}
				}
			}

			if( fCount > 0 ) {
				fcm_common.sendFcmLong(req.query.pid, "", "8", fCount);
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
			console.log(item.seq);
			console.log(item.nickname);
			console.log(item.car_number);
			console.log("*****************************");
			console.log("*****************************");
			console.log("*****************************");
			console.log("*****************************");
			console.log("*****************************");


			redisClient.keys('*user:*', async function (err, keys) {
				if (err) {
					console.log(err);
					return;
				};

				console.log( "keys length = " + keys.length );
				if( keys != undefined && keys.length > 0 ) {
					for( var i = 0; i < keys.length; i++ ) {
						var d = keys[i];
						var userid = d.substring(5);


						var user = await redisClient.v4.get(`user:${userid}`); 
							var userJson = await JSON.parse(user);
							var dis_pid = userJson.pid;

						console.log( item.seq + ' / ' + userid );

						if( item.seq == userid ) {
							fcm_common.sendFcm(dis_pid, req.query.myName, "3");
						}
					}
				}
			});

			
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