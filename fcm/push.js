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
		//dkey = "f16pl1IwSt6M_7eqmh1YG4:APA91bHonj654KR6yNfKC-580sl4NjD38iw1vUTtMA9ymWwWeqB2eNG5uBLYBBWtnJLSbc36hC8cshGrtZJ6hxSrP_m3bh0QLWvVfowHRH-WDSPsssgARykNL2_79itOks1rzyJwOBni";
		//name = "CIAT";
        // var data_key = String( push_key );
        // var site_id = String( site_id );
        // var site_type = String( site_type );
        // var site_name = String( site_name );
        var payload = {
            data : {
                "title" : "TANGO 스치",
                "message" : name,
				"option" : option
            }
        }; 

        console.log( dkey );
        console.log( payload );

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
