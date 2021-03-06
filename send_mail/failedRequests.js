var fs = require('fs'),
    path = require('path'),
    Handlebars = require('handlebars'),
    sendMail = require('./sendMail.js');


// Helper to generate list
Handlebars.registerHelper('list', function(items, options) {
  var out = "<ol>";

  for(var i=0, l=items.length; i<l; i++) {
    out += "<li><b>Title:</b> " + options.fn(items[i].title);
    out += "<br><b>Author/s:</b> " + options.fn(items[i].author); 
    out += "<br><b>Year:</b> " + options.fn(items[i].year);
    if(items[i].error) out += "<br><i>Reason for failure:</i> " + items[i].error;
    out += "<br><br></li>";
  }

  return out + "</ol>";
});

// Open template file
var source = fs.readFileSync(path.join(__dirname, 'failed-requests-list.hbs'), 'utf8');
// Create email generator
var template = Handlebars.compile(source);

var options = (email, locals) => {
  return {
    from: 'noreply@sr-accelerator.com',
    to: email,
    subject: 'SRA Journal Request Results',
    html: template(locals)
  };
};

module.exports = async (mailgunapi, user, failedRequests, numRequests, successfulRequests, callback) => {
  console.log("Failed Requests: ")
  console.log(failedRequests)
  let mailPromise = await sendMail(mailgunapi, options(user.email, { "failedRequests": failedRequests, "successfulRequests": successfulRequests, "numRequests": numRequests, "numSuccess": successfulRequests.length }));
  return mailPromise;
}