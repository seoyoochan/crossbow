var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Doing Highlight includes", function() {

    it("Can highlight an external file", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"
            }
        });

        var item = site.addPage("src/docs/index.html", "{{hl src='_includes/button.html'}}");

        site.compile({
            item: item,
            cb: function (err, out) {
                assert.include(out.get("compiled"), '<code class="html"><span class="hljs-tag">&lt;<span'); // jshint ignore:line
                done();
            }
        });
    });

    it("Add 1 page & compile with includes", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"
            }
        });

        var item = site.addPage("src/docs/index.html", "Highlight: {{{{hl lang=\"js\"}}}}<button>{{showme}}</button>{{{{/hl}}}}");

        site.compile({
            item: item,
            cb: function (err, out) {
                assert.include(out.get("compiled"), '{{showme}}'); // jshint ignore:line
                done();
            }
        });
    });
});