const express = require('express');
const http = require('http');
const ejs = require('ejs')
const fs = require('fs');
const request_module = require('request');
const bodyParser = require('body-parser')
const geocode = require('./geocode/geocode.js');//module to extract lat,lng from zip code
const doctors = require('./doctors/doctor_retrieval.js')//module to get doctors from api
const port = process.env.PORT || 3000; //configures to available port based on
//enviroment variable or port 3000 by default

var app = express();
app.use(express.json());
app.use(express.urlencoded()); //what is urlencoded ?

//here is a key:value pair (declaring the engine I'd like to use for view)
app.set('view engine', 'ejs');

var server = http.createServer(app);

app.use((request, response, next)=>{ //logging info about date, location and method used
	var now = new Date().toString();
	var log = `${now}: ${request.url} ${request.method}`;
	console.log(log);
	fs.appendFile('server.log', log + '\n', (error) => { //where '\n' is a new line character
		if (error) {console.log("unable to append to server log")}
	}); 
	next();
});
//partials is a feature to plug in pieces of html into webpage in hbs
//just created static path from header

//creating static path from the root of our harddrive to public folder
app.use(express.static(__dirname + '/public'));


app.get('/', (request, response) =>{
	response.render('index', {
		welcomeMessage: "We are glad to see you here today",
		dateNow: new Date().toDateString(),
	})
});


app.get('/results', (request, response) =>{
	// console.log(request.query);
	var zip = request.query.zip;
	// var per_page = request.query.per_page;
	var per_page = request.query.per_page;
	console.log("after passing to app.get('/results')", zip, per_page);
	geocode.geocodeAddress(zip).then((result)=>{
		console.log(JSON.stringify(result, null, 2)) //2 is number of spaces we use for indentation
 		var lat = result.latitude;
		var lng = result.longitute;
		request_module ({url:`https://api.betterdoctor.com/2016-03-01/doctors?location=${lat}%2C${lng}%2C100&sort=distance-asc&skip=0&limit=${per_page}&user_key=6864ad983287baee8365ce0542f8c459`, json: true}, (error, res, drData) => {
			// console.log(drData)
			var parsedData = (drData);
			console.log(parsedData);
			// console.log(parsedData.data[2].profile.image_url);
		

			response.render('results', {
				header: "Results page",
				latitude: lat,
				longitude: lng,
				parsedData: parsedData
			})
		})
 	}).catch((errorMessage) => {//if not success - error message
		console.log(errorMessage);
 	})
});
app.post('/search', (request, response) =>{
	var zip = request.body.zip_code;
	var per_page = request.body.per_page;
	console.log('got the data from form:', zip, per_page);
	response.redirect(`/results?zip=${zip}&per_page=${per_page}`); //render will let me render any of the templates withing view engine
})

server.listen(port, (error)=>{
	(error) ? console.log("your code sucks") : console.log(`listening on port ${port}`);
});