//npm i gulp gulp-sass gulp-concat gulp-uglifyjs gulp-cssnano gulp-rename gulp-autoprefixer --save-dev
var gulp = require('gulp'), //Подключаем Gulp
	sass = require('gulp-sass'), //Подключаем Sass пакет
	concat = require('gulp-concat'), //Подключаем gulp-concat (для конкатенации/склейки файлов)
	uglify = require('gulp-uglifyjs'), //Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano = require('gulp-cssnano'), //Подключаем пакет для минификации CSS
	rename = require('gulp-rename'), //Подключаем библиотеку для переименования файлов
	autoprefixer = require('gulp-autoprefixer'), //Подключаем библиотеку для автоматического добавления префиксов
	browserSync = require('browser-sync'), // Подключаем Browser Sync
	del = require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin = require('gulp-imagemin'),
	imageminJpegRecompress = require('imagemin-jpeg-recompress'),
	pngquant = require('imagemin-pngquant'),
	cache = require('gulp-cache');

/**
 * Таск для сборки ядра стилий
 */
gulp.task('scssStyleCore', function () {
	return gulp.src('src/scss/styleCore.scss')
		.pipe(sass({uotputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(autoprefixer([
				'last 15 version',
				'ie 10'],
			{cascade: true}))
		.pipe(gulp.dest('dist/css'))
});
/**
 * Таск для сборки ядра стилий
 */
gulp.task('scssStyle', function () {
	return gulp.src('src/scss/style.scss')
		.pipe(sass({uotputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(autoprefixer([
				'last 15 version',
				'ie 10'],
			{cascade: true}))
		.pipe(gulp.dest('dist/css'))
});
/**
 * Минификация стилий
 */
gulp.task('minCss', ['scssStyleCore', 'scssStyle'], function () {
	return gulp.src(['dist/css/style.css', 'dist/css/styleCore.css'])
		.pipe(cssnano()) //Сжимаем
		.pipe(rename({suffix: '.min'})) //Добавляем суффикс .min
		.pipe(gulp.dest('dist/css')) //Выгружаем в папку
		.pipe(browserSync.reload({stream: true})); // Обновляем CSS на странице при изменении
});
/**
 * Псевдо минификация стилий
 */
gulp.task('fakeMinCss', ['scssStyleCore', 'scssStyle'], function () {
	return gulp.src(['dist/css/style.css', 'dist/css/styleCore.css'])
		.pipe(rename({suffix: '.min'})) //Добавляем суффикс .min
		.pipe(gulp.dest('dist/css')) //Выгружаем в папку
		.pipe(browserSync.reload({stream: true})); // Обновляем CSS на странице при изменении
});
/**
 * Таск для минификации скриптов
 */
gulp.task('minJs', function () {
	var js_core = gulp.src([
		'vendor/jQuery-2.2.4/jquery-2.2.4.min.js',
		'vendor/jumpnet.ru/ScriptLoad/dist/js/ScriptLoad.min.js',
		'src/js/script.js'
	])
		.pipe(uglify()) //Сжимаем JS файл
		.pipe(concat('script.min.js')) // Собираем в кучу в новом файле
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.reload({stream: true}));
	var js_modules = gulp.src('src/js/modules/**/*.js')
		.pipe(rename({suffix: '.min'})) //Добавляем суффикс .min
		.pipe(gulp.dest('dist/js/modules'))
		.pipe(browserSync.reload({stream: true}));
	return js_core, js_modules;
});
/**
 * Таск для переноса скриптов из src в dist
 */
gulp.task('fakeMinJs', function () {
	var js_core = gulp.src([
		'vendor/jQuery-2.2.4/jquery-2.2.4.min.js',
		'vendor/jumpnet.ru/ScriptLoad/dist/js/ScriptLoad.min.js',
		'vendor/p5/p5.min.js',
		'src/js/modules/Cell.js',
		'src/js/modules/Snake.js',
		'src/js/modules/Apple.js',
		'src/js/script.js'
	])
		.pipe(concat('script.min.js')) // Собираем в кучу в новом файле
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.reload({stream: true}));
	var js_modules = gulp.src('src/js/modules/**/*.js')
		.pipe(rename({suffix: '.min'})) //Добавляем суффикс .min
		.pipe(gulp.dest('dist/js/modules'))
		.pipe(browserSync.reload({stream: true}));
	return js_core, js_modules;
});
/**
 * Таск для browser-sync
 */
gulp.task('browser-sync', function () { // Создаем таск browser-sync
	browserSync({ // Выполняем browser Sync
		server: { // Определяем параметры сервера
			baseDir: './' // Директория для сервера - src
		},
		open: true,
		notify: false, // Отключаем уведомления
	});
});
/**
 * Таск для оптимизации озображений PNG, JPEG, GIF и SVG
 */
gulp.task('images', function () {
	return gulp.src('src/img/**/*')
		.pipe(cache(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imageminJpegRecompress({
				loops: 5,
				min: 65,
				max: 70,
				quality: 'medium'
			}),
			imagemin.svgo(),
			imagemin.optipng({optimizationLevel: 3}),
			pngquant({quality: '65-70', speed: 5})
		], {
			verbose: true
		})))
		.pipe(gulp.dest('dist/img'))
		.pipe(browserSync.reload({stream: true}));
});
/**
 * Очистка кеша
 */
gulp.task('clearCache', function (done) {
	return cache.clearAll(done);
});


/**
 * Таск для dev
 */
gulp.task('dev', ['browser-sync', 'fakeMinCss', 'fakeMinJs', 'images'], function () {
	gulp.watch('src/scss/**/*.*', ['fakeMinCss']); // Наблюдение за sass файлами
	gulp.watch(
		[
			'./index.html',
			'./index.php',
			'./index.twig',
			'template/**/*.html',
			'template/**/*.php',
			'template/**/*.twig'
		], browserSync.reload); // Наблюдение за HTML
	gulp.watch('src/js/**/*.js', ['fakeMinJs']); // Наблюдение за JS
	gulp.watch('src/img/**/*', ['images']); // Наблюдение за JS
	// Наблюдение за другими типами файлов
});


/**
 * Удаляем папку dist перед сборкой
 */
gulp.task('deleteDirectory', function () {
	return del.sync('dist');
});
/**
 * Выполняем сборку как следует
 */
gulp.task('build', ['deleteDirectory', 'minCss', 'minJs', 'images']);
