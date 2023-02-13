require('dotenv').config();
const express = require("express");
var cors = require('cors');
const {RtcTokenBuilder, RtcRole} =  require('agora-access-token');

const PORT = process.env.PORT;

const app = express();

const appID = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

const nocache = (_, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
}

app.use(
    cors({origin: [`http://localhost:3000`, `http://127.0.0.1:${PORT}`]})
  );

let myMiddleware = async function(req, resp, next) {
  resp.header('Access-Control-Allow-Origin', '*');
  
  try{
    const channelName = req.params.channel;

    if (!channelName) {
      return resp.status(500).json({ 'error': 'channel is required' });
    }

      let uid = req.params.uid;
  if(!uid || uid === '') {
    return resp.status(500).json({ 'error': 'uid is required' });
  }
  // get role
  let role;
  if (req.params.role === 'publisher') {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === 'audience') {
    role = RtcRole.SUBSCRIBER
  } else {
    return resp.status(500).json({ 'error': 'role is incorrect' });
  }

    let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  let token;
  if (req.params.tokentype === 'userAccount') {
    token = RtcTokenBuilder.buildTokenWithAccount(appID, appCertificate, channelName, uid, role, privilegeExpireTime);
  } else if (req.params.tokentype === 'uid') {
    token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpireTime);
  } else {
    return resp.status(500).json({ 'error': 'token type is invalid' });
  }
  
  return resp.json({ 'rtcToken': token });
  }
  catch(e)
  {
    resp.json(e);
  }
};
  

app.get('/rtc/:channel/:role/:tokentype/:uid', nocache , myMiddleware);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
