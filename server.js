const express = require('express')
const path = require('path')
const file_sys = require('fs')
const ReadLine = require('readline')
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const {GoogleAPI} = require('googleapis')
const bodyParser = require('body-parser');
const { fileURLToPath } = require('url');
const app = express();
app.use(cors({origin : "*"}));
app.use(bodyParser.urlencoded({extended : true}));

file_sys.readFile('Creadentials.json', (err, data) => {
    authorize(JSON.parse(data));
})
const tokenPath = 'token.json' // token json created automatically
const oAuthClient;

const authorize = (Credential) => {
    const {client_secret, client_id, redirect_urls} = Credential.installed;
    oAuthClient = new GoogleAPI.auth.OAuth2(client_id, client_secret, redirect_urls[0]);
    file_sys.readFile(tokenPath, (err, token) => {
        if(err) return getNewToken(oAuthClient); // generate New token
        oAuthClient.setCredential(JSON.parse(token));
    })
    
}

const getNewToken = (oAuthClient) => {
    const authURL = oAuthClient.generateAuthUrl({
        access_type : 'offline',
        scope: 'https://www.googleapis.com/auth/gmail.send'
    })
    const read_line = ReadLine.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    read_line.question('Enter the code here', (code) => {
        read_line.close();
        oAuthClient.getToken(code, (err, token) => {
            console.log(err);
            oAuthClient.setCredential(token);
            file_sys.writeFile(tokenPath, JSON.stringify(token), (err) => {
                if(err) return console.error(errr);
                console.log('TOKEN STORED TO', tokenPath);
            })
        })
    })
}


const sendGmail = async (auth, userID, message) => {
    const gmail = GoogleAPI.gmail({version : 'v1', auth});
    mail = await gmail.users.message.send( {
        userId : userID,
        resource: {
            raw : message,
        }
    })
    return mail;
}
app.get("/sendMail", (req, res) => { // assuming email and text is come with request
    console.log("Request Came");
    const {email, text} = req.body;
    let DoneSend = await sendGmail(oAuthClient, email, text);
    res.json({DoneSend})
});

app.listen(5000, () => {
    console.log('We are on 5000');
})