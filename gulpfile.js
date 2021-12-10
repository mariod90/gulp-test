/** Packages needed for tasks */
//var gulp = require("gulp");
const { src, dest, task, watch, series, parallel } = require("gulp");
var rename = require("gulp-rename");
var sass = require("gulp-sass");
var uglify = require("gulp-uglify");
var autoprefixer = require("gulp-autoprefixer");
var sourcemaps = require("gulp-sourcemaps");
var browserify = require("browserify");
var babelify = require("babelify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var browserSync = require("browser-sync").create();
var plumber = require("gulp-plumber");
var notify = require("gulp-notify");
//var reload = browserSync.reload;

/** Variables with routes to files and folders to be used */
var mapURL = "./";

var styleSRC = "./src/scss/style.scss";
var styleURL = "./dist/css/";

var jsSRC = "script.js";
var jsFOLDER = "./src/js/";
var jsURL = "./dist/js/";

var jsFILES = [jsSRC];

var imgSRC = "./src/img/**/*";
var imgURL = "./dist/img/";

var fontsSRC = "./src/fonts/**/*";
var fontsURL = "./dist/fonts/";

var htmlSRC = "./src/**/*.html";
var htmlURL = "./dist/";

var styleWatch = "./src/scss/**/*.scss";
var jsWatch = "./src/js/**/*.js";
var htmlWatch = "./src/**/*.html";
var imgWatch = "./src/img/**/*.*";
var fontsWatch = "./src/fonts/**/*.*";

function browser_sync() {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    }
  });
}

function reload(done) {
  browserSync.reload();
  done();
}

// Compiling scss files in css minify to dist css folder
function css(done) {
  src([styleSRC])
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        errLogToConsole: true,
        outputStyle: "compressed"
      })
    )
    .on("error", console.error.bind(console))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 2 versions", "> 5%", "Firefox ESR"]
      })
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write(mapURL))
    .pipe(dest(styleURL))
    .pipe(browserSync.stream());
  done();
}

// Compiling js ES6 files in vanillajs minify to dist js folder
function js(done) {
  jsFILES.map(function(entry) {
    return browserify({
      entries: [jsFOLDER + entry]
    })
      .transform(babelify, { presets: ["@babel/preset-env"] })
      .bundle()
      .pipe(source(entry))
      .pipe(rename({ extname: ".min.js" }))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(uglify())
      .pipe(sourcemaps.write(mapURL))
      .pipe(dest(jsURL))
      .pipe(browserSync.stream());
  });
  done();
}

function images() {
  return triggerPlumber(imgSRC, imgURL);
}

function fonts() {
  return triggerPlumber(fontsSRC, fontsURL);
}

function html() {
  return triggerPlumber(htmlSRC, htmlURL);
}

function triggerPlumber(src_file, dest_file) {
  return src(src_file)
    .pipe(plumber())
    .pipe(dest(dest_file));
}

function watch_files() {
  watch(styleWatch, series(css, reload));
  watch(jsWatch, series(js, reload));
  watch(htmlWatch, series(html, reload));
  watch(imgWatch, series(images, reload));
  watch(fontsWatch, series(fonts, reload));
  src(jsURL + "script.min.js").pipe(
    notify({ message: "Gulp is Watching, Happy Coding!" })
  );
}

task("css", css);
task("js", js);
task("images", images);
task("fonts", fonts);
task("html", html);
// Default task, run only: gulp
task("default", parallel(css, js, images, fonts, html));
// Task for watching and compiling automatly changes in scss and js files
task("watch", parallel(browser_sync, watch_files));
