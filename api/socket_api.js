var wsModule = require("ws");
var mongoose = require('mongoose');

var fcm_common = require('../fcm/push');
var pool = require('../db/config');
const RealLog = require('../model/realLog');

const geo = require('georedis').initialize(redisClient);


module.exports = function( _server ) {
	var wss = new wsModule.Server({server:_server});
	
	wss.on('connection', async function( ws, req ) {
		console.log('test');
		ws.on('message', function(message){
			var result = JSON.parse(message.toString("utf8"));
			
			console.log(result.carnumber + ' / ' +	result.lng + ' / ' + result.lat + ' / ' + result.nickname + ' / ' + result.user_id + ' / ' + result.pid );
			
			var lng = "";
			var lat  = "";
			var nickname = "";
			var user_id =  "";
			var carnumber  = "";
			var pid = "";
			
			if( result.lng != undefined ) { lng =  result.lng }
			if( result.lat != undefined ) { lat =  result.lat }
			if( result.nickname != undefined ) { nickname =  result.nickname }
			if( result.user_id != undefined ) { user_id =  result.user_id }
			if( result.carnumber != undefined ) { carnumber =  result.carnumber }
			if( result.pid != undefined ) { pid =  result.pid }
			
			var comDate = new Date()
			comDate.setHours(comDate.getHours() + 9);
			
			var nowDate = new Date(comDate);
			var intNowDate = parseInt(nowDate.YYYYMMDDHHMMSS());
			var prefive = nowDate.setMinutes(nowDate.getMinutes() - 5);
			var preDate = new Date(prefive);
			var intPreDate = parseInt(preDate.YYYYMMDDHHMMSS());
			
			var newUserObj = redisClient.v4.get(`user:${result.user_id}`); 
			console.log(newUserObj);
			
			redisClient.v4.set(`user:${result.user_id}`, JSON.stringify(result)); 
			redisClient.v4.expire(`user:${result.user_id}`, 5*60 );

			redisClient.geoadd("userposition", result.lng, result.lat, result.user_id);
			// geo.addLocation(
			// 	result.user_id, {latitude:  result.lat, longitude: result.lng},
			// 	(error, reply) => {
			// 		if (error) console.error(error);
			// 		else console.log('added location: ', reply);
			// 	});

			redisClient.keys('*user:*', function (err, keys) {
				if (err) {
					console.log(err);
					return;
				};

				var returnArray = [];;
				if( keys != undefined && keys.length > 0 ) {
					for( var i = 0; i < keys.length; i++ ) {
						var d = keys[i];
						console.log(d);
						//fcm_common.sendFcm(d.pid,'test');
						// if( getDistanceFromLatLonInKm( lat, lng, d.lat, d.lng ) <= 150 ) {
						// 	//500m
						// 	if( getDistanceFromLatLonInKm( lat, lng, d.lat, d.lng ) <= 0.5 ) {
						// 		var sql = `
						// 			SELECT * FROM tanggodb.meetinfo WHERE toid = ${d.user_id} AND fromid = ${user_id} AND  cast( meettime as unsigned ) > cast( ${intPreDate} as unsigned ) order by meettime desc Limit 1;
						// 		`
						// 		var result = await executeQuery(pool, sql, []);
						// 		if( result.length == 0 ) {
						// 			var insertsql = `
						// 				insert into tanggodb.meetinfo (  toid, toname, fromid, fromname, lat, lng , meettime ) values ( ${d.user_id} , '${d.nickname}', ${user_id} , '${nickname}' ,'${lat}' ,'${lng}' , '${intNowDate}' )
						// 			`
						// 			await executeQuery(pool, insertsql, []);
						// 			//send push
						// 			fcm_common.sendFcm(d.pid, nickname, "1");
						// 		}
						// 	}
							
						// 	var dataObj = new Object();
						// 	dataObj.lng  = d.lng;
						// 	dataObj.lat  = d.lat;
						// 	dataObj.nickname  = d.nickname;
						// 	returnArray.push(dataObj);
						// }
					}
					
					// ws.send(JSON.stringify(returnArray));
				}
				//console.log(keys);
				
			});

			//console.log( intNowDate + ' / '+ intPreDate );

			
			// const query = { user_id: user_id };
			// const update = { $set: {
			// 		lng : lng,
			// 		lat : lat,
			// 		nickname : nickname,
			// 		user_id : user_id,
			// 		carnumber : carnumber,
			// 		pid : pid,
			// 		writetime : intNowDate
			// }};
			// const options = { upsert: true, new: true };

			//data insert
			// var returnInt = RealLog.findOneAndUpdate(query, update, {upsert: true}, function(err, doc) {
			// 	if (err) return -1;
			// 	return 1;
			// });
			
			//collection drop 
			//mongoose.connection.collection('real_log').drop()

			// RealLog
			// .find({ "user_id": { $ne: user_id }, "writetime" : {$gt : intPreDate}},{_id:0,lng:1,lat:1,nickname:1,user_id:1, writetime:1, pid : 1})
			// .then( async ( user ) => { 
			// 		var returnArray = [];;
			// 		if( user != undefined && user.length > 0 ) {
			// 			for( var i = 0; i < user.length; i++ ) {
			// 				var d = user[i];
			// 				//fcm_common.sendFcm(d.pid,'test');
			// 				if( getDistanceFromLatLonInKm( lat, lng, d.lat, d.lng ) <= 150 ) {

			// 					//500m
			// 					if( getDistanceFromLatLonInKm( lat, lng, d.lat, d.lng ) <= 0.5 ) {
			// 						var sql = `
			// 							SELECT * FROM tanggodb.meetinfo WHERE toid = ${d.user_id} AND fromid = ${user_id} AND  cast( meettime as unsigned ) > cast( ${intPreDate} as unsigned ) order by meettime desc Limit 1;
			// 						`
			// 						var result = await executeQuery(pool, sql, []);
			// 						if( result.length == 0 ) {
			// 							var insertsql = `
			// 								insert into tanggodb.meetinfo (  toid, toname, fromid, fromname, lat, lng , meettime ) values ( ${d.user_id} , '${d.nickname}', ${user_id} , '${nickname}' ,'${lat}' ,'${lng}' , '${intNowDate}' )
			// 							`
			// 							await executeQuery(pool, insertsql, []);
			// 							//send push
			// 							fcm_common.sendFcm(d.pid, nickname, "1");
			// 						}
			// 					}
								
			// 					var dataObj = new Object();
			// 					dataObj.lng  = d.lng;
			// 					dataObj.lat  = d.lat;
			// 					dataObj.nickname  = d.nickname;
			// 					returnArray.push(dataObj);
			// 				}
			// 			}
			// 		}
					
			// 		ws.send(JSON.stringify(returnArray));
			// })
			// .catch((err) => { ws.send(JSON.stringify([])) } );
		});
		
		ws.on('error', function(error){
			console.log(error);
		});
		
		ws.on('close', function(){
			console.log('close');
		});
		
	});
}

Date.prototype.YYYYMMDDHHMMSS = function () {
  var yyyy = this.getFullYear().toString();
  var MM = pad(this.getMonth() + 1,2);
  var dd = pad(this.getDate(), 2);
  var hh = pad(this.getHours(), 2);
  var mm = pad(this.getMinutes(), 2)

  return yyyy +  MM + dd+  hh + mm ;
};

function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
	str = '0' + str;
  }
  return str;
}

function getDistanceFromLatLonInKm(lat1,lng1,lat2,lng2) {
    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lng2-lng1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d.toFixed(1);
}