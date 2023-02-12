require('dotenv').config();
const express = require("express");
var cors = require('cors');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const PORT = process.env.PORT || 3001;

const app = express();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const sid = process.env.TWILIO_API_KEY_SID;
const secret = process.env.TWILIO_API_KEY_SECRET

const client = require('twilio')(sid, secret, { accountSid: accountSid });
app.use(
    cors({origin: [`http://localhost:3000`, `http://127.0.0.1:${PORT}`]})
  );

  function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

let myMiddleware = async function(req, res, next) {
  try{

    console.log('starting to create room');
  
    let tempRoomname;
    let roomList;
  
    do
    {
      tempRoomname = makeid(7);
      console.log('room name generated ',tempRoomname);
      roomList = await client.video.rooms.list({uniqueName: tempRoomname, status: 'in-progress'});
      
    }while(roomList.length>0);
  
      let room = await client.video.rooms.create({
        uniqueName: tempRoomname,
        type: 'go'
      }).then((room)=>{return room});
  
      const videoGrant = new VideoGrant({
        room: room.uniqueName,
      })
  
      // Create an access token
      const token1 = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
      );
  
      // Add the video grant and the user's identity to the token
      token1.addGrant(videoGrant);
      token1.identity = makeid(5);

      const token2 = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
      );
  
      // Add the video grant and the user's identity to the token
      token2.addGrant(videoGrant);
      token2.identity = makeid(5);
      
      var data=
      {
        'roomName': room.uniqueName,
        'accessTokenReceiver': token1.toJwt(),
        'accessTokenSender': token2.toJwt()
      }
      
      console.log('data is ',data);
  
      res.json(data)
      next();
  
    }
    catch (error) {
      
    }
};
  

app.get("/api",myMiddleware);



app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
