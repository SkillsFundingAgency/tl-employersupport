const { src } = require('gulp');

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify'),
    sass = require('gulp-sass'),
    wait = require('gulp-wait'),
    watch = require('gulp-watch');

const paths = require('../paths.json');
const sassOptions = require('../sassOptions.js');

gulp.task('assets', () => {
    return src([
        'node_modules/govuk-frontend/govuk/assets/fonts/*',
        'node_modules/govuk-frontend/govuk/assets/images/*',
        'node_modules/jquery-ui-dist/jquery-ui.min.css',
        (paths.src.Assets)
    ])
        .pipe(gulp.dest(paths.dist.Assets));
});

gulp.task('js', () => {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/govuk-frontend/govuk/all.js',
    ])
        .pipe(concat('govuk.js'))
        .pipe(gulp.dest(paths.dist.JS));
});

gulp.task('customjs', () => {
    return src([
        'Frontend/src/js/custom.js',
        'node_modules/moment/moment.js',
        'node_modules/jquery-ui-dist/jquery-ui.min.js',
    ])
        .pipe(concat('custom.js'))
        .pipe(gulp.dest(paths.dist.Assets));
});

gulp.task('jsfiles', () => {
    return src([
        'Frontend/src/js/*.js',
        '!Frontend/src/js/custom.js',
    ])
        .pipe(gulp.dest(paths.dist.Assets));
});

gulp.task('sass', () => {
        return src(paths.src.SCSS)
            .pipe(wait(200))
            .pipe(sass(sassOptions))
            .pipe(gulp.dest(paths.dist.CSS));
});

gulp.task('templates', () => {
    return src([
        (paths.src.Templates)
    ])
        .pipe(gulp.dest(paths.dist.Templates));
});