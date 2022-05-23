const gulp = require('gulp');
const notify = require('gulp-notify');  // エラー通知
const plumber = require('gulp-plumber'); // エラー時のタスク停止防止
const debug = require('gulp-debug'); // ログ表示
const filter = require('gulp-filter'); // ファイルフィルター
const cached = require('gulp-cached'); // ファイルキャッシュ
const gulpif = require('gulp-if'); // 条件分岐
const data = require('gulp-data'); // データオブジェクトの作成

const pug = require('gulp-pug'); // Pug
//const htmlbeautify = require('gulp-html-beautify'); // HTML整形
const pugInheritance = require('@unisharp/gulp-pug-inheritance'); // 親子関係を解決

const path = require('path');

const paths = {
  pug: {
    src: 'src/pug/**/*.pug', // コンパイル対象
    dest: 'public/' // 出力先
  }
}

let isWatching = false; // watchタスクを動かしているか

/**
 * pugタスク
 */
function pugCompile() {
  return gulp.src(paths.pug.src)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(gulpif(isWatching, cached('pug'))) // watchタスク時にファイルをキャッシュさせる
    .pipe(gulpif(isWatching, pugInheritance(paths.pug.src))) // 親子関係を解決
    .pipe(filter(function (file) { // _から始まるファイルを除外
      return !/\/_/.test(file.path) && !/^_/.test(file.relative);
    }))
    .pipe(data(file => { // データオブジェクトの作成
      return {
        hierarchy: path.relative(file.relative, '.').replace(/\.\.$/, '') || './' // 相対階層
      }
    }))
    .pipe(pug())
    /*.pipe(htmlbeautify({
      eol: '\n',
      indent_size: 2,
      indent_char: ' ',
      indent_with_tabs: false,
      end_with_newline: true,
      preserve_newlines: true,
      max_preserve_newlines: 2,
      indent_inner_html: true,
      brace_style: 'collapse',
      indent_scripts: 'normal',
      wrap_line_length: 0,
      wrap_attributes: 'auto'
    }))*/
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(debug({title: 'pug dest:'}));
}

/**
 * キャッシュ
 */
function pugCache(){
  return gulp.src(paths.pug.src)
    .pipe(cached('pug'))
    .pipe(debug({title: 'pug cached:'}));
}

/**
 * watchタスクで実行する関数
 */
function watch() {
  isWatching = true;
  return gulp.watch(paths.pug.src, gulp.series(pugCompile))
}

exports.pug = pugCompile; // pugタスク
exports.watch = gulp.series(pugCache, watch); // watchタスク
exports.default = gulp.series(pugCompile); // defaultタスク
