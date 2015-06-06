'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var gh_pages = require('gulp-gh-pages');
require('gulp-grunt')(gulp); // add all the gruntfile tasks to gulp

// Allows gulp --dev to be run for a more verbose output
var isProduction = true;
var sourceMap = false;

var lint = false;

if(gutil.env.dev === true) {
	sourceMap = true;
	isProduction = false;
}

if(gutil.env.lint === true) {
	lint = true;
}

var basePaths = {
	src: 'app/',
	dest: 'public/',
	tmp: '.tmp/',
	bower: 'app/assets/bower_components/'
};

var baseAssetPaths = {
	src: basePaths.src + 'assets/',
	dest: basePaths.dest + 'assets/',
	tmp: basePaths.tmp + 'assets/',
};

var paths = {
	images: {
		src: baseAssetPaths.src + 'images/',
		dest: baseAssetPaths.dest + 'images/',
		tmp: baseAssetPaths.tmp + 'images/'
	},
	scripts: {
		src: baseAssetPaths.src + 'scripts/',
		dest: baseAssetPaths.dest + 'scripts/',
		tmp: baseAssetPaths.tmp + 'scripts/'
	},
	styles: {
		src: baseAssetPaths.src + 'styles/',
		dest: baseAssetPaths.dest + 'styles/',
		tmp: baseAssetPaths.tmp + 'styles/'
	},
	fonts: {
		src: baseAssetPaths.src + 'fonts/',
		dest: baseAssetPaths.dest + 'fonts/',
		tmp: baseAssetPaths.tmp + 'fonts/'
	}
};

var appFiles = {
	styles: paths.styles.src + '**/*.less',
	scripts: isProduction ? paths.scripts.dest + '**/*.js' : paths.scripts.tmp + '**/*.js'
};

gulp.task('clean', function (cb) {
  var rimraf = require('rimraf')
    
    function ccb(){ return rimraf(basePaths.tmp, cb); }
    
    return rimraf(basePaths.dest, ccb);
    
});

gulp.task('lint', function () {
    
    if (!lint) return;
    
    var jshint = require('gulp-jshint');

    return gulp.src(appFiles.scripts)
      .pipe(jshint({multistr:true,camelcase:false}))
      .pipe(jshint.reporter('default'));
});


gulp.task('images', function () {
    var cache = require('gulp-cache'),
        imagemin = require('gulp-imagemin');

    return gulp.src(paths.images.src)
        .pipe(cache(imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(paths.images.dest));
});

gulp.task('fonts', function () {
    return gulp.src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest));
});

gulp.task('misc', function () {
    return gulp.src([
          basePaths.src + '*.{ico,png,txt}',
        ])
        .pipe(gulp.dest(basePaths.dest));
});

gulp.task('less', function () {
    var less = require('gulp-less');
    var autoprefixer = require('gulp-autoprefixer');
    var lessfiles = gulp.src(paths.styles.src + 'less/*.less')
    
    var less_options = {
      paths:[
        paths.styles.src,
        paths.styles.src + 'mixins/',
        basePaths.bower
      ]
    }
    var autoprefixer_options = {
      browsers: ['last 2 versions'],
      cascade: false
    }
    return lessfiles
        .pipe(less(less_options))
        .pipe(autoprefixer(autoprefixer_options))
        .pipe(gulp.dest(paths.styles.tmp));
});

gulp.task('ejsc', function () {
    var ejsccompile = require('./ejsc-compile.js');
    var ejscfiles = gulp.src(paths.scripts.src + '**/*.ejsc')
 
    return ejscfiles
        .pipe(ejsccompile())
        .pipe(gulp.dest(paths.scripts.tmp));
});

gulp.task('copy_html', function () {

    return gulp.src([basePaths.src + '*.html'])
      .pipe(gulp.dest(basePaths.tmp))
});

gulp.task('copy_js', function () {

    return gulp.src([paths.scripts.src + '**/*.js'])
      .pipe(gulp.dest(paths.scripts.tmp))
});

gulp.task('wiredep', [ 'less', 'ejsc', 'copy_html', 'copy_js'], function () {
    var wiredep = require('wiredep').stream;
    var inject = require('gulp-inject');   
     
    var ignorePath = isProduction ? '' : '../app/';
    
    var sources = gulp.src([
      paths.scripts.tmp + '*.js',
      paths.scripts.tmp + 'app/templates/*.js',
      paths.scripts.tmp + 'app/views/*.js'], {read: false });
    var sources_options = {relative : true}

    var sources_top = gulp.src(basePaths.bower + 'modernizr/modernizr.js', {read: false});
    var sources_top_options = {
      relative : true,
      name: 'head',
      ignorePath: ignorePath
    }

    var wiredep_options= {
      exclude:  [ /bootstrap.*\.css$|modernizr/ ], // use less/ move modernizr to top using sources_top inject
      directory: basePaths.bower,
      overrides: {
        'jquery-timing': {main:'jquery-timing.js'}
      },
      ignorePath: ignorePath
    }

    return gulp.src(basePaths.tmp + '*.html')
        .pipe(wiredep(wiredep_options))
        .pipe(inject(sources_top, sources_top_options))
        .pipe(inject(sources, sources_options))
        .pipe(gulp.dest(basePaths.tmp));
});


gulp.task('dohtml', function () {
    
    if (!isProduction) return;
    
    var gulpif = require('gulp-if'),
        uglify = require('gulp-uglify'),
        minify = require('gulp-minify-css'),
        
        useref = require('gulp-useref'),
        assets = useref.assets(),
        
        uglifyIfJs = gulpif('*.js', uglify()),
        minifyIfCss = gulpif('*.css', minify());

    return gulp.src(basePaths.tmp + '*.html')
        .pipe(assets)
        .pipe(uglifyIfJs)
        .pipe(minifyIfCss)
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest(basePaths.dest));
});

gulp.task('posthtml', ['dohtml'], function () {
  return gulp.start('lint');
});

gulp.task('html', ['wiredep'], function () {
    return gulp.start('posthtml');
});

gulp.task('connect', function () {
    var connect = require('connect');
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    
    var serveApp = isProduction ? gutil.noop() : serveStatic(basePaths.src);
    var serveWhich= isProduction ? basePaths.dest : basePaths.tmp;
    
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(serveStatic(serveWhich))
        .use(serveApp)
        .use(serveIndex(serveWhich));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function() {
            console.log('Started connect web server on http://localhost:9000.');
        });
});

gulp.task('serve', ['connect'], function () {
    var livereload = require('gulp-livereload');

    livereload.listen();

    require('opn')('http://localhost:9000');
    
    var listen_globs = isProduction ? [
        basePaths.dest + '*.html',
        paths.styles.dest + '*.css',
        paths.scripts.dest + '**/*.js',
        paths.images.dest + '**/*'
      ] : [       
        basePaths.tmp + '*.html',
        paths.styles.tmp + '*.css',
        paths.scripts.tmp + '**/*.js',
        paths.images.src + '**/*'
    ]

    var delay_livereload = function(timeout) {
      return function(vinyl) {
        setTimeout(function() { livereload.changed(vinyl) }, timeout)
      };
    }

    gulp.watch(listen_globs).on('change', delay_livereload(500));
    
    gulp.watch([
        'bower.json',
        basePaths.src + '*.html',
        paths.styles.src + '*.css',
        paths.scripts.src + '**/*.js',
        paths.scripts.src + '**/*.ejsc',
        paths.styles.src + '**/*.less'
    ], ['html']);
  
    gulp.watch([paths.images.src + '**/*'], ['images']);
});

gulp.task('build', ['clean'], function () {
    return gulp.start('dobuild')
});
    
gulp.task('dobuild', ['images', 'fonts', 'misc'], function () {
    return gulp.start('html')
});

gulp.task('deploy', function() {
  return gulp.src(basePaths.dest + '**/*')
    .pipe(gh_pages());
});

gulp.task('svg', function() {
  var glyphiconssvg = require('./glyphicons-svg.js');
  return gulp.src(basePaths.bower + 'bootstrap/dist/fonts/*.svg')
    .pipe(glyphiconssvg())
    .pipe(gulp.dest(paths.images.tmp));
});

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});
