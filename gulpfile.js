const packageJson = require('./package.json');
const del = require('del');
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const mustache = require('gulp-mustache');

function getLocalConfig() {
  try {
    const config = require('config-yml');
    return config;
  } catch (e) {
    console.warn(e);
  }
}

function getProdConfig() {
  const { SEGMENT_IO } = process.env;
  return { SEGMENT_IO }
}

const env = ['production'].find(v => v === process.env.NODE_ENV) || 'local';
const configSet = env === 'local' ? getLocalConfig() : getProdConfig();
const segmentKey = configSet ? configSet.SEGMENT_IO : null;

if (!segmentKey) {
  console.warn('>> segment io key not found');
}

const paths = {
  output: './dist',
  templates: './src/scenes/**/*.mustache',
  partials: './src/partials/**/*.mustache',
  scripts: './src/scenes/**/*.js',
  data: ['./src/scenes/**/*.json', './src/scenes/**/*.tsv'],
  public: './src/public/**/*'
};

function clean() {
  return del(['dist']);
}

function templates() {
  return gulp
    .src(paths.templates)
    .pipe(mustache({ version: packageJson.version, segmentKey }, { extension: '.html' }))
    .pipe(gulp.dest(paths.output));
}

function scripts() {
  return gulp.src(paths.scripts).pipe(gulp.dest(paths.output));
}

function data() {
  return gulp.src(paths.data).pipe(gulp.dest(paths.output));
}

function public() {
  return gulp.src(paths.public).pipe(gulp.dest(paths.output));
}

function serve(done) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('>> development mode');
    browserSync.init({
      server: {
        baseDir: paths.output
      },
      port: 8080,
      open: false,
      ui: false
    });
    gulp.watch([paths.templates, paths.partials], templates).on('change', browserSync.reload);
    gulp.watch(paths.scripts, scripts).on('change', browserSync.reload);
    gulp.watch(paths.data, data).on('change', browserSync.reload);
    gulp.watch(paths.public, public).on('change', browserSync.reload);
  } else {
    console.log('>> production mode');
    done();
  }
}

gulp.task('default', gulp.series(clean, templates, scripts, data, public, serve));
