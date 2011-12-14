  
var host = require('./host.js').ctl({ secret: 5 });


exports.route = function (server) {


  // Direct function (Returns this for GET/POST/PUT/DELETE)
  host.bind("/", function (page) {
    page.write("hello, the default number is " + page.defaults.secret);
  });


  // Object (key specifies which request it works for)
  host.bind("/:q", {
    'get': function (page) {
      page.write("You are looking for page /" + page.param("q", "Default."));
    },
    'post': function (page) {
      page.write("Posting some secret informations?");
    },
  });


  // Bind everything. Serve the page!
  host.serve(server);

}
