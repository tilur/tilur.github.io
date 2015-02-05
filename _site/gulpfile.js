var gulp         = require('gulp'),
    shell        = require('gulp-shell'),
    sass         = require('gulp-sass'),
    rename       = require('gulp-rename'),
    minifycss    = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify');

gulp.task('styles', function() {
  return gulp.src('css/uts.scss')
    .pipe(sass({ style: 'compressed', }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('css'));
});

gulp.task('watch', function() {
    gulp.watch('css/uts.scss', ['styles']);
});
