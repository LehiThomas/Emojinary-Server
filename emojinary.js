var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	cors = require('cors');
	
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('Mongo DB: ONLINE')
});

var userSchema = mongoose.Schema({
    id: String,
	score: Number,
	regDate: { type: Date, default: Date.now },
	lastActive: Date,
	regid: String
});
var User = mongoose.model('User', userSchema);

var challengeSchema = mongoose.Schema({
	challenger: Number,
	opponent: Number,
	answer: String,
	sendDate: { type: Date, default: Date.now },
	answered: Date,
	status: String,
	emojis: [String],
	tries: Number
})
var Challenge = mongoose.model('Challenge', challengeSchema);

// Answer Challenge
app.post('/answer', function (req, res) {
	Challenge.update({_id: req.body._id},{answered: new Date()},function(err, doc){
			User.update({id: req.body.oppenent},{ $inc: { score: 5 }},function(err, doc){
					res.send(200);
				}
			);
		}
	);
});


// Save Challenge
app.post('/challenge', function (req, res) {
	var challenge = new Challenge(req.body);
	challenge.save(function(err){
		if(!err) res.send(200);
	});
});

app.get('/challenges', function (req, res) {
	Challenge.find({ opponent: req.query.id, answered: { $exists: false }}, function(err, challenges){
		res.send(challenges);
	});
});

// Get User
app.get('/user', function (req, res) {

	User.findOne({id: req.query.id}, function(err, user){
		if(!user){
			
			user = new User();
			user.id = req.query.id;
			//user.regid = req.query.regid;
			user.score = 5;
			console.log(user);
		}
		User.findOneAndUpdate(
			{id: user.id},
			{$set: { lastActive: new Date(), score: user.score}},
			{upsert: true}, 
			function(err, doc){
				res.send(doc);
			}
		);
	})

});

// Get Users
app.get('/users', function (req, res) {
	var ids = req.query.ids.split(",");
	User.find({ id: {$in:ids}}, function(err, user){
		res.send(user);
	});
});

// Save Regid for Notifications
app.post('/setRegid', function (req, res) {	
	User.update({id: req.body.id},{regid: req.body.regid},function(err, doc){
			res.send(200);
		}
	);
});

var server = app.listen(3010, function () {
  var port = server.address().port;
  console.log(port);
});
