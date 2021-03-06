import gulp from 'gulp'
import pug from 'gulp-pug'
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import sourcemaps from 'gulp-sourcemaps'
import sass from 'gulp-sass'
import sassCompiler from 'node-sass'
import clean from 'gulp-clean'
import replace from 'gulp-replace'
import browserSyncMod from 'browser-sync'

const browserSync = browserSyncMod.create()
const S = gulp.series
const P = gulp.parallel
const rsss_url = (process.env['BASE_URL'] || '') + '/rsss'

const root = 'src_ui'

const re_copy = [`${root}/**/*`, `!${root}/**/*.pug`, `!${root}/**/*.js`, `!${root}/**/*.sass`]
const re_js = [`${root}/**/*.js`]
const re_views = [`${root}/**/*.pug`]
const re_css = [`${root}/sass/*.sass`]
const br_app = `${root}/app.js`

sass.compiler = sassCompiler

async function serve() {
    browserSync.init({
        server: { baseDir: './dist' },
        ui: { port: 8081 },
        port: 8080,
        notify: false,
        open: false
    })

    gulp.watch(re_copy, S('copy', 'reload'))
    gulp.watch(re_js, S('js', 'reload'))
    gulp.watch(re_views, S('views', 'reload'))
    gulp.watch(re_css, S('css', 'reload'))
}

gulp.task('js', (cb) =>
    browserify(br_app)
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/'))
        .on('end', cb)
        .on('error', (err) => {
            console.log(err.stack)
            cb()
        })
)

gulp.task('views', (cb) =>
    gulp.src(re_views)
        .pipe(pug({ pretty: true }))
        .pipe(replace('\$RSSS_URL', rsss_url))
        .pipe(gulp.dest('dist/'))
        .on('end', cb)
)

gulp.task('css', (cb) =>
    gulp.src(re_css)
        .pipe(sourcemaps.init())
        .pipe(sass({ includePaths: ["./node_modules/"] }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/'))
        .on('error', sass.logError)
        .on('end', cb)
)

gulp.task('copy', async () => gulp.src(re_copy).pipe(gulp.dest('dist/')))
gulp.task('clean', (cb) => gulp.src('dist', { read: false, allowEmpty: true }).pipe(clean()).on('end', cb))
gulp.task('build', S('clean', P('copy', 'js', 'views', 'css')))
gulp.task('serve', S('build', serve))
gulp.task('reload', async () => browserSync.reload())
gulp.task('default', S('serve'))
