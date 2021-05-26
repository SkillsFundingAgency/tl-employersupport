/// <binding BeforeBuild='dev' />

var gulp = require('gulp');

require('./gulp/tasks/default');

gulp.task('default', gulp.series('assets', 'sass', 'js', 'customjs', 'jsfiles', 'templates', 'settings', 
    (done) => {
        done();
    }));
