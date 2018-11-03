let gulp = require('gulp'), //Подключаем Gulp
	uglify = require('gulp-uglifyjs'), //Подключаем gulp-uglifyjs (для сжатия JS)
	rename = require('gulp-rename'), //Подключаем библиотеку для переименования файлов
	del = require('del'); // Подключаем библиотеку для удаления файлов и папок

gulp.task('minJs', function () {
	return gulp.src([
		'src/js/ScriptLoad.js'
	])
		.pipe(uglify()) //Сжимаем JS файл
		.pipe(rename({suffix: '.min'})) //Добавляем суффикс .min
		.pipe(gulp.dest('dist/js'));
});
/**
 * Таск для переноса скриптов из src в dist
 */
gulp.task('fakeMinJs', function () {
	return gulp.src([
		'src/js/ScriptLoad.js'
	])
		.pipe(rename({suffix: '.min'})) //Добавляем суффикс .min
		.pipe(gulp.dest('dist/js'));
});

/**
 * Таск для dev
 */
gulp.task('dev', ['fakeMinJs'], function () {
	gulp.watch('src/js/**/*.js', ['fakeMinJs']); // Наблюдение за JS
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
gulp.task('build', ['minJs']);
