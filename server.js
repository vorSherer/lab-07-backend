'use strict';

//load environment variables from the .env
require('dotenv').config();

//declare application dependancies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

//Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

//route syntax = app.<operation>('<route>', callback);
app.get('/', (request, response) => {
  response.send('Home Page!');
});

app.get('/location', locationHandler);

app.get('/weather', weatherHandler);

function Weather (time, forecast){
  this.time = time;
  this.forecast = forecast;
}


function Location (city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function locationHandler( request, response) {
  try {
    const city = request.query.city;
    let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json&limit-1`;
    superagent.get(url)
      .then(data => {
        const geoData = data.body[0];
        console.log(geoData);
        const locationData = new Location(city, geoData);
        response.send(locationData);
      });
    // console.log('geoData: ', geoData);
    // console.log('locationData', locationData);
  }
  catch(error) {
    errorHandler(error, request, response);
  }

}

function weatherHandler( request, response) {
  try {
    const weatherData = require('./data/darksky.json');
    let weatherArr = weatherData.daily.data.map(obj => {
      // Adreinne helped solve the time display issue
      let time = new Date(obj.time * 1000).toString().slice(0, 15);
      return new Weather(time, obj.summary);
    });
    // weatherData.daily.data.forEach(obj => {

    //   weatherArr.push(new Weather(time, obj.summary));
    // });
    response.send(weatherArr);
  }
  catch (error) {
    errorHandler(error, request, response);
  }
}


function errorHandler (error, request, response) {
  console.log('inside errorHandler');
  response.status(500).send(error);
}

app.listen(PORT, () => console.log(`Server up on port ${PORT}`));
