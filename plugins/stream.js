var crossbow  = require("../index");
var yaml      = require("../lib/yaml");
var utils     = crossbow.utils;
var through2  = require("through2");
var gutil     = require("gulp-util");
var File      = gutil.File;
var path      = require("path");
var Immutable = require("immutable");
var Q         = require("q");
var _         = require("lodash");
var errors    = require("../lib/errors").fails;

/**
 * @returns {Function}
 */
module.exports = function (opts) {

    opts        = opts        || {};
    opts.config = opts.config || {};

    var files = {};
    var stream;

    if (!opts.config.errorHandler) {
        opts.config.errorHandler = function (err, compiler) {
            compiler.logger.error(compiler.getErrorString(err));
        };
    }

    var site = opts.builder || crossbow.builder(opts);

    return through2.obj(function (file, enc, cb) {

        stream = this;

        if (file._contents) {
            var contents        = file._contents.toString();
            var relFilePath     = file.path.replace(file.cwd, "");
            relFilePath         = relFilePath.replace(/^\//, "");
            files[relFilePath]  = {stat: file.stat, content: contents};
        }
        cb();

    }, function (cb) {

        var queue    = [];

        Object.keys(files).forEach(function (key) {

            queue.push(site.cache.add(site.add({
                type:    site.getType(key),
                key:     key,
                content: files[key].content,
                stat:    files[key].stat
            })));
        });

        if (!queue.length) {
            return;
        } else {

            if (queue.some(function (item) {
                return item.get("type") === "partial";
            })) {
                site.logger.info("Partials changed, re-compiling all items");
                site.freeze();
                site.compileAll({
                    cb: function (err, out) {
                        if (err) {
                            return console.log("ERROR");
                        }
                        out.forEach(function (item) {
                            stream.push(new File({
                                cwd:  "./",
                                base: "./",
                                path: item.get("filepath"),
                                contents: new Buffer(item.get("compiled"))
                            }));
                        });
                        cb();
                    }
                });
            } else {
                var timestart = new Date().getTime();
                site.freeze();
                site.compileMany({
                    collection: queue,
                    cb: function (err, out) {
                        if (err) {
                            return console.log("ERROR");
                        }
                        site.logger.info("Compiling {yellow:%s} item%s took {yellow:%sms}",
                            queue.length,
                            queue.length > 1 ? "s" : "",
                            new Date().getTime() - timestart
                        );
                        out.forEach(function (item) {
                            stream.push(new File({
                                cwd:  "./",
                                base: "./",
                                path: item.get("filepath"),
                                contents: new Buffer(item.get("compiled"))
                            }));
                        });

                        cb();
                    }
                });
            }
        }
    });
};
