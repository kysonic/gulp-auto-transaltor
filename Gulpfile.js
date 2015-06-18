var gulp = require('gulp'),
    autoTranslator = require('./');

gulp.task('translate', function () {
    return gulp.src('./examples/source/pascal.page.html')
        .pipe(autoTranslator({
            regexp:/>[\s\S]+?</g,
            cleaner:/(^[>]+|[<\/]+$)/g,
            yandexApiKey:'trnsl.1.1.20150616T094202Z.6687a92aae244d75.fd7510456254dd48f37c0712b685a7a6ae4cce36',
            basic:"en",
            code: "enUS",
            useFileNamePrefix: true,
            codeLimit: 20,
            wordCodeLimit: 3,
            replacement: '{{"#CODE#" | translate}}',
            createNewFile: true,
            path: './examples/languages/',
            useLangFiles: true,
            translate: {
                "ruRU": "ru",
                "enUS": "en"
            }
        }));
});