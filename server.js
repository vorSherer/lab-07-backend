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

app.get('/location', (request, response) => {
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
});

app.get('/weather', (request, response) => {
  try {
    const weatherData = require('./data/darksky.json');
    let weatherArr = [];
    weatherData.daily.data.forEach(obj => {
      console.log('obj.time:', obj.time);
      // Adreinne helped solve the time display issue
      let time = new Date(obj.time * 1000).toString().slice(0, 15);

      weatherArr.push(new Weather(time, obj.summary));
    });
    response.send(weatherArr);
  }
  catch (error) {
    errorHandler(error, request, response);
  }

});

function Weather (time, forecast){
  this.time = time;
  this.forecast = forecast;
}


function Location (city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function errorHandler (error, request, response) {
  console.log('inside errorHandler');
  response.status(500).send(error);
}

app.listen(PORT, () => console.log(`Server up on port ${PORT}`));
