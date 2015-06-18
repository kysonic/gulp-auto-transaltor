# gulp-auto-transaltor

Supposing you have a project in which you haven't thought about internalization before this moment. And you need to make it right now! Well, you are in right place. Gulp auto translate created to help resolve same issues. It let you to translate your project quickly and inexpensively. Let's begin.

### Quick start

First you should install gulp, of course if you don't have one yet. 

```
  npm instal gulp -g
```

Second you need to install gulp-auto-translator and how you already guess:

```
  npm instal gulp-auto-translator 
```

Now we have all to start first translation. You need to create gulpfile.js in root directory of your project and create new task:

```
gulp.task('translate', function () {
    return gulp.src('./src/app/advanced/forms/conference/*.tpl')
        .pipe(autoTranslator({
            regexp:/(>)(([a-zA-Z0-9\(\)\/:\-\.\,\s ]|<br>)+?)(<\/)/g,
            cleaner:/(^[>"']+|[<\"\/a href]+$)/g,
            yandexApiKey:'xxxxxxxxxxxxxxxxx',
            basic:"ru",
            code: "enUS",
            useFileNamePrefix: true,
            codeLimit: 20,
            wordCodeLimit: 3,
            replacement: '{{"#CODE#" | translate}}',
            path: './public/languages/',
            useLangFiles: true,
            translate: {
                "ruRU": "ru",
                "enUS": "en",
                "esES": "es"
            }
        }));
});
```

