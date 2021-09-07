const projectFolder = "public";
const srcFolder = "src";

const path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/css/",
    js: projectFolder + "/js/",
    img: projectFolder + "/img/",
    fonts: projectFolder + "/fonts/",
  },
  src: {
    html: srcFolder + "/*.html",
    css: srcFolder + "/scss/style.scss",
    js: srcFolder + "/js/script.js",
    img: srcFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: srcFolder + "/fonts/*.ttf",
  },
  watch: {
    html: srcFolder + "/**/*.html",
    css: srcFolder + "/scss/**/*.scss",
    js: srcFolder + "/js/**/*.js",
    img: srcFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: "./" + projectFolder + "/",
};

const { src, dest } = require("gulp"),
  gulp = require("gulp"),
  browserSync = require("browser-sync").create(),
  del = require("del"),
  sass = require("gulp-sass")(require("sass")),
  sourcemaps = require("gulp-sourcemaps"),
  autoprefixer = require("gulp-autoprefixer"),
  gcmq = require("gulp-group-css-media-queries"),
  cleanCSS = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default,
  ttf2woff = require("gulp-ttf2woff"),
  ttf2woff2 = require("gulp-ttf2woff2");

function browserSyncReloadPage() {
  browserSync.init({
    server: {
      baseDir: "./" + projectFolder + "/",
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html)
    .pipe(dest(path.build.html))
    .pipe(browserSync.stream());
}

function buildStyles() {
  return (
    src(path.src.css)
      // .pipe(sourcemaps.init())
      .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
      .pipe(gcmq())
      .pipe(autoprefixer({ overrideBrowserslist: ["last 5 versions"] }))
      // .pipe(sourcemaps.write("./maps"))
      .pipe(dest(path.build.css))
      .pipe(cleanCSS({ compatibility: "ie8" }))
      .pipe(rename({ extname: ".min.css" }))
      .pipe(dest(path.build.css))
      .pipe(browserSync.stream())
  );
}

function js() {
  return (
    src(path.src.js)
      // .pipe(sourcemaps.init())
      .pipe(dest(path.build.js))
      .pipe(uglify())
      .pipe(rename({ extname: ".min.js" }))
      // .pipe(sourcemaps.write("./maps"))
      .pipe(dest(path.build.js))
      .pipe(browserSync.stream())
  );
}

function images() {
  return src(path.src.img)
    .pipe(dest(path.build.img))
    .pipe(browserSync.stream());
}

function fonts() {
  src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
  return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], buildStyles);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

function deletePublicFolder() {
  return del(path.clean);
}

const build = gulp.series(
  deletePublicFolder,
  gulp.parallel(js, buildStyles, html, images, fonts)
);
const watch = gulp.parallel(build, watchFiles, browserSyncReloadPage);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.buildStyles = buildStyles;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
