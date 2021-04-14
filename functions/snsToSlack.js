var https = require('https');
var util = require('util');

exports.handler = function (event, context) {
  //console.log('[DEBUG] Received event:', JSON.stringify(event, null, 2));

  var message_object = JSON.parse(event.Records[0].Sns.Message);
  var slack_text = "";
  var valid_code = true;
  try {
    eval(process.env.SLACK_MESSAGE); // Slack message snippet code test
  } catch (e) {
    if (e instanceof Error) {
      valid_code = false;
      slack_text = '*[ERROR]* Problem with Slack message snippet/received event data: ' + e.message;
      console.warn('[ERROR] Problem with Slack message snippet/received event data: ' + e.message);
    }
  } finally {
    if (valid_code) {
      eval("slack_text=" + process.env.SLACK_MESSAGE);
    }
  }

  var postData = {
    "channel": process.env.SLACK_CHANNEL,
    "username": process.env.SLACK_USERNAME,
    "text": slack_text,
    "icon_emoji": process.env.SLACK_EMOJI,
    "mrkdwn": process.env.SLACK_MARKDOWN_ENABLE || "true",
  };

  var options = {
    method: 'POST',
    hostname: process.env.SLACK_HOSTNAME || "hooks.slack.com",
    port: process.env.SLACK_PORT || "443",
    path: process.env.SLACK_WEBHOOK_PATH
  };

  var req = https.request(options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      context.done(null);
    });
  });

  req.on('error', function (e) {
    console.log('[ERROR] Problem with request: ' + e.message);
  });

  req.write(util.format("%j", postData));
  req.end();
};
