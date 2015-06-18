# gulp-auto-transaltor

Supposing you have a project in which you haven't thought about internalization before this moment. And you need to make it right now! Well, you are in right place. Gulp auto translator (GAT) created to help resolve same issues. It let you to translate your project quickly and inexpensively. Let's begin.

### Quick start

First you should install gulp, of course if you don't have one yet. 

```
  npm instal gulp -g
```

Second you need to install gulp-auto-translator and how you already guessed:

```
  npm instal gulp-auto-translator 
```

Now we have all to start first translation. You need to create gulpfile.js in root directory of your project and create new task:

```
gulp.task('translate', function () {
    return gulp.src('./examples/source/pascal.page.html')
        .pipe(autoTranslator({
            regexp:/>[\s\S]+?</g, // Regular Expression for finding needed words
            cleaner:/(^[>]+|[<\/]+$)/g, // Cleaning  "> <" symbols after finding
            yandexApiKey:'trnsl.x.x.xxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxx', // Yandex Translate API KEY
            basic:"en", // A language of words in your project files. 
            code: "enUS", // Which language will be used to create code for your language files.
            useFileNamePrefix: true, // Use prefix which will be added to code. This prefix will be created for name of current file.
            codeLimit: 20, // Max length of your code
            wordCodeLimit: 3, // Max word count in your language code
            replacement: '{{"#CODE#" | translate}}', // Replacement, this thing will replace all of found phrases by regexp to this string (This is example of replacement for angular)
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
Execute (in your root folder):

```
gulp translate
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

### More words about options

Okay! Let's talk about options more detailed. Gulp Auto Translator has a four group of options: 

  - Regular Expression Group
  - Code Group
  - Translation Group
  - Miscellaneous

### Regular Expression

This group contains next parameters:

- regexp - It's common regular expression, which will search for you words of your project for a translation. For instance, if i want to find any phrase concluded into tag (innerHTML), i need to add something like: />[\s\S]+?<\//g
- cleaner - After finding my phrase will be looks like "> My cool phrase </", of course i should clean it. How i can do it? Very simple! With help of "cleaner" option. In my case i will write: /(^[>]+|[<\/]+$)/g

### Code 

This group contains next parameters:

- code (no default) - it's language from which wil  on, which located in "translate" option... So we will be have a translation - "Blog", next GAT will make from this code - BLOG. Perhaps this code will be need you for replacement later, also it is needed for creation of language files.
- wordCodeLimit (default - 3) - supposing we will have next phrase "It is my blog", when GAT will be create code for the phrase it will be spliting the phrase on words: "It", "is", "my", "blog", and after it takes only three of them, and will join the words in "ITISMYBLOG" code. 
- codeLimit (default - 20) - Also your code after joining will be too much long, for instance: "WITHREPRESENTATIONWICHNEEDYOU". For this case we have "codeLimit" option. It will cut your long code word.
- useFileNamePrefix (default - false) - If you have a concerns about that your code may repeat in some case, when your phrases will be a different, you can add to the code special prefix, which will be crated from name of current file name. For example if your current file called "global.html", then your prefix will be: "_GLOBAL", so your full code may be like this: "WITHYOU_GLOBAL".


