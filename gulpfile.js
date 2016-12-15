/* eslint comma-dangle: 0 */

// General
const argv = require("yargs").argv;
const browserSync = require("browser-sync").create();
const chalk = require("chalk");
const gulp = require("gulp");
const gutil = require("gulp-util");
const sourcemaps = require("gulp-sourcemaps");
const watch = require("gulp-watch");

// SASS
const autoprefixer = require("gulp-autoprefixer");
const filter = require("gulp-filter");
const sass = require("gulp-sass");

// PUG
const pug = require("gulp-pug");

// JS
const babelify = require("babelify"); // eslint-disable-line no-unused-vars
const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const rename = require("gulp-rename");
const source = require("vinyl-source-stream");
const uglify = require("gulp-uglify");
const watchify = require("watchify");


const dist = !(argv.dist || argv.d);

const sO = { notify: true, snippetOptions: { rule: { match: /<\/body>/i, fn(snippet, match) { return snippet + match; } } } };
let server = argv.proxy || argv.p || false;
let browserSyncClientUrl = argv.nodes || server || "./";
browserSyncClientUrl = `//${browserSyncClientUrl.toString().replace(/\/node_modules/, "").replace(/\/$/, "").replace(/^http(s)?:\/\//, "")}/node_modules/`;
if (server) { if ( typeof server === "boolean" ) { server = "localhost"; browserSyncClientUrl = "//localhost/node_modules/"; } sO.proxy = { "target": server }; } else { sO.server = "./"; browserSyncClientUrl = "./node_modules/"; }
sO.snippetOptions.rule.fn = function() { return `<link rel='stylesheet' href='${browserSyncClientUrl}browser-sync-client-transition/browser-sync-client.min.css' /><script async src='${browserSyncClientUrl}browser-sync-client-transition/browser-sync-client.min.js'></script>`; };

gulp.task("sass", () => {
  return gulp.src("./prod/sass/**/*.sass")
    .pipe(sourcemaps.init())
    .pipe(sass({ sourcemap: true, style: "compact" }))
    .pipe(autoprefixer("last 1 version", "> 1%", "ie 8", "ie 7"))
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./css"))
    .pipe(filter(["**/*.css"]))
    .pipe(browserSync.stream());
});

gulp.task("pug", () => {
  return gulp.src("./*.pug")
    .pipe(
      pug({
        "pretty": !dist,
      })
    )
    .pipe(gulp.dest("./"))
    .pipe(
      browserSync.stream()
    );
});

function mapError(err) {
  if (err.fileName) {
    gutil.log(`${chalk.red(err.name)}: ${chalk.yellow(err.fileName.replace(`${__dirname}/src/js/`, ""))}: Line ${chalk.magenta(err.lineNumber)} & Column ${chalk.magenta(err.columnNumber || err.column)}: ${chalk.blue(err.description)}`);
  } else {
    // Browserify error..
    gutil.log(`${chalk.red(err.name)}: ${chalk.yellow(err.message)}`);
  }
}

function scripts(toWatch, path) {
  const filename = path.split("/").pop();
  let bundler = browserify(path, {
    basedir: __dirname,
    debug: true,
    cache: {}, // required for watchify
    packageCache: {}, // required for watchify
    fullPaths: toWatch, // required to be true only for watchify
    plugin: [watchify],
  });

  if (toWatch) {
    bundler = watchify(bundler);
  }

  bundler.transform("babelify", { presets: ["es2015", "react"] });

  const rebundle = function() {
    const stream = bundler.bundle();
    return stream
      .on("error", mapError)
      .pipe(source(filename))
      .pipe(buffer())
      .pipe(rename({
        suffix: ".min",
      }))
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(uglify())
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest("./js"))
      .pipe(browserSync.stream());
  };


  bundler.on("update", rebundle);
  return rebundle();
}


gulp.task("browserSync", () => {
  browserSync.init(sO);
});

gulp.task("watch", ["browserSync", "sass"], () => {
  watch("./prod/sass/**/*.sass", () => { gulp.start("sass"); });
  watch("./*.pug", () => { gulp.start("pug"); });
  watch(["./*.html", "./*.php"], () => { browserSync.reload(); });
});

gulp.task("watch-scripts", () => {
  scripts(true, "./prod/js/app.js");
  scripts(true, "./prod/js/script.js");
});

gulp.task("default", ["browserSync", "sass", "pug", "watch-scripts", "watch"]);
