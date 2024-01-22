var wsModule = require("ws");
var mongoose = require('mongoose');

var fcm_common = require('../fcm/push');
var pool = require('../db/config');
const RealLog = require('../model/realLog');

const geo = require('georedis').initialize(redisClient);


module.exports = function( _server ) {
	var wss = new wsModule.Server({server:_server});
	
	wss.on('connection', async function( ws, req ) {
		ws.on('message', async function(message){
			var result = JSON.parse(message.toString("utf8"));
			
			console.log(  result.actName + ' / '+ result.carnumber + ' / ' +	result.lng + ' / ' + result.lat + ' / ' + result.nickname + ' / ' + result.user_id + ' / ' + result.myicon + ' / '+ result.pid + ' / '+ result.speed );
			
			var lng = "";
			var lat  = "";
			var nickname = "";
			var my_user_id =  "";
			var carnumber  = "";
			var pid = "";
			var myicon = "";
			var speed = "";
			
			if( result.lng != undefined ) { lng =  result.lng }
			if( result.lat != undefined ) { lat =  result.lat }
			if( result.nickname != undefined ) { nickname =  result.nickname }
			if( result.user_id != undefined ) { my_user_id =  result.user_id }
			if( result.carnumber != undefined ) { carnumber =  result.carnumber }
			if( result.pid != undefined ) { pid =  result.pid }
			if( result.myicon != undefined ) { myicon =  result.myicon }
			if( result.speed != undefined ) { speed =  result.speed }
			
			var comDate = new Date()
			comDate.setHours(comDate.getHours() + 9);
			
			var nowDate = new Date(comDate);
			var intNowDate = parseInt(nowDate.YYYYMMDDHHMMSS());
			var prefive = nowDate.setMinutes(nowDate.getMinutes() - 15);
			var preDate = new Date(prefive);
			var intPreDate = parseInt(preDate.YYYYMMDDHHMMSS());
			
			var newUserObj = await redisClient.v4.get(`user:${my_user_id}`); 
			console.log(newUserObj);
			
			redisClient.v4.set(`user:${my_user_id}`, JSON.stringify(result)); 
			redisClient.v4.expire(`user:${my_user_id}`, 5*60 );

			await redisClient.geoadd("userposition", lng, lat, my_user_id);


			
			var returnArray = [];
			await redisClient.georadius("userposition", lng, lat, 150, "m", async function (err, data) {
				console.log( data );
				if( data != undefined && data.length > 0 ) {
					for( var i = 0; i < data.length; i++ ) {
						var userid = data[i];
						console.log( my_user_id + ' / ' + userid );
						if( my_user_id != userid ) {
							var user = await redisClient.v4.get(`user:${userid}`); 
							var userJson = await JSON.parse(user);
							var dis_user_oid = userJson.user_id;
							var dis_user_nickname = userJson.nickname;
							var dis_pid = userJson.pid;

							var sql = `
								SELECT * FROM tanggodb.meetinfo WHERE toid = ${dis_user_oid} AND fromid = ${my_user_id} AND  cast( meettime as unsigned ) > cast( ${intPreDate} as unsigned ) order by meettime desc Limit 1;
							`
							var result = await executeQuery(pool, sql, []);
							if( result.length == 0 ) {
								var insertsql = `
									insert into tanggodb.meetinfo (  toid, toname, fromid, fromname, lat, lng , meettime ) values ( ${dis_user_oid} , '${dis_user_nickname}', ${my_user_id} , '${nickname}' ,'${lat}' ,'${lng}' , '${intNowDate}' )
								`
								await executeQuery(pool, insertsql, []);
								//send push

								fcm_common.sendFcm(pid, dis_user_nickname, "1");
							}
						}
					}
				}
			});


			// await redisClient.georadius("userposition", lng, lat, 10000, "m", async function (err, data) {
			// 	if( data != undefined && data.length > 0 ) {
			// 		fcm_common.sendFcmLong(pid, "", "8",data.length);
			// 	}
			// });


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
						if( my_user_id != userid ) {

							var user = await redisClient.v4.get(`user:${userid}`); 
							var userJson = await JSON.parse(user);
							var dis_pid = userJson.pid;
							if( newUserObj == null ) {
								//fcm_common.sendFcm(dis_pid, nickname, "3");
							}

							var dataObj = new Object();
							dataObj.lng  = userJson.lng;
							dataObj.lat  = userJson.lat;
							dataObj.nickname  = userJson.nickname;
							dataObj.myicon = userJson.myicon;
							dataObj.speed = userJson.speed;
							dataObj.pid = userJson.pid;
							dataObj.my_user_id = userJson.user_id;
							returnArray.push(dataObj);

							console.log("save data");
							console.log(dataObj);
						}
					}

					ws.send(JSON.stringify(returnArray));
				}
			});
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