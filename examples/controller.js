  
var defaults = { secret: 5 };
var host = require('ctl').init(defaults);


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


  // Rendering templates
  host.bind("/template", function (page) {
    if (page.param("show") == "yes") {
      // Secret is now 6, not 5
      page.render("template.html", { secret: 6 });
    } else {
      // Secret is defaulted to 5.
      page.render("template.html");
    }
  })


  // Bind everything. Serve the page!
  host.serve(server);

}
