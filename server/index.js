require('dotenv').config();
const express = require("express");
var cors = require('cors');

const PORT = process.env.PORT || 3001;

const app = express();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);
app.use(
    cors({origin: [`http://localhost:3000`, `http://127.0.0.1:${PORT}`]})
  );
app.get("/api", (req, res) => {
    client.tokens.create().then((token)=>{ 
        var myString  = token.iceServers[2]['url'] + ','+token.iceServers[2]['username']+','+token.iceServers[2]['credential'];
        // var myString = JSON.stringify(token)
        res.json({string: myString})
    });
  });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});