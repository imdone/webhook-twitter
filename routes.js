const validateSignature = require('webhook-validate');
const Twitter = require('twitter');
const _ = require('lodash');
const Task = require('imdone-core/lib/task');

var routes = function(app) {
  var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });
  
  app.get("/", function(req, res) {
    res.send("<h1>REST API</h1><p>Oh, hi! There's not much to see here - view the code instead</p><footer id=\"gWidget\"></footer><script src=\"https://widget.glitch.me/widget.min.js\"></script>");
    console.log("Received GET");
  });
  
  app.post('/', function(req, res) {
    // TODO: Figure out how to gain access to the glitch api and track TODOs in glitch

    validateSignature(req, function(valid) {
      if (!valid) return res.status(403);
      var taskNow = new Task(req.body.taskNow);
      var list = taskNow.list;
      var text =  taskNow.getText({stripMeta: true, stripDates: true});
      var status = `${list}: ${text} (via @imdoneio)`;

      client.post('statuses/update', {status: status})
        .then(function (tweet) {
          console.log("Tweet sent:", tweet);
          res.status(200).json(taskNow);
        })
        .catch(function (error) {
          console.error(error);
          res.status(200).json(taskNow);
        });        
    });
  });

};
 
module.exports = routes;