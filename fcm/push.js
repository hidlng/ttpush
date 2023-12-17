const FCM = require('fcm-node');
var serverKey = 'AAAAG9Xpi2Y:APA91bFqcLUVpsy8-GrWBw-_XFvHIrD3CN7Es940Im1OCkMWQhVQlJthW4sHktX1QwcHLP_63PPw8mFdX0WKAMO2ZCXjieW8MPh7SXQKYJCHT95Sjf9KbTyF8LTciNPqwK9t60nUSE7r';
const fcm = new FCM(serverKey);
module.exports = {
    initFcm : async function() {
        console.log( 'Push Init' );
    },

    sendFcm : async function( dkey, name , option) {
        const message = {
            to: dkey,
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
    },


    sendMsgFcm : async function( dkey, name , option, titleUser) {
      const message = {
          to: dkey,
          data: {
              "title" : titleUser,
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
  }

}
