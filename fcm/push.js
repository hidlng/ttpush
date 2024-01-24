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
	        			"option" : option,
                "pid" : '', 
                "fid" : '', 
                "count" : '0'

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

    sendFcmLong : async function( dkey, name , option, count) {
      const message = {
          to: dkey,
          data: {
              "title" : "TANGO 스치",
              "message" : "10km 이내에 반가운 동료 " + count + "명이 있습니다.",
              "option" : option,
              "pid" : '', 
              "fid" : '', 
              "count" : count
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



  sendFcmHidden : async function( dkey, name , option, count) {
    const message = {
        to: dkey,
        data: {
            "title" : "이벤트 당첨!",
            "message" : "축하드립니다! 보물과 스치 하셨습니다!",
            "option" : option,
            "pid" : '', 
            "fid" : '', 
            "count" : ''
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


    sendMsgFcm : async function( dkey, name , option, titleUser, frompid, fid) {
      const message = {
          to: dkey,
          data: {
              "title" : titleUser,
              "message" : name,
              "option" : option, 
              "pid" : frompid,
              "fid" : fid, 
              "count" : '0'
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
