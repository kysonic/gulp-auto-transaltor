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
    return gulp.src('./examples/source/pascal.page.html')
        .pipe(autoTranslator({
            regexp:/>[\s\S]+?</g, // Regular Expression for finding needed words
            cleaner:/(^[>]+|[<\/]+$)/g, // Clean > < symbols after finding
            yandexApiKey:'trnsl.x.x.xxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxx', // Yandex Translate API KEY
            basic:"en", // Language of words in your document. 
            code: "enUS", // Which language will be use to create code for yours language files.
            useFileNamePrefix: true, // Use prefix which will be added to code. This prefix creating of name of current file.
            codeLimit: 20, // Max length of our code
            wordCodeLimit: 3, // Max word count in your language code
            replacement: '{{"#CODE#" | translate}}', // Replacement, this thing will replace all of finded phrase by regexp to this string (This is example of replacment for angular)
            createNewFile: true, // Create new File which will be called fileName_translated.html for instance...
            path: './examples/languages/', // Path to folder where would be your language files.
            useLangFiles: true, // create language files?
            translate: { // translate directions
                "ruRU": "ru", // Will be created ./examples/languages/ruRU.json, translate direction en(basic)-ru
                "enUS": "en"  // Will be created ./examples/languages/enUS.json, translate direction en(basic)-en
            }
        }));
});
```

The Source file has contained this before changes: 

```
  <nav class="sidebar-nav">
        <a class="sidebar-nav-item" href="/">Blog</a>
        <a class="sidebar-nav-item" href="/about/">About</a>
        <a class="sidebar-nav-item" href="/talks/">Talks</a>
        <a class="sidebar-nav-item" href="https://github.com/PascalPrecht">GitHub</a>
        <a class="sidebar-nav-item" href="https://twitter.com/PascalPrecht">Twitter</a>
    </nav>
```

The new file will be contain a next:

```
<nav class="sidebar-nav">
        <a class="sidebar-nav-item" href="/">{{"BLOG_PASCAL" | translate}}</a>
        <a class="sidebar-nav-item" href="/about/">{{"ABOUT_PASCAL" | translate}}</a>
        <a class="sidebar-nav-item" href="/talks/">{{"TALKS_PASCAL" | translate}}</a>
        <a class="sidebar-nav-item" href="https://github.com/PascalPrecht">{{"GITHUB_PASCAL" | translate}}</a>
        <a class="sidebar-nav-item" href="https://twitter.com/PascalPrecht">{{"TWITTER_PASCAL" | translate}}</a>
 </nav>
```

And in ./examples/languages folder now exist new file, which called ruRU.json with a next content:

```
	"BLOG_PASCAL": "Блог",
	"ABOUT_PASCAL": "О",
	"TALKS_PASCAL": "Переговоры",
	"GITHUB_PASCAL": "На github",
	"TWITTER_PASCAL": "Твиттер"
```
