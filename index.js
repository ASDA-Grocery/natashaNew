'use strict';

const express = require('express')
    , bodyParser = require('body-parser')
    , app = express()
    , request = require("request");

var priceListDD = require("./priceListDD.js")
  , priceListWS = require("./priceListWS.js")
  , packageData = require('./packageDb.js')
  , shoppingData = require('./shoppingList.js')
  , productData = require('./productList.js');

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
        
//         if(timePeriod === 'weeks'){
//             numberOfDays = numberOfDays * 7;
//         }
//         else if(timePeriod === 'months'){
//             numberOfDays = numberOfDays * 30;
//         }
          
//         if(parcelLength.unit === 'ft'){
//             parcelLength.amount = parcelLength.amount * 12;
//         }
//         else if(parcelLength.unit === 'm'){
//             parcelLength.amount = parcelLength.amount * 39.3701;
//         }
//         else if(parcelLength.unit === 'cm'){
//             parcelLength.amount = parcelLength.amount * 0.393701;
//         }
          
//         if(parcelWeight.unit === 'kg'){
//             parcelWeight.amount = parcelWeight.amount * 2.20462;
//         }
//         else if(parcelWeight.unit === 'g'){
//             parcelWeight.amount = parcelWeight.amount * 0.00220462;
//         }
          
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
                if(parcelWeight.amount > 70){
                    speech = speech + 'Also there might be some extra surcharges associated with this delivery.'
                }
                else if(parcelLength.amount > 48){
                    speech = speech + 'Also there might be some extra surcharges associated with this delivery.'
                }
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
    
    else if(intent === 'bookPickupSlot'){
      console.log('Inside bookPickupSlot Intent')
      var dateOfPickup = req.body.result.parameters.dateOfPickup ? req.body.result.parameters.dateOfPickup : 'noDateOfPickup'
      if(dateOfPickup === 'noDateOfPickup'){
        speech = 'Please specify the date of pickup as today or tomorrow.';
        responseToAPI(speech);
      }
      else{
        if(dateOfPickup === 'today'){
            speech = 'We have three pickup slots. The first one is from 9 AM to 10 AM, the second one is from 12 PM to 1 PM and the last one is from 3 PM to 4 PM. Which one do you want to select?'
        }
        else if(dateOfPickup === 'tomorrow'){
            speech = 'We have three pickup slots. The first one is from 9 AM to 10 AM, the second one is from 12 PM to 1 PM and the last one is from 3 PM to 4 PM. Which one do you want to select?'
        }
        else{
            speech = 'Sorry! This slots are available only for today or tommorrow.'
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
        console.log('Slot Start Time : ', slotStartTime, ' type: ', typeof slotStartTime);
        console.log('Time of Day : ', timeOfDay, ' type: ', typeof timeOfDay);
        if(slotStartTime === '9' || slotStartTime === 9){
            console.log('Inside 9')
            if(timeOfDay === 'AM' || timeOfDay === 'am'){
                speech = 'Okay! A pickup slot from 9 AM to 10 AM has been booked for you.'
            }
            else{
                speech = 'Sorry! This slot is not available.'
            }
        }
        else if(slotStartTime === '12' || slotStartTime === 12){
            console.log('Inside 12')
            if(timeOfDay === 'PM' || timeOfDay === 'pm'){
                speech = 'Okay! A pickup slot from 12 PM to 1 PM has been booked for you.'
            }
            else{
                speech = 'Sorry! This slot is not available.'
            }            
        }
        else if(slotStartTime === '3' || slotStartTime === 3){
            console.log('Inside 3')
            if(timeOfDay === 'PM' || timeOfDay === 'pm'){
                speech = 'Okay! A pickup slot from 3 PM to 4 PM has been booked for you.'
            }
            else{
                speech = 'Sorry! This slot is not available.'
            }
        }
        else{
            speech = 'Sorry! This slot is not available.'
        }
        responseToAPI(speech);
      }      
    }

    else if(intent === 'findProducts'){
      console.log('Product List :', productData.productList)
      var mineralContent = req.body.result.parameters.mineralContent ? req.body.result.parameters.mineralContent : 'noMineralContent'
      var mineralType = req.body.result.parameters.mineralType ? req.body.result.parameters.mineralType : 'noMineralType'
      var productType = req.body.result.parameters.productType ? req.body.result.parameters.productType : 'noProductType'
      if(mineralType === 'noMineralType' || productType === 'noProductType' || mineralContent === 'noMineralContent'){
        speech = 'Please specify a proper product with proper details.'
      }
      else{
        var countObj = {}
          , keyArray = new Array();
        productData.productList.forEach(function(element){
          if(!(element[mineralType] in countObj)){
            var tempKey = element[mineralType]
            countObj[tempKey] = 1;
            keyArray.push(tempKey)
          }
          else{
            var tempKey = element[mineralType]
            var tempVal = countObj[tempKey]
            countObj[tempKey] = tempVal + 1;
          }
        })
        keyArray.sort(function(a,b){
          return a - b;
        });
        if(mineralContent === 'high'){
          speech = 'We have '+ countObj[keyArray[keyArray.length - 1]] + ' options with '
                    + keyArray[keyArray.length - 1] + ' grams and ' + countObj[keyArray[keyArray.length - 2]]
                    + ' options with ' + keyArray[keyArray.length - 2]+ ' grams in each bar.'
        }
        else if(mineralContent === 'low'){
          speech = 'We have '+ countObj[keyArray[0]] + ' options with '
                    + keyArray[0] + ' grams and ' + countObj[keyArray[1]]
                    + ' options with ' + keyArray[1] + ' grams in each bar.'
        }
        else{
          speech = 'Sorry this level of content is not available.'
        }
      }
      responseToAPI(speech);
    }
    
    else if(intent === 'findSpecificContentProduct'){
      console.log('inside findSpecificContentProduct')
      console.log('checking contexts: ', req.body.result.contexts)
      var index = req.body.result.contexts.findIndex((x) => x.name === 'searchproduct')
      var initialIndex = req.body.result.contexts.findIndex((x) => x.name === 'initialcontent')
      var mineralValue = req.body.result.contexts[index].parameters.number ? parseInt(req.body.result.contexts[index].parameters.number) : 'noMineralValue'
      var mineralType = req.body.result.parameters.mineralType ? req.body.result.parameters.mineralType : 'noMineralType'
      var initialMineralType = req.body.result.contexts[initialIndex].parameters.initialMineralType ? req.body.result.contexts[initialIndex].parameters.initialMineralType : 'noInitialMineralType'
      var mineralContent = req.body.result.parameters.mineralContent ? req.body.result.parameters.mineralContent : 'noMineralContent'
      console.log('Mineral Value:', mineralValue)
      console.log('Mineral Type:', mineralType)
      console.log('Initial Mineral Type:', initialMineralType)
      console.log('Mineral Content:', mineralContent)
      if(mineralValue === 'noMineralValue'){
        speech = 'No mineralValue context'
      }
      else{
        speech = ''
        var contentLevel = -1
          , productName
          , totalProducts = productData.productList.length;
        productData.productList.forEach(function(element){
          if(mineralContent === 'low' || mineralContent === 'lower' || mineralContent === 'lowest'){
            console.log('element initial mineral type: ', element[initialMineralType])
            console.log('typeof initial mineral value : ', typeof element[initialMineralType])
            console.log('typeof mineral value : ', typeof mineralValue)
            if(element[initialMineralType] === mineralValue){
              console.log('inside if dsyfdysf')
              if(element[mineralType] < contentLevel || contentLevel < 0){
                contentLevel = element[mineralType]
                productName = element.productName;
                console.log('ping')
              }
              else{
                console.log('pong')
              }
            }
            else{
              console.log('pongsdhfgsdyu')
            }
          }
          else if(mineralContent === 'high' || mineralContent === 'higher' || mineralContent === 'good' || mineralContent === 'highest'){
            if(element[initialMineralType] === mineralValue){
              if(contentLevel < 0 || element[mineralType] > contentLevel){
                contentLevel = element[mineralType]
                productName = element.productName;
              }
            }
          }
        })
        speech = productName;
        contextOut = [{"name":"addproductcart", "lifespan":5, "parameters":{'productName': productName}}]
      }
      responseToAPI(speech);
    }
    
    else if(intent === 'optionsFindProduct'){
      var index = req.body.result.contexts.findIndex((x) => x.name === 'searchproduct')
      console.log('index ------> ',index);
      var mineralValue = req.body.result.parameters.number ? req.body.result.parameters.number : 'noMineralValue'
      var mineralType = req.body.result.contexts[index].parameters.mineralType ? req.body.result.contexts[index].parameters.mineralType : 'noMineralType'
      if(mineralType === 'noMineralType'){
        speech = 'No mineralType context'
      }
      else{
        speech = ''
        if(mineralValue != 'noMineralValue'){
          productData.productList.forEach(function(element){
            if(element[mineralType] == mineralValue){
              speech = speech + element.productName + ', '
            }
          })
          speech = speech.slice(0,-2)
          var tempIndex = speech.lastIndexOf(',')
          if(tempIndex != -1){
            var tempSpeech = speech.substr(0, tempIndex) + ' &' + speech.substr(tempIndex+1, speech.length-1)
            speech = tempSpeech
            contextOut = [{"name":"initialcontent", "lifespan":5, "parameters":{'initialMineralType': mineralType}}]
          }
        }
      }
      responseToAPI(speech);
    }
    
    else if(intent === 'addToCart&Checkout'){
      var index = req.body.result.contexts.findIndex((x) => x.name === 'addproductcart')
      var number = req.body.result.parameters.number ? req.body.result.parameters.number : 'noNumberIntegerValue'
      var productName = req.body.result.contexts[index].parameters.productName ? req.body.result.contexts[index].parameters.productName : 'noProductName'
      var checkoutBool = req.body.result.contexts[index].parameters.checkout ? req.body.result.contexts[index].parameters.checkout : 'noCheckout'

      if(checkoutBool === 'noCheckout' || checkoutBool === ''){
        var prodIndex = productData.productList.findIndex((x) => x.productName === productName)
        var product = {
          productId: productData.productList[prodIndex].productId,
          productName: productName,
          quantity: number
        }
        shoppingData.shoppingList.cart.productList.push(product)
        console.log(shoppingData.shoppingList.cart.productList);
        speech = number + ' ' + productName + ' added to the cart. Do you want to proceed to checkout?'
      }
      else{
        var prodIndex = productData.productList.findIndex((x) => x.productName === productName)
        var product = {
          productId: productData.productList[prodIndex].productId,
          productName: productName,
          quantity: number
        }
        shoppingData.shoppingList.cart.productList.push(product)
        speech = number + ' ' + productName + ' added to the cart. Would you like to pick them up from your nearest store or should I place a delivery request?.'
      }
      responseToAPI(speech)
    }

    else if(intent === 'checkoutAfterConfirmation'){
      var negativeConfirmation = req.body.result.parameters.negativeConfirmation ? req.body.result.parameters.negativeConfirmationr : 'noNegativeConfirmation'
      var positiveConfirmation = req.body.result.parameters.positiveConfirmation ? req.body.result.parameters.positiveConfirmation : 'noPositiveConfirmation'
      if(negativeConfirmation === 'noNegativeConfirmation'){
        speech = 'Would you like to pick them up from your nearest store or should I place a delivery request?.'
      }
      else{
        speech = 'Alright. Is there anything else I can help now?'
      }
      responseToAPI(speech);
    }
    
    else if(intent === 'confirmDeliveryAddress'){
      var dateOfDelivery = req.body.result.parameters.dateOfDelivery ? req.body.result.parameters.dateOfDelivery : 'noDateOfDelivery'
      var address = req.body.result.parameters.address ? req.body.result.parameters.address : 'noAddress'
      if(address === 'noAddress' || dateOfDelivery === 'noDateOfDelivery'){
        speech = 'Please specify delivery address and delivery date properly?.'
      }
      else{
        if(address === 'home' || address === 'Home'){
            if(dateOfDelivery === 'tomorrow' || dateOfDelivery === 'Tomorrow'){
                speech = 'There is a pickup scheduled for tomorrow for you, do you want to club both both pickup and delivery together? The first pickup slot is from 9 AM to 10 AM, the second slot is from 12 PM to 1 PM and the last slot is from 3 PM to 4 PM.'
                contextOut = [{"name":"clubDelivery", "lifespan":5, "parameters":{'clubPickupCall': true}}]
            }
            else{
                speech = 'Your order has been placed and will be delivered to you by today evening.'
            }
        }
        else{
            if(dateOfDelivery === 'tomorrow' || dateOfDelivery === 'Tomorrow'){
                speech = 'Your order has been placed and you can pick it up from your nearest store by tomorrow evening.'
            }
            else{
                speech = 'Your order has been placed and you can pick it up from your nearest store by evening today.'
            }
        }
      }
      responseToAPI(speech);
    }
    
   
    else if(intent === 'checkPackageStatus'){
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
        speech = 'You have ' + openCounter + ' package in transit and '+ofd+' package is ready for delivery.'
        var tempCount = 1;
        packageData.packageDb.forEach(function(element){
          if(element.status === 'transit' || element.status === 'outForDelivery'){
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
      var packageNo = req.body.result.parameters.packageN ? parseInt(req.body.result.parameters.packageN) : 'noOrderNumber'
      console.log('Package Number: ', packageNo);
      if(packageNo === 'noOrderNumber'){
        speech = 'Sorry! Not able to help you this time. Do you want me to help you with anything else?'
      }
      else{
        var packageCounter = 0;
        if(packageData.packageDb[packageNo-1].status === 'transit'){
            speech = 'Your package is in transit to '+packageData.packageDb[packageNo-1].destination+' and will reach you on time. Would you like me to help you with anything else?'
        }
        else{
            speech = 'Your package is has arrived in '+packageData.packageDb[packageNo-1].destination+' and will be delivered to you by tomorrow. Would you like me to help you with anything else?'
        }
      }
      responseToAPI(speech);
    }
    else if(intent === 'packageDest-status'){
      var packageDest = req.body.result.parameters.packageDest ? req.body.result.parameters.packageDest : 'noDestination'
      if(packageDest === 'noDestination'){
        speech = 'Sorry! Not able to help you this time. Do you want me to help you with anything else?'
      }
      else{
         for(var i = 0; i < packageData.packageDb.length; i++){
          if(packageData.packageDb[i].status === 'transit'){
            if(packageData.packageDb[i].destination.toUpperCase() == packageDest.toUpperCase()){
                console.log('-- > ', packageData.packageDb[i].destination.toUpperCase(), packageDest.toUpperCase())
              var deliveryTimeRem = (packageData.packageDb[i].deliveryTime - new Date())/60000;
                 speech = 'Your package is in transit to '+packageData.packageDb[i].destination+' and will reach your nearest distribution center in the next '
                         + Math.ceil(deliveryTimeRem) + ' minutes. Would you like me to help you with anything else?';
                console.log('-- > -- >', deliveryTimeRem, speech);
              break;
            }
          }
        }
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
