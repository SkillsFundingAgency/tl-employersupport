﻿const { src } = require('gulp');

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify'),
    rmLines = require('gulp-rm-lines'),
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

gulp.task('employerInterestjs', () => {
    return src([
        'node_modules/crypto-js/crypto-js.js',
        'Frontend/src/js/hmac.js',
        'Frontend/src/js/employerInterest.js'
    ])
    .pipe(rmLines({
        'filters': [
            /^\/\/# sourceMappingURL=/g,
        ]
    }))
        .pipe(concat('employerInterest.js'))
        .pipe(gulp.dest(paths.dist.Assets));
});

gulp.task('findProviderjs', () => {
    return src([
        'node_modules/crypto-js/crypto-js.js',
        'node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.js',
        'Frontend/src/js/hmac.js',
        'Frontend/src/js/findProvider.js',
        'Frontend/src/js/findProviderDownload.js',
        'Frontend/src/js/locationAutocomplete.js'
    ])
    .pipe(rmLines({
        'filters': [
            /^\/\/# sourceMappingURL=/g,
        ]
    }))
        .pipe(concat('findProvider.js'))
        .pipe(gulp.dest(paths.dist.Assets));
});

gulp.task('findProviderTilejs', () => {
    return src([
        'node_modules/crypto-js/crypto-js.js',
        'node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.js',
        'Frontend/src/js/hmac.js',
        'Frontend/src/js/findProviderTile.js',
        'Frontend/src/js/findProviderDownload.js',
        'Frontend/src/js/locationAutocomplete.js'
    ])
    .pipe(rmLines({
        'filters': [
            /^\/\/# sourceMappingURL=/g,
        ]
      }))
        .pipe(concat('findProviderTile.js'))
        .pipe(gulp.dest(paths.dist.Assets));
});

gulp.task('findProviderTileHomejs', () => {
    return src([
        'node_modules/crypto-js/crypto-js.js',
        'node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.js',
        'Frontend/src/js/hmac.js',
        'Frontend/src/js/findProviderTileHome.js',
        'Frontend/src/js/findProviderDownload.js',
        'Frontend/src/js/locationAutocomplete.js'
    ])
        .pipe(rmLines({
            'filters': [
                /^\/\/# sourceMappingURL=/g,
            ]
        }))
        .pipe(concat('findProviderTileHome.js'))
        .pipe(gulp.dest(paths.dist.Assets));
});

gulp.task('findProviderDownloadjs', () => {
    return src([
        'node_modules/crypto-js/crypto-js.js',
        'node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.js',
        'Frontend/src/js/hmac.js',
        'Frontend/src/js/findProviderDownload.js'
    ])
    .pipe(rmLines({
        'filters': [
            /^\/\/# sourceMappingURL=/g,
        ]
      }))
        .pipe(concat('findProviderDownload.js'))
        .pipe(gulp.dest(paths.dist.Assets));
});

gulp.task('jsfiles', () => {
    return src([
        'Frontend/src/js/*.js',
        '!Frontend/src/js/custom.js',
        '!Frontend/src/js/employerInterest.js',
        '!Frontend/src/js/findProvider.js',
        '!Frontend/src/js/findProviderDownload.js',
        '!Frontend/src/js/findProviderTile.js',
        '!Frontend/src/js/findProviderTileHome.js',
        '!Frontend/src/js/hmac.js',
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