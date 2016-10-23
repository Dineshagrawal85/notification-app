var gulp = require('gulp');
//var minifyCSS = require('gulp-minify-css');
var concat = require('gulp-concat');
var gulpcssnano=require('gulp-cssnano');
var ngmin = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var inject = require('gulp-inject');
var rename = require('gulp-rename');
var minifyHtml = require('gulp-minify-html');
var combiner = require('stream-combiner2');
var meta ={cssPath:'public/assets/css/',jsPath:'public/assets/js/','angularPath':'public/assets/angular/','htmlPath':'public/templates/'}
var version = require('./package.json').version
var versionString = '?v='+version
var css_paths = {
                  all:[
                    meta.cssPath+'font-awesome.min.css',
                    meta.cssPath+'font-awesome.css',
                    meta.cssPath+'bootstrap.min.css',
                    meta.cssPath+'bootstrap-theme.min.css',
                    meta.cssPath+'cloud-admin.css',
                    meta.cssPath+'nocout.css',
                    meta.cssPath+'default.css',
                    meta.cssPath+'responsive.css',
                    meta.cssPath+'nocout_size.css',
                    meta.cssPath+'responsive_new.css'
                    //meta.cssPath+'toaster.min.css'
                  ]
                }

var js_path = {
              all :[
                meta.jsPath + 'jquery-2.2.4.js',
                meta.jsPath + 'jquery-migrate-1.3.0.min.js',
                meta.jsPath + 'angular_js.min.js',
                meta.jsPath + 'toaster.min.js',
                meta.jsPath + 'angular-animate.js',
                meta.jsPath + 'bootstrap.min.js',
                meta.jsPath + 'jquery.slimscroll.min.js',
                meta.jsPath + 'slimScrollHorizontal.min.js',
                meta.jsPath + 'jquery.easypiechart.min.js',
                meta.jsPath + 'jquery.sparkline.min.js',
                meta.jsPath + 'angular-cookies.min.js',
                meta.jsPath + 'angular-local-storage.min.js',
                meta.jsPath + 'angular-notification-icons.min.js',
                meta.jsPath + 'socket.io.js',
                meta.jsPath + 'angular-ui-router.min.js',
                meta.jsPath + 'underscore-min.js'
              ]
}

var html_path = {
              all :[
                meta.htmlPath +'home.html',
                meta.htmlPath + 'login.html',
                meta.htmlPath + 'signup.html',
              ]
}
                
var angular_path = {
            all:[
            meta.angularPath+'clickoutside.directive.js',
            meta.angularPath+'chat.js',
            meta.angularPath+'login_app.js'
            ]
}

gulp.task('minify-css', function() {
  var combined = combiner.obj([
  gulp.src(css_paths.all)
    .pipe(concat('external_css.css')) 
    .pipe(gulpcssnano())
    .pipe(gulp.dest('public/assets/min_css'))
    ]);

  // any errors in the above streams will get caught
  // by this listener, instead of being thrown:
  combined.on('error', console.error.bind(console));

  return combined;
    
});

gulp.task('minify-js', function() {
  var combined = combiner.obj([
        gulp.src(js_path.all)
       .pipe(concat('external_js.js'))
       .pipe(ngmin())
       .pipe(uglify({mangle: false}))
       .pipe(gulp.dest('public/assets/min_js'))
       ]);

  // any errors in the above streams will get caught
  // by this listener, instead of being thrown:
  combined.on('error', console.error.bind(console));

  return combined;
});

gulp.task('minify-angular', function() {
  var combined = combiner.obj([
        gulp.src(angular_path.all)
       .pipe(concat('angular_files.js'))
       .pipe(ngmin())
       .pipe(uglify({mangle: false}))
       .pipe(gulp.dest('public/assets/min_js'))
       ]);

  // any errors in the above streams will get caught
  // by this listener, instead of being thrown:
  combined.on('error', console.error.bind(console));

  return combined;
});

gulp.task('inject',['rename','rename-all','minify-css','minify-js','minify-angular'],function(){
  gulp.src('./public/index.ejs')
  .pipe(inject(gulp.src('./public/assets/min_css/external_css.css', {read: false}), {starttag: '<!-- inject:external_css:css -->',relative:true,addSuffix:versionString}))
  .pipe(inject(gulp.src('./public/assets/min_js/external_js.js', {read: false}), {starttag: '<!-- inject:external_js:js -->',relative:true,addSuffix:versionString}))
  .pipe(inject(gulp.src('./public/assets/min_js/angular_files.js', {relative:true}),{starttag: '<!-- inject:angular_js:js -->',relative:true,addSuffix:versionString}))
  .pipe(gulp.dest('public'));
})

gulp.task('rename',function(){
  gulp.src("./public/index.ejs")
  .pipe(rename("index-copy.ejs"))
  .pipe(gulp.dest("public")); // ./dist/main/text/ciao/goodbye.md 
})

gulp.task('rename-all',function(){
  gulp.src(html_path.all)
  .pipe(rename({suffix: "-copy"}))
  .pipe(gulp.dest("public/templates"));
})

gulp.task('minify-html',['inject','minify-all-html'], function() {
  return gulp.src('public/index.ejs')
  .pipe(minifyHtml({empty: false}))
  .pipe(gulp.dest('public')) 
});

gulp.task('minify-all-html', function() {
  return gulp.src(html_path.all)
  .pipe(minifyHtml({empty: false}))
  .pipe(gulp.dest('public/templates')) 
});


gulp.task('restore-backup',['restore-templates'],function(){
  gulp.src("./public/index-copy.ejs")
  .pipe(rename("index.ejs"))
  .pipe(gulp.dest("public")); // ./dist/main/text/ciao/goodbye.md 
})

gulp.task('restore-templates',function(){
  gulp.src("./public/templates/home-copy.html")
  .pipe(rename("home.html"))
  .pipe(gulp.dest("public/templates")); 

  gulp.src("./public/templates/login-copy.html")
  .pipe(rename("login.html"))
  .pipe(gulp.dest("public/templates")); 

  gulp.src("./public/templates/signup-copy.html")
  .pipe(rename("signup.html"))
  .pipe(gulp.dest("public/templates")); 
})

gulp.task('development',['minify-html'])
gulp.task('restore',['restore-backup'])