var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);

var key = process.env.stripe_private_key;
if(key == null){
  app.get("/", function(req, res){
    res.send("Must set stripe_private_key in environment");
  })
  app.post("/webhook", function(){
    res.status(500).send("Must set stripe_private_key in environment");
  })
  
  server.listen(process.env.PORT || 8080);
  return;
}

app.use(bodyParser({
  limit: '50mb',
  parameterLimit : 10000
}));
app.use(bodyParser.urlencoded({
  limit:  '50mb',
  extended: false,
  parameterLimit : 10000
}));
app.use(bodyParser.json({
  limit:  '50mb',
  parameterLimit : 10000
}));

app.get('/', function (req, res) {
	res.send("Loaded");
});

var stripe = require("stripe")(key);

// Using Express
app.post("/webhook", function(req, res) {
	// Retrieve the request's body and parse it as JSON
	// var event_json = JSON.parse(request.body);
	var event_json = req.body;
    // console.log(req.body, JSON.parse(req.body));
    console.log(event_json);

	// Verify the event by fetching it from Stripe
	stripe.events.retrieve(event_json.id, function(err, event) {
      console.log(err, event);
      if(event != undefined){
        io.emit('event', event);
        // io.emit(event.type, event);
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
	});
});



// TODO: use something like this for the ftp.
process.on('uncaughtException', function (err) {
  // console.error(err.stack);
  console.log("Node NOT Exiting...", err.stack);
  // logger.storeServerError(err);
});

// END TEMP
server.listen(process.env.PORT || 8080);