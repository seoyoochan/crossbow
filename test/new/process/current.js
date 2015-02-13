var assert    = require("chai").assert;
var crossbow = require("../../../index");

describe("Current helper", function() {

    it("Outputs a match", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"
            },
            data: {
                urls: ["/index.html", "/about.html"]
            }
        });

        var item = site.addPage("index.html", ":{{#current '/index.html'}}Should{{/current}}: {{page.url}}");

        site.compile({
            item: item,
            cb: function (err, out) {
                assert.include(out.get("compiled"), ':Should:'); // jshint ignore:line
                done();
            }
        });
    });
    it("Does not output when not match", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"
            },
            data: {
                urls: ["/index.html", "/about.html"]
            }
        });

        var item = site.addPage("index.html", ":{{#current '/about.html'}}Should{{/current}}: {{page.url}}");

        site.compile({
            item: item,
            cb: function (err, out) {
                assert.include(out.get("compiled"), '::'); // jshint ignore:line
                done();
            }
        });
    });
});