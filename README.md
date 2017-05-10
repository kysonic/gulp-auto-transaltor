# gulp-auto-transaltor 

**Current version: 0.0.10**

Supposing you have a project in which you didn't think about internalization before this moment. And you have to make it right now! Well, you are in right place. Gulp auto translator (GAT) was created to help with same issues. It allows you to translate your project quickly and inexpensively. Let's begin.

### Quick start

First you have to install gulp, of course if you don't have one yet. 

```javascript
  npm install gulp --save-dev
```

Second you need to install gulp-auto-translator and how you are already guessed:

```javascript
  npm install gulp-auto-translator --save-dev
```

Now we have all to start first translation. You need to create gulpfile.js in root directory of your project and create new task:

```javascript
gulp.task('translate', function () {
    return gulp.src('./examples/source/pascal.page.html')
        .pipe(autoTranslator({
            yandexApiKey:'trnsl.x.x.xxxxxxxxxxxxxxxxxx.xxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Yandex API Key
            fromLanguage: "en", // Language of your project
            replacement: '{{"#CODE#" | translate}}', // Replacement
            fileNamePrefix: false,  // I won't use file name prefix.
            path: './examples/languages_pascal/', // Path to a directory in which will locate language files.
            createNewFile: true, // true - create copy of current file, false - overwrite it
            translate: {
                "ruRU": "ru", // GAT will create new file (./examples/language_pascal/ruRU.json) with a translation by en-ru direction
                "enUS": "en" // GAT will create new file (./examples/language_pascal/enUS.json)
            }
        }
    ));
});
```
Execute:

```javascript
gulp translate
```

The Source file contained this before changes: 

```html
  <nav class="sidebar-nav">
        <a class="sidebar-nav-item" href="/">Blog</a>
        <a class="sidebar-nav-item" href="/about/">About</a>
        <a class="sidebar-nav-item" href="/talks/">Talks</a>
        <a class="sidebar-nav-item" href="https://github.com/PascalPrecht">GitHub</a>
        <a class="sidebar-nav-item" href="https://twitter.com/PascalPrecht">Twitter</a>
    </nav>
```

The new file will contain a following:

```html
<nav class="sidebar-nav">
        <a class="sidebar-nav-item" href="/">{{"BLOG" | translate}}</a>
        <a class="sidebar-nav-item" href="/about/">{{"ABOUT" | translate}}</a>
        <a class="sidebar-nav-item" href="/talks/">{{"TALKS" | translate}}</a>
        <a class="sidebar-nav-item" href="https://github.com/PascalPrecht">{{"GITHUB" | translate}}</a>
        <a class="sidebar-nav-item" href="https://twitter.com/PascalPrecht">{{"TWITTER" | translate}}</a>
 </nav>
```

And in ./examples/languages_pascal/ folder now exist new file, which called "ruRU.json" with a next content:

```
	"BLOG_PASCAL": "Блог",
	"ABOUT_PASCAL": "О",
	"TALKS_PASCAL": "Переговоры",
	"GITHUB_PASCAL": "На github",
	"TWITTER_PASCAL": "Твиттер"
```

### More words about options

Okay! Let's talk about options more detailed. Gulp Auto Translator has a three group of options: 

  - Code Group
  - Translation Group
  - Miscellaneous

### Code 

The group contains next parameters:

- fileNamePrefix (default - false) - If you have a concerns about that your code may repeat in some case, when your phrases will be a different, you can add to the code special prefix, which will be created from name of current file name. For example if your current file called "global.html", then your prefix will be: "_GLOBAL", so your full code may be like this: "WITHYOU_GLOBAL".

### Translation

The group contains following parameters:

- fromLanguage (no default) - It's first point of a translate direction, for example if all of found phrases by regexp will be on English, you should to point 'en' in "basic" option. Thus when GAT will find phrase and want to translate it for example on Russian - the translate direction in this case will be "en-ru". 
- translate (no default) - it is translate matrix. For instance
	```
		"ruRU":"ru"
	```
	where "ruRU" it is name of language file
	and "ru" - direction of translate, "en-ru", because fromLanguage is "en".
- path (no default) - Path to directory in which will be placed language files. 
- createNewFile (default - false) - If this options will be exposed like "true" - GAT will create new file with same content, but all of found phrases will be substituted by "replacment" string.
- replacment (no default) - This string will substitute all found phrases in your document. Also the replacement string may contain special codes like:
     - #CODE# - the finished replacement will contain code of the phrase. For example if replacement was like: 
         "{{'#CODE#' | translate}}" then in translated file we will see "{{'WITHYOU_GLOBAL' | translate}}" on place of found phrase.
     - #TRANSLATE# - put on found phrase place a translation of it. For example if we have "#TRANSLATE#" replacement string then in translated file we will have for instance "Переведенная строка". 
     
### Miscellaneous

Currently we will use only Yandex Translate Api, because it is free. Maybe later i will add google api for wealthy guys. Okay! In this group we have following options:

- yandexApiKey (no default) - key for yandex translate api. Get it [by link ](https://tech.yandex.com/keys/get/?service=trnsl)

###Languages

Currently we have a strong support for next languages:

en - English, ru - Russian, es - Spanish, de - German, fr - French, it - Italian, pl - Polish. 

About another languages - i suppose it would work, but we have no test yet. If you can help us with something language missed in this list, we would be glad to take it.

### Additional features

From now GAT can create a excel language file from json languages files. For instance: supposing you have two files in folder ./languages/ - it is ruRu.json and enUS.json. If you execute following task:

```
gulp.task('assembler', function () {
    return gulp.src('./languages/*.json')
        .pipe(Exceler.assembler({
            path: './excel/assemble.json'
        }));
});
```

Then in ./excel folder got to appear a assamble.json file, which needed to creating a xlsx language file. Next you have to execute following task: 

```
gulp.task('excel', function () {
    return gulp.src('./excel/assemble.json')
        .pipe(Exceler.excel({
                path: './excel/lang.xlsx'
            }
        ));
});
```

After you get a lang.xlsx file with one sheet in which will be added next content:

```
  |   code   |     ruRU     |     enUS     |
  |   MAIN   |      Мой     |      Main    |
  |   DOG    |     Собака   |     Dog      |
  ...... ...... ..... ..... ..... ..... ....
```

Well, i think it may be a easy and comfortable way to check out your translation.

### Conclusion

So how i think this plugin will be unpopular i won't post here "Contributing guide"... If you, by some reasons, will visit this page and you will not understand "how it works" you always can ask your question here:

- skype: soooyc
- by email: soooyc@gmail.com

Thanks! 



