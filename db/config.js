/**
 * http://usejsdoc.org/
 */
 var mysql = require('mysql');

 var pool = mysql.createPool({
     host    :'tanggo.cxo91rh3nvir.ap-northeast-2.rds.amazonaws.com',
     port : 3306,
     user : 'root',
     password : 'tanggo11!',
     database:'tanggodb',
     connectionLimit : 1000,
     dateStrings: 'date',
     resave: false,
     saveUninitialized: true,
     multipleStatements: true,
     waitForConnections:false
 });
 
 //DB
global.executeQuery = function(server, sql, param) {
    return new Promise(function (resolve, reject) {
       server.getConnection(function(err, connection) {               
              if(err){
                  console.log(err + connection);
                  if(typeof connection !== 'undefined' && connection && connection.release) {
                      connection.release();  //error 지점
                      console.log('connection released');
                  }else{
                      console.log('connection is undefined!!');
                  }         
                  console.log('[executeQuery - 1] ' + err);
              }      
  
             try{ 
                connection.query( sql, param, function(err, rows) {      
                    connection.release();                
                    if(err) {
                        console.log('[executeQuery -2 ] ' + err + '[' + sql + ']');
                        resolve([]);                     
                    } else {
                        resolve(rows);
                    }
                });
            }catch(e){
                console.log('[executeQuery -3 ] ' + e , sql, server , new Date());

                if(typeof connection !== 'undefined' && connection) {
                    connection.release();
                }

                return;
                //connection.release();
            }
          });
    });
}

 
 module.exports = pool;