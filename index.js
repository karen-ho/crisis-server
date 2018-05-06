var express = require('express');
var app = express();
var fs = require('fs');
const bodyParser = require('body-parser');

const mysql = require('promise-mysql');
const connectProperties = process.env.DB || {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crisis'
};

const careController = require('./controllers/CareController.js')(mysql, connectProperties);
const dataController = require('./controllers/DataController.js')(mysql, connectProperties);
const personController = require('./controllers/PersonController.js')(mysql, connectProperties);

//twilio setup
const isDev = !process.env.PROD;
const TWILIO_ACCOUNTSID = process.env.TWILIO_ACCOUNTSID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const twilio = require('twilio');
const twilioClient = isDev ? null : new twilio(TWILIO_ACCOUNTSID, TWILIO_AUTH_TOKEN);
const ML_URL = 'https://scenario-service.herokuapp.com/scenarios';

var demo = false;

app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

app.get('/index.htm', function (req, res) {
   res.sendFile( __dirname + "/" + "index.htm" );
});

// data endpoints
app.get('/data', function(request, response) {
	const personId = request.query.personId;
	const start = request.query.start;
	const end = request.query.end;
	dataController.filter(personId, start, end)
		.then(data => response.json(data));
});

app.post('/data/', function(request, response) {
	const clientData = request.body;

	const processedData = [].concat(clientData)
		.map(data => ({
			lat: (data.data.location || {}).latitude > 0 ? (data.data.location || {}).latitude : 'null',
			long: (data.data.location || {}).longitude > 0 ? (data.data.location || {}).latitude : 'null',
			heartRate: data.data.heartRate || -1,
			clientCreatedTime: data.data.time,
			personId: data.data.personId || 1
		}));

	dataController.saveData(processedData)
		.then(() => {
			// apparently scenario 3 is the OD case
			if (demo) {
				response.json({ status: 3, message: 'overdose detected' });
				return;
			}

			return fetch(ML_URL, { method: POST }).then((data) => {
				if (data.scenario === 3) {
					response.json({ status: 3, message: 'overdose detected' });
					return;
				}
				response.json({});
			});
		}).catch(err => response.status(500).json(err));
});

// person endpoints
app.post('/person/', function(request, response) {
	const person = request.body;

	personController.savePerson(person)
		.then(data => response.json(Object.assign({ id: data.insertId }, person)));
});

app.put('/person/:id/address', function(request, response) {
	const body = request.body;

	if (!body) {
		response.status(404).json({});
		return;
	}

	const id = request.params.id;

	const lat = request.body.lat;
	const long = request.body.long;

	personController.saveAddress(id, lat, long)
		.then(() => response.status(204).json({}))
});

app.put('/person/:id/relations', function(request, response) {
	const id = request.params.id;
	const personIds = request.body;
	personController.saveFamilyRelations(id, personIds)
		.then(() => response.status(204).json({}));
});

// care endpoints
app.post('/care/', function(request, response) {
	const care = request.body;
	careController.createCare(care)
		.then(data => response.json(Object.assign({ id: data.insertId }, care)));
});

// fetch a list of cares
app.get('/care', function(request, response) {
	const familyMember = request.query.familyMember;
	const driver = request.query.driver;
	const lat = request.query.lat;
	const long = request.query.long;

	careController.filter({ familyMember, driver, lat, long })
		.then(care => {
			response.json(care)
		});
});

// fetch a care by id
app.get('/care/:id', function(request, response) {
	const id = request.params.id;
	const familyMember = request.query.familyMember;
	const driver = request.query.driver;

	careController.getCare(id)
		.then(care => {
			if (!care) {
				response.status(404).json({});
				return;
			}

			if (!familyMember && familyMember !== care.family_member_id) {
				response.status(404).json({});
				return;
			}

			response.json(care);
		});
});

// driver confirmation
app.post('/care/:id/driver', function(request, response) {
	const id = request.params.id;
	const driver = request.query.driver;

	if (!driver) {
		response.status(401).json({});
		return;
	}

	careController.setDriverId(id, driver)
		.then(() => response.status(204).response.json());
});

// family member confirmation
app.post('/care/:id/family-member', function(request, response) {
	const id = request.params.id;
	const familyMember = request.query.familyMember;

	careController.setFamilyMemberId(id, familyMember)
		.then(() => response.status(204).response.json());
});

app.post('/care/:id/done', function(request, response) {
	const familyMember = request.query.familyMember;
	const driverId = request.query.driver;
	const id = id;

	careController.getCare(id)
		.then(care => {
			if (familyMember !== null) {
				careController.setFamilyDone(id, familyMember);
				response.status(204).json({});
				return;
			}

			if (driver !== null) {
				careController.setDriverDone(id, driverId);
				response.status(204).json({});
				return;
			}
		});
});

//twilio
app.get('/twilio/sms', function(request, response) {
	if (isDev) {
		return;
	}

	var createMessage = twilioClient.messages.create({
	    body: 'Ankh Overdose Alert: John Doe. 3730 S Las Vegas Blvd.',
        to: process.env.TO_PN,
        from: process.env.FROM_PN
	});

	createMessage.then((message) => {
		console.log(message.sid);
		createMessage.done();
		response.send('a Hello World!')
	});
});

app.get('/twilio/call', function(request, response) {
 	var createCall = twilioClient.calls.create({
         url: 'http://crisis-monitor-2.herokuapp.com/twilio/xml',
         to: process.env.TO_PN,
         from: process.env.FROM_PN
	});

	createCall.then((call) => {
		console.log(call.sid)
		createCall.done();
		response.send('a Hello World!')
	});
});

app.post('/twilio/xml', function(request, response) {
	response
	  .type('xml')
	  .send(fs.readFileSync('public/twilioCall.xml'));
});


app.get('/', function(request, response) {
	fs.readFile('./index.html', function(err, content) {
		if(!err) {
			response.end(content)
		} else {
			response.end('404')
		}
	});
});

// demo
app.put('/demo', function(request, response) {
	const val = request.body;
	demo = val.value;
	console.log(val);
	console.log(demo);
	response.json({});
});

app.get('/demo', function(request, response) {
	console.log(demo ? 1 : 0);
	response.json(demo);
});