'use strict';

const express = require('express')
    , bodyParser = require('body-parser')
    , { wordsToNumbers } = require('words-to-numbers')
    , app = express();

// var orderData = require('./orderDb.js')
//   , shoppingData = require('./shoppingList.js')
//   , productData = require('./productList.js')
//   , customerData = require('./customerList.js')
//   , openNotificationsData = require('./openNotifications.js');

// const google = require('googleapis')
//     , calendar = google.calendar('v3')
//     , OAuth2 = google.auth.OAuth2
//     , clientId = '357369265143-8j0kor1bbl87h7houkt5qbt76r9keg5l.apps.googleusercontent.com'
//     , clientSecret = 'E047ajWFZ5MiobPR_7WRrvXx'
//     , redirect = 'https://oauth-redirect.googleusercontent.com/r/groceryapp-b4d9c'
//     , oauth2Client = new OAuth2(clientId, clientSecret, redirect);

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.post('/callWebhook', function(req, res) {
    console.log('Inside enquire order')
    var speech = 'This is the default speech'
      , contextOut
      , intent = req.body.result && req.body.result.metadata.intentName ? req.body.result.metadata.intentName : "noIntent"
      , contexts =  req.body.result && req.body.result.contexts ? req.body.result.contexts : "noContexts";
//       , accessToken = req.body.originalRequest.data.user.accessToken ? req.body.originalRequest.data.user.accessToken : 'noAccessToken';
    console.log('intent - > ', intent);
    
    if(intent === 'orderDate-status'){
      console.log('Checking by Date :', req.body.result.parameters)

      responseToAPI(speech);
    }    
    else{
      console.log('No intent matched!!')
      speech = 'Sorry! Unable to Understand'
      responseToAPI(speech)
    }

    function responseToAPI(speech){
        return res.json({
            speech: speech,
            displayText: speech,
            source: 'webhook-natasha-assistant',
            contextOut: contextOut
        });
    }

});

app.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});
