const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connect = {
    DB_USER:process.env.DB_USER,
    DB_PASS:process.env.DB_PASS,
    DB_Name:process.env.DB_Name,
    DB_COLLECTION:process.env.DB_COLLECTION,
    FIREBASE_DB_URL:process.env.FIREBASE_DB_URL,
};

const serviceAccount = require("./config/burj-al-arab-by-mahbub-firebase-adminsdk-4ktzo-ea14bbfab7.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: connect.FIREBASE_DB_URL,
});

const MongoClient = require("mongodb").MongoClient;
const uri =`mongodb+srv://${connect.DB_USER}:${connect.DB_PASS}@practice-by-me.dtava.mongodb.net/${connect.DB_Name}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true,});



client.connect((err) => {
  const collection = client.db(`${connect.DB_Name}`).collection(`${connect.DB_COLLECTION}`);

  app.post("/addbooking", (req, res) => {
    const newBookingsData = req.body;
    collection.insertOne(newBookingsData).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      admin.auth().verifyIdToken(idToken).then(function (decodedToken) {
          const tokenEmail = decodedToken.email;
          const emailID = req.query.email;
          console.log(tokenEmail, emailID);
          if (tokenEmail == req.query.email) {
            collection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
              });
          }
          else{
            res.status(401).send('un-authorized access');
          }
        })
        .catch(function (error) {
            res.status(401).send('un-authorized access');
        });
    }
    else{
        res.status(401).send('un-authorized access');
    }
  });
});

app.listen(4200, () => console.log("Listening Server Port 4200 "));
