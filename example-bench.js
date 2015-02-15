var crossbow    = require("./plugins/stream");
//var through     = require("through2");
var fs          = require("vinyl-fs");
var rimraf      = require("rimraf").sync;
var outpath     = "./_bench-out";

rimraf(outpath);

console.time("bench");
fs.src([
    "_bench/*.html"
])
    .pipe(crossbow({config: {cwd: "_bench"}}))
    .pipe(fs.dest(outpath)).on("end", function () {
        console.timeEnd("bench");
    });


