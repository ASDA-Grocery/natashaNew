'use strict';

const express = require('express')
    , bodyParser = require('body-parser')
    , { wordsToNumbers } = require('words-to-numbers')
    , app = express();

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
    
    if(intent === 'enquireCharge'){
      console.log('Inside EnquireCharge Intent')
      var originCity = req.body.result.parameters.originCity ? req.body.result.parameters.originCity : 'noOriginCity'
        , destinationCity = req.body.result.parameters.destinationCity ? req.body.result.parameters.destinationCity : 'noDestinationCity'
        , numberOfDays = req.body.result.parameters.numberOfDays ? req.body.result.parameters.numberOfDays : 'noNumberOfDays'
        , timePeriod = req.body.result.parameters.timePeriod ? req.body.result.parameters.timePeriod : 'noTimePeriod'
        , parcelLength = req.body.result.parameters.parcelLength ? req.body.result.parameters.parcelLength : 'noParcelLength'
        , parcelWeight = req.body.result.parameters.parcelWeight ? req.body.result.parameters.parcelWeight : 'noParcelWeight';
      
      if(destinationCity === 'noDestinationCity'){
        speech = 'Please provide destination city';
        responseToAPI(speech);
      }
      else if(originCity === 'noOriginCity'){
        speech = 'Please provide Origin city';
        responseToAPI(speech);
      }
      else if(numberOfDays === 'noNumberOfDays'){
        speech = 'Please provide time period';
        responseToAPI(speech);
      }
      else if(timePeriod === 'notimePeriod'){
        speech = 'Please provide days or weeks';
        responseToAPI(speech);
      }
      else if(parcelLength === 'noParcelLength'){
        speech = 'Please provide size of parcel';
        responseToAPI(speech);
      }
      else if(parcelWeight === 'noParcelWeight'){
        speech = 'Please provide weight of parcel';
        responseToAPI(speech);
      }
      else{
        speech = 'The cost is 60 pounds';
        responseToAPI(speech);
      }      
    } 
    
    if(intent === 'enquireSurcharge'){
      console.log('Inside enquireSurcharge Intent')
      var typeOfProducts = req.body.result.parameters.typeOfProducts ? req.body.result.parameters.typeOfProducts : 'noTypeOfProducts'
      if(typeOfProducts === 'noTypeOfProducts'){
        speech = 'Please specify type of product';
        responseToAPI(speech);
      }
      else{
        if(typeOfProducts === 'fragile'){
            speech = 'An additional surcharge of 40 pounds will be added to base delivery charge.';
        }
        else if(typeOfProducts === 'normal'){
            speech = 'No additional surcharge is required.';
        }
        else{
            speech = 'Sorry! this type of product delivery is not available!'
        }
        responseToAPI(speech);
      }      
    }
    
    if(intent === 'selectPickupSlot'){
      console.log('Inside selectPickupSlot Intent')
      var timeOfDay = req.body.result.parameters.timeOfDay ? req.body.result.parameters.timeOfDay : 'noTimeOfDay'
        , slotStartTime = req.body.result.parameters.slotStartTime ? req.body.result.parameters.timeOfDay : 'noSlotStartTime'
      if(timeOfDay === 'noTimeOfDay' || slotStartTime === 'noSlotStartTime'){
        speech = 'Please specify time of the day and slot start time properly.';
        responseToAPI(speech);
      }
      else{
        if(slotStartTime === 9 && (timeOfDay === 'AM' || timeOfDay === 'am')){
            speech = 'Okay! A pickup slot from 9 AM to 12 PM has been booked for you.'
        }
        else if(slotStartTime === 12 && (timeOfDay === 'PM' || timeOfDay === 'pm')){
            speech = 'Okay! A pickup slot from 12 PM to 3 PM has been booked for you.'
        }
        else if(slotStartTime === 3 && (timeOfDay === 'PM' || timeOfDay === 'pm')){
            speech = 'Okay! A pickup slot from 3 PM to 6 PM has been booked for you.'
        }
        else{
            speech = 'Sorry! This slot is not available.'
        }
        responseToAPI(speech);
      }      
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
