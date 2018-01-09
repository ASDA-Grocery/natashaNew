'use strict';

const express = require('express')
    , bodyParser = require('body-parser')
    , app = express()
    , request = require("request");

var priceListDD = require("./priceListDD.js")
  , priceListWS = require("./priceListWS.js")
  , packageData = require('./packageDb.js');

//API KEY for Google Distance Matrix API
const API_KEY = "AIzaSyC0KZOj0sO4UHi2fLyDhsGnfV7GZZxGdfM";

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
      , openCounter = 0
      , ofd = 0
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
        let origin = originCity
          , destination = destinationCity
          , days = numberOfDays
          , weight = parcelWeight.amount
          , size = parcelLength.amount;
        
        distanceCalc(origin, destination, days, weight, size);
          
        // calculating the distance between two cities
        function distanceCalc(origin, destination, days, weight, size) {
          request(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${API_KEY}`,
            {
              json: true
            },
            (err, res, body) => {
              if (err) {
                return console.log(err);
              }
              let distance = parseInt(
                body.rows[0].elements[0].distance.text.substring(0, 3)
              );
              let priceForDaysAndDistance = getPriceBasedOnDistanceAndDays(
                distance,
                days
              );
              let priceForWeightAndSize = getPriceBasedOnWeightAndSize(weight, size);
              console.log("Cost based on Weight and Size: " + priceForWeightAndSize);
              console.log("Cost based on Distance and Days: " + priceForDaysAndDistance);
              if(priceForWeightAndSize > priceForDaysAndDistance){
                speech = 'The cost of delivery will be ' + priceForWeightAndSize + ' Pounds.'
              }
              else{
                speech = 'The cost of delivery will be ' + priceForDaysAndDistance + ' Pounds.'
              }
              responseToAPI(speech);
              return distance;
            }
          );
        }
        
        // calculating the cost based on the distance and days
        function getPriceBasedOnDistanceAndDays(distance, days) {
          console.log("distance in kms " + distance);
          console.log("No. of days " + days);
          var i = 0;
          while (i < priceListDD.length) {
            if (distance <= priceListDD[i].distance && days <= priceListDD[i].days) {
              return priceListDD[i].price;
            }
            if (distance > priceListDD[i].distance && distance <= priceListDD[i + 1].distance) {
              for (var j = 0; j < priceListDD.length; j++) {
                if (priceListDD[j].distance == priceListDD[i + 1].distance) {
                  if (days <= priceListDD[j].days) {
                    return priceListDD[j].price;
                  }
                  if (days > priceListDD[j].days && days <= priceListDD[j + 1].days) {
                    return priceListDD[j + 1].price;
                  }
                }
              }
            }
            i++;
          }
        }
        
        // calculating the cost based on weight and size of the parcel
        function getPriceBasedOnWeightAndSize(weight, size) {
          console.log("Parcel weight in kg " + weight);
          console.log("Parcel size in inches " + size);
          var i = 0;
          while (i < priceListWS.length) {
            if (weight <= priceListWS[i].weight && size <= priceListWS[i].size) {
              return priceListWS[i].price;
            }
            if (weight > priceListWS[i].weight && weight <= priceListWS[i + 1].weight) {
              for (var j = 0; j < priceListWS.length; j++) {
                if (priceListWS[j].weight == priceListWS[i + 1].weight) {
                  if (size <= priceListWS[j].size) {
                    return priceListWS[j].price;
                  }
                  if (size > priceListWS[j].size && size <= priceListWS[j + 1].size) {
                    return priceListWS[j + 1].price;
                  }
                }
              }
            }
            i++;
          }
        }
      }      
    } 
    
    else if(intent === 'enquireSurcharge'){
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
    
    else if(intent === 'selectPickupSlot'){
      console.log('Inside selectPickupSlot Intent')
      var timeOfDay = req.body.result.parameters.timeOfDay ? req.body.result.parameters.timeOfDay : 'noTimeOfDay'
        , slotStartTime = req.body.result.parameters.slotStartTime ? req.body.result.parameters.slotStartTime : 'noSlotStartTime'
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
    
    if(intent === 'checkPackageStatus'){
      console.log('Package Database :', packageData.packageDb);
      packageData.packageDb.forEach(function(element){
        if(element.status === 'transit'){
          openCounter ++;
        } else if(element.status === 'outForDelivery'){
          ofd ++;
        }
      })
      if(openCounter == 0 && ofd == 0){
        speech = 'You have no packages to track. Anything else I can help you with?'
      }
      else if(openCounter == 1 && ofd == 0){
        packageData.packageDb.forEach(function(element){
          if(element.status === 'transit'){
            var deliveryTimeRem = (element.deliveryTime - new Date())/60000;
            speech = 'Your package is in transit to '+element.destination+' and will reach you in the next '
                      + Math.ceil(deliveryTimeRem) + ' minutes. Would you like me to help you with anything else?'
          }
        })
      }
      else if(openCounter == 0 && ofd == 1){
        packageData.packageDb.forEach(function(element){
          if(element.status === 'outForDelivery'){
            speech = 'Your package to '+element.destination+' which sent on '+element.packageSentDate
                +' is out for delivery and will be delivered by end of the day. Would you like me to help you with anything else?'
          }
        })   
      }
      else{
        speech = 'You have ' + openCounter + ' packages in transit and '+ofd+' package is out for delivery.'
        var tempCount = 1;
        packageData.packageDb.forEach(function(element){
          if(element.status === 'open'){
            speech = speech + ' Package ' + tempCount + ' is for ' + element.value
                     + ' and it was sent on ' + element.packageSentDate + ' to '+element.destination+'.'
            tempCount++;
          }
        })
        speech = speech + ' Which one should I check?'
      }
      responseToAPI(speech);
    }
   else if(intent === 'packageNo-status'){
      var packageNo = req.body.result.parameters.packageN ? req.body.result.parameters.packageN : 'noOrderNumber'
      if(packageNo === 'noOrderNumber'){
        speech = 'Sorry! Not able to help you this time. Do you want me to help you with anything else?'
      }
      else{
        var packageCounter = 0;
        for(var i = 0; i < packageData.packageDb.length; i++){
          if(packageData.packageDb[i].status === 'transit'){
            packageCounter++;
            if(packageCounter == packageNo){
              var deliveryTimeRem = (packageData.packageDb[i].deliveryTime - new Date())/60000;
    //                   speech = 'It has left our store and will reach you in the next '
    //                             + Math.ceil(deliveryTimeRem) + ' minutes . Would you like me to help you with anything else?'
                 speech = 'Your package is in transit to '+packageData.packageDb[i].destination+' and will reach you in the next '
                         + Math.ceil(deliveryTimeRem) + ' minutes. Would you like me to help you with anything else?'
              if(packageData.packageDb[i].shipped === 'outForDelivery'){
                speech = 'It is yet to be shipped but will reach you on time. Anything else I can help you with?'
              }
              break;
            }
          }
        }
      }
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
