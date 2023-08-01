var admin = require("firebase-admin");
const FCM = require('fcm-node');
var serviceAccount = require('../tango-17fdb-firebase-adminsdk-6mu9h-cb0d32717e.json');
var myRefreshToken = '119552969574-em5knnb06j8s88m0n74jv9do8a9d439t.apps.googleusercontent.com';
var serverKey = 'AAAAG9Xpi2Y:APA91bFqcLUVpsy8-GrWBw-_XFvHIrD3CN7Es940Im1OCkMWQhVQlJthW4sHktX1QwcHLP_63PPw8mFdX0WKAMO2ZCXjieW8MPh7SXQKYJCHT95Sjf9KbTyF8LTciNPqwK9t60nUSE7r';
const fcm = new FCM(serverKey);
module.exports = {
    //AIzaSyDs4OfHUZUxQxHaXozjCXDX_rE9hz10Bis
    initFcm : async function() {
        // const app = initializeApp();
        console.log( 'Push Init' );
        // admin.initializeApp({
        //     credential: refreshToken(myRefreshToken)
        //     //credential: admin.credential.cert(serviceAccount)
        // });
    },

    sendFcm : async function( dkey, name , option) {


        const message = {
            to: dkey,
            priority: 'high',
            data: {
                "title" : "TANGO 스치",
                "message" : name,
				"option" : option
            },
          };
          
          if( dkey != undefined ) { 
            fcm.send(message, (err, response) => {
                if (err) {
                  console.log(`Error: ${err}`);
                } else {
                  console.log(`Response: ${response}`);
                }
              });
          }


        // var payload = {
        //     data : {
        //         "title" : "TANGO 스치",
        //         "message" : name,
		// 		"option" : option
        //     }
        // }; 

        // console.log( dkey );
        // console.log( payload );

        // if( dkey != undefined ) {
        //     admin.messaging().sendToDevice( dkey, payload  ).then(function(response){
        //         console.log('success');
        //         return 200;            
        //     }).catch(function(error){
        //         console.log('error');
        //         console.log(error);
        //         return 500;
        //     });
        // }
    }

}
