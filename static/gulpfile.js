var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var clean = require('gulp-clean');
var convertEncoding = require('gulp-convert-encoding');

var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var gutil = require('gulp-util');
var spritesmith = require('gulp.spritesmith-multi');
var clean = require('gulp-clean');
var notify = require('gulp-notify');
var spritesmash = require('gulp-spritesmash');
var buffer = require('vinyl-buffer');

var paths = {};
paths.spritesSorce = 'scss/sprites_source/**/*.png';
paths.sprites = 'scss/sprites/';
paths.cssTemplate = 'css.hbs';
paths.css = '.';

var sprites1xOnly = [];


gulp.task('cleanSprites', function() {
    return gulp.src(paths.sprites, {read: false})
        .pipe(clean());
});

gulp.task('sprites', ['cleanSprites'], function() {
    return gulp.src(paths.spritesSorce)
        .pipe(spritesmith({
            spritesmith: function(options, sprite, icons) {
                options.imgName = sprite + '.png';
                options.imgPath = paths.sprites + options.imgName;

                if (sprites1xOnly.indexOf(sprite) === -1) {
                    options.retinaImgName = sprite + '_2x.png';
                    options.retinaSrcFilter = '**/*_2x.png';
                    options.retinaImgPath = paths.sprites + options.retinaImgName;
                }

                options.padding = 2;
                options.cssName = '_' + sprite + '.scss';
                options.cssTemplate = paths.cssTemplate;
                options.cssSpritesheetName = sprite;
                options.cssHandlebarsHelpers = {
                    strip1x: function(str) {
                        return str ? str.replace(/_1x$/, '') : '';
                    }
                };

                gutil.log('sprite: ' + sprite + ' - DONE');
            }
        }))
        .on('error', function(err) {
            notify().write(err);
        })
        .pipe(buffer())
        .pipe(spritesmash({hashFunction: 'MD5'}))
        .pipe(gulp.dest(paths.sprites));
});

gulp.task('scss', function() {
    gulp.src('scss/**/*.{scss,sass}')
        .pipe(sass({
            linefeed: 'lf',
            errLogToConsole: true,
            //outputStyle: 'compressed'
        }).on('error', function(err) {
            return notify().write(err);
        }))
        .pipe(autoprefixer({
            browsers: [
                'last 5 versions',
                'Android >= 2.3',
                'OperaMini > 1',
                'iOS >= 6',
                'ExplorerMobile > 1'
            ],
            cascade: false,
            remove: false
        }))
        .pipe(gulp.dest(paths.css));
});

gulp.task('watch', function() {
    gulp.watch('scss/**/*.{scss,sass}', ['scss']);
});


gulp.task('default', ['sprites'], function() {
    gulp.start('scss');
});

