var gulp = require('gulp'),
    Exceler = require('./exceler.js'),
    autoTranslator = require('./');
// Task for pascal.page.html (English)
gulp.task('pascal', function () {
    return gulp.src('./examples/source/pascal.page.html')
        .pipe(autoTranslator({
            yandexApiKey:'trnsl.1.1.20150616T094202Z.6687a92aae244d75.fd7510456254dd48f37c0712b685a7a6ae4cce36',
            fromLanguage: "en",
            replacement: '{{"#CODE#" | translate}}',
            fileNamePrefix: false,
            path: './examples/languages_pascal/',
            createNewFile: true,
            translate: {
                "ruRU": "ru",
                "enUS": "en"
            }
        }
    ));
});
// Task for admin.html (Russian)
gulp.task('admin', function () {
    return gulp.src('./examples/source/admin.html')
        .pipe(autoTranslator({
                yandexApiKey:'trnsl.1.1.20150616T094202Z.6687a92aae244d75.fd7510456254dd48f37c0712b685a7a6ae4cce36',
                fromLanguage: "ru",
                replacement: '{{"#CODE#" | translate}}',
                fileNamePrefix: true,
                path: './examples/languages_admin/',
                createNewFile: true,
                translate: {
                    "ruRU": "ru",
                    "enUS": "en",
                    "esES": "es",
                    "itIT": "it"
                }
            }
        ));
});

gulp.task('assembler', function () {
    return gulp.src('./examples/languages_pascal/*.json')
        .pipe(Exceler.assembler({
            path: './examples/excel/assemble.json'
        }));
});

gulp.task('excel', function () {
    return gulp.src('./examples/excel/assemble.json')
        .pipe(Exceler.excel({
                path: './examples/excel/lang.xlsx'
            }
        ));
});

gulp.task('parse', function () {
    return gulp.src('./examples/excel/lang.xlsx')
        .pipe(Exceler.parse());
});