var gulp = require('gulp'),
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