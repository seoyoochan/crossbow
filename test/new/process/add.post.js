var fs        = require("fs");
var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Adding a post", function() {

    it("Add 1 post & set date from front-matter", function() {

        var site = crossbow.builder();

        var index = site.add({
            type: "post",
            key: "src/_posts/test.md",
            content: "---\ndate: 2013-11-13\n---\n{{post.date}}"
        });

        assert.equal(index.get("key"),      "src/_posts/test.md");
        assert.equal(index.get("url"),      "/blog/test.html");
        assert.equal(index.get("filepath"), "blog/test.html");

        assert.isTrue(index.get("date") instanceof Date);
        assert.equal(index.get("timestamp"), 1384300800000);
    });
    it("Add 1 post & set date when NO front-matter or in filename", function() {

        var site = crossbow.builder();

        var stat    = fs.statSync("./test/fixtures/about.html");
        var content = fs.readFileSync("./test/fixtures/about.html", "utf8");

        var index = site.add({
            type:    "post",
            key:     "src/_posts/test.md",
            content: content,
            stat:    stat
        });

        assert.equal(index.get("key"),      "src/_posts/test.md");
        assert.equal(index.get("url"),      "/blog/test.html");
        assert.equal(index.get("filepath"), "blog/test.html");

        assert.isTrue(index.get("date") instanceof Date);
    });
    it("Add 1 post & set date when in URL", function() {

        var site = crossbow.builder({
            config: {
                cwd: "src",
                urlFormat: {
                    "type:post": "/blog/:filename"
                }
            }
        });

        var index = site.add({
            type: "post",
            key: "src/_posts/javascript/2013-11-14-test.md",
            content: "{{post.date}}"
        });

        assert.equal(index.get("key"),      "src/_posts/javascript/2013-11-14-test.md");
        assert.equal(index.get("url"),      "/blog/test.html");
    });
    it("Add 1 post with :filepath", function() {

        var site = crossbow.builder({
            config: {
                cwd: "src",
                urlFormat: {
                    "type:post": "/:filepath"
                }
            }
        });

        var index = site.add({
            type: "post",
            key: "src/_posts/javascript/whatevers.md",
            content: "{{post.date}}"
        });

        assert.equal(index.get("key"),      "src/_posts/javascript/whatevers.md");
        assert.equal(index.get("url"),      "/javascript/whatevers.html");
    });
    it("Add 1 post with :filename", function() {

        var site = crossbow.builder({
            config: {
                cwd: "src",
                prettyUrls: true,
                urlFormat: {
                    "type:post": "/:filename"
                }
            }
        });

        var index = site.add({
            type: "post",
            key: "src/_posts/javascript/whatevers.md",
            content: "{{post.date}}"
        });

        assert.equal(index.get("key"),      "src/_posts/javascript/whatevers.md");
        assert.equal(index.get("url"),      "/whatevers");
        assert.equal(index.get("filepath"), "whatevers/index.html");
    });
    it("Add 1 post & compile", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "src"
            }
        });

        var index = site.add({type: "post", key: "src/_posts/test.md", content: ":{{post.title}}"});

        assert.equal(index.get("key"),      "src/_posts/test.md");
        assert.equal(index.get("url"),      "/blog/test.html");
        assert.equal(index.get("filepath"), "blog/test.html");

        assert.equal(site.cache.byType("post").size, 1);

        site.freeze();

        site.compile({
            item: index,
            data: {
                site: {
                    title: "browsersync"
                },
                itemTitle: "Crossbow"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.get("compiled"), "<p>:Test</p>");
                done();
            }
        });
    });
    it("Add 1 post with custom url format", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "src",
                urlFormat: {
                    "type:post": "/blog/:filename"
                }
            }
        });

        var index = site.add({type: "post", key: "src/_posts/test.md", content: ":{{post.title}}"});

        assert.equal(index.get("key"),      "src/_posts/test.md");
        assert.equal(index.get("url"),      "/blog/test.html");
        assert.equal(index.get("filepath"), "blog/test.html");

        assert.equal(site.cache.byType("post").size, 1);

        site.freeze();

        site.compile({
            item: index,
            data: {
                site: {
                    title: "browsersync"
                },
                itemTitle: "Crossbow"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.get("compiled"), "<p>:Test</p>");
                done();
            }
        });
    });
    it("Orders posts by created data", function(done) {
        var site = crossbow.builder({
            config: {
                cwd: "src"
            }
        });

        var index = site.add({type: "page", key: "src/index.html", content: "Post list:\n<ul>\n{{#posts}}    <li>{{this.title}}</li>\n{{/posts}}</ul>"});

        var post1 = site.add({type: "post", key: "src/_posts/2014-10-10-test1.md", content: "Post 1"});
        var post2 = site.add({type: "post", key: "src/_posts/2014-10-11-test2.md", content: "Post 2"});
        var post3 = site.add({type: "post", key: "src/_posts/2014-10-09-test3.md", content: "Post 3"});
        var post4 = site.add({type: "post", key: "src/_posts/2014-10-12-test4.md", content: "Post 4"});

        assert.equal(post1.get("key"),      "src/_posts/2014-10-10-test1.md");
        assert.equal(post1.get("url"),      "/blog/test1.html");
        assert.equal(post1.get("filepath"), "blog/test1.html");

        assert.equal(post2.get("key"),      "src/_posts/2014-10-11-test2.md");
        assert.equal(post2.get("url"),      "/blog/test2.html");
        assert.equal(post2.get("filepath"), "blog/test2.html");

        assert.equal(post3.get("key"),      "src/_posts/2014-10-09-test3.md");
        assert.equal(post3.get("url"),      "/blog/test3.html");
        assert.equal(post3.get("filepath"), "blog/test3.html");

        assert.equal(post4.get("key"),      "src/_posts/2014-10-12-test4.md");
        assert.equal(post4.get("url"),      "/blog/test4.html");
        assert.equal(post4.get("filepath"), "blog/test4.html");

        site.freeze();

        assert.equal(site.frozen["posts"][0].url, "/blog/test4.html");
        assert.equal(site.frozen["posts"][1].url, "/blog/test2.html");
        assert.equal(site.frozen["posts"][2].url, "/blog/test1.html");
        assert.equal(site.frozen["posts"][3].url, "/blog/test3.html");

        site.compile({
            item: index,
            data: {
                site: {
                    title: "browsersync"
                },
                itemTitle: "Crossbow"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                var compiled = out.get("compiled");
                assert.include(compiled, "<li>Test4.html</li>");
                assert.include(compiled, "<li>Test2.html</li>");
                assert.include(compiled, "<li>Test1.html</li>");
                assert.include(compiled, "<li>Test3.html</li>");
                done();
            }
        });
    });
});