console.log("doctors module is loading")
const request_module = require('request');

var getDoctor = (lat, lng, per_page, callback) => {
	results = []
	console.log(`loading doctors api for: ${lat} and ${lng} with ${per_page} results`);
	request_module ({url:`https://api.betterdoctor.com/2016-03-01/doctors?location=${lat}%2C${lng}%2C100&sort=distance-asc&skip=0&limit=${per_page}&user_key=6864ad983287baee8365ce0542f8c459`, json: true}, (error, response, body) => {
		if (error || response.statusCode !== 200){
			callback("bad request");
		}else{
			for (let i=0; i < per_page; i++){ //buidling an array of doctors
				results.push({
				firstName: body.data[i].profile.first_name,
				lastName: body.data[i].profile.last_name,
				image_url: body.data[i].profile.image_url,
				gender: body.data[i].profile.gender,
				distance: (body.data[i].practices[0].distance).toFixed(2), //toFixed(2) limits digits after decimal to 2
				specialty: body.data[i].specialties[0].name
				})
			}
			callback(undefined, {
				results
			});
		}
	})
}

module.exports.getDoctor = getDoctor;
