var admin = require("firebase-admin");
var serviceAccount = require('../tango-17fdb-firebase-adminsdk-6mu9h-cb0d32717e.json');
module.exports = {

    initFcm : async function() {
        console.log( 'Push Init' );
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    },

    sendFcm : async function( dkey, name , option) {
        var payload = {
            data : {
                "title" : "TANGO 스치",
                "message" : name,
				"option" : option
            }
        }; 

        console.log( dkey );
        console.log( payload );

        if( dkey != undefined ) {
            admin.messaging().sendToDevice( dkey, payload  ).then(function(response){
                console.log('success');
                return 200;            
            }).catch(function(error){
                console.log('error');
                console.log(error);
                return 500;
            });
        }
    }

}
