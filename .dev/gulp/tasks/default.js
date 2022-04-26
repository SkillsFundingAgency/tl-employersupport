const { src } = require('gulp');

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify'),
    sass = require('gulp-sass')(require('sass'));
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


gulp.task('settings', () => {
    return src([
        (paths.src.Settings)
    ])
        .pipe(gulp.dest(paths.dist.Settings));
});

gulp.task('js', () => {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/govuk-frontend/govuk/all.js',
        'node_modules/jquery-ui-dist/jquery-ui.min.js',

    ])
        .pipe(concat('govuk.js'))
        .pipe(gulp.dest(paths.dist.JS));
});

gulp.task('customjs', () => {
    return src([
        'Frontend/src/js/custom.js',
        'node_modules/moment/moment.js',
    ])
        .pipe(concat('custom.js'))
        .pipe(gulp.dest(paths.dist.Assets));
});

gulp.task('findProviderjs', () => {
    return src([
        'node_modules/crypto-js/core.js',
        'node_modules//crypto-js/enc-base64.js',
        'node_modules//crypto-js/sha256.js',
        'node_modules//crypto-js/hmac.js',
        'node_modules//crypto-js/hmac-sha256.js',
        'node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.js',
        'Frontend/src/js/findProvider.js',
        'Frontend/src/js/locationAutocomplete.js'
])
        .pipe(concat('findProvider.js'))
        .pipe(gulp.dest(paths.dist.Assets));
});

gulp.task('findProviderTilejs', () => {
    return src([
        'node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.js',
        'Frontend/src/js/findProviderTile.js',
        'Frontend/src/js/locationAutocomplete.js'
    ])
        .pipe(concat('findProviderTile.js'))
        .pipe(gulp.dest(paths.dist.Assets));
});

gulp.task('jsfiles', () => {
    return src([
        'Frontend/src/js/*.js',
        '!Frontend/src/js/custom.js',
        '!Frontend/src/js/findProvider.js',
        '!Frontend/src/js/findProviderTile.js',
        'node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.js',
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