'use strict';
var request    = require('request');
var async      = require('async');
var htmlparser = require("htmlparser2");

var util    = require('util');
var fs      = require('fs');
var path    = require('path');
/**
 * Because we use FREE Yandex Translate api,
 * the code of auto translator can be changed sometimes.
 */

// Yandex Translate API String
var YandexApiString = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=%s&lang=%s&text=%s";
/**
 * Translator class
 * @constructor
 */
function Translator() {
    // Basic object, which will be contains translation objects by category
    this.cursor = {};
    // Additional object representing .JSON language files by category
    this.languageCursor = {};
    // Cursor for parser data
    this.parserCursor = [];
    // Content of current file
    this.fileContent = '';
    // Name of current file
    this.fileName = '';
    // Temp of file content
    this.buffer = '';
    // Parser
    this.parser = null;
    // Regular expressions
    this.regexp = {};
    this.regexp.languageAlphabet = {
            "en" : /[A-z]/,
        "ru": /[А-я]/,
        "es": /[a-zA-ZáéíñóúüÁÉÍÑÓÚÜ]/,
        "de": /[a-zA-ZäöüßÄÖÜẞ]/,
        "fr": /[a-zA-ZàâäôéèëêïîçùûüÿæœÀÂÄÔÉÈËÊÏÎŸÇÙÛÜÆŒ]/,
        "it": /[a-zA-ZàèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]/,
        "pl": /[a-pr-uwy-zA-PR-UWY-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/
    }
    this.regexp.allLetters = /\w/;
    this.regexp.codeRegexp = /#CODE#/;
    this.regexp.translateRegexp = /#TRANSLATE#/;
    this.regexp.notLetters = /[\+\-\.\,\!@\#\$\%\^\&\*\(\)\;\\\/\|\<\>\"\']/g;

}
/**
 * Parse html. By default we work with
 * HTML, but in future we are planning
 * create parser for jade.
 * @param callback
 */
Translator.prototype.parse = function(callback){
    var _this = this;
    // Create new parser
    this.parser = new htmlparser.Parser();
    // When parser meets text content (innerHTML or text between two nested tags)
    this.parser.ontext = function(text){
        // Add new item to parser cursor if
        // in the text exists at least one letter of alphabet
        try{var languageAlphabet = _this.regexp.languageAlphabet[_this.options.fromLanguage] || this.regexp.allLetters;}catch(e){console.log(e)}
        if(languageAlphabet.test(text))
            _this.parserCursor.push({text:text,start:this._tokenizer._sectionStart,end:this._tokenizer._index})
    }
    // Handle errors
    this.parser.onerror = function(error) {
        callback(error);
    }
    // Invoke callback when parsing will be finish
    this.parser.onend = function(){callback(null);}
    // Parse complete HTML file (not stream)
    this.parser.parseComplete(this.fileContent);
}
/**
 * Translate found phrases
 * Currently we use Yandex Translate Api, because it is free now.
 * @param callback
 */
Translator.prototype.translate = function(callback){
    // Iterate all of parsed expression asynchronously.
    async.forEach(this.parserCursor,function(item,parserCallback){
        if (!this.options.translate) callback( 'You need to setup translations config. See more details on official plugin page.');
        // Iterate language Keys and translate parsed phrases by them.
        async.each(Object.keys(this.options.translate), function (langKey, langCallback) {
            if(this.options.yandexApiKey) this.yandexTranslate(item,langKey,function(err){
                if(err) langCallback(err);
                langCallback(null);
            });
        }.bind(this), function (err) {
            if(err) parserCallback(err);
            parserCallback(null);
        });
    }.bind(this),function(err){
        if(err) callback(err);
        callback(null);
    }.bind(this));
}
/**
 * Translate by Yandex Api
 * @param item - parser cursor item
 * @param langKey - current lang key, for example enUS, ruRU
 * @param callback - it will be invoked when a translator api will reply.
 */
Translator.prototype.yandexTranslate= function(item,langKey,callback) {
    // Now! Time to translate our match word(s)
    var toLanguage = this.options.translate[langKey];
    this.cursor[langKey] = this.cursor[langKey] || [];
    // Find the translation direction
    var translateDirection = this.options.fromLanguage!=toLanguage ? this.options.fromLanguage+ '-'+toLanguage : false;
    if(translateDirection) {
        // Make string to a request
        var url = util.format(YandexApiString, this.options.yandexApiKey, translateDirection, item.text);
        // Request for the Yandex API
        request(url,function(err,response,body){
            if (err || response.statusCode != 200) {callback(err || response.statusCode)}
            var data = JSON.parse(body);
            // Add cursor item
            this.cursor[langKey].push({original:item.text,translate:data.text,from:this.options.fromLanguage,to:toLanguage,parse:item});
            callback(null);
        }.bind(this));
    }else {
        // If direction of translation for instance
        // en-en then we don't have a need to translate it.
        var translate = [];
        translate.push(item.text);
        this.cursor[langKey].push({original:item.text,translate:translate,from:this.options.fromLanguage,to:toLanguage,parse:item});
        callback(null);
    }
}
/**
 * Replace \ make codes for language files.
 * @param callback
 */
Translator.prototype.replace = function(callback){
    var translateCode = this.getTranslateCode(this.options.fromLanguage);
    this.languageCursor[translateCode] = this.languageCursor[translateCode] || {};
    // First we need to sort array by entries in original content of file.
    // Iterate all of cursor item by fromLanguage code
    var start = 0;
    if(!translateCode) callback('You need to setup translations config. See more details on official plugin page.');
    // Iterate cursor
    this.cursor[translateCode].forEach(function(item) {
        var translate = this.getTranslateCode('en') ? this.getCursorItemByOriginal(this.getTranslateCode('en'),item.original).translate[0] : item.translate[0];
        // Create code
        var code = translate.trim()
            .replace(this.regexp.notLetters, '')
            .split(' ').splice(0, 3).join('')
            .substr(0, 20).toUpperCase();
        if(this.options.fileNamePrefix) code+='_'+this.fileName;
        // Replacement
        if(this.options.replacement) {
            var replacement = null;
            // Define replacement
            if(this.regexp.codeRegexp.test(this.options.replacement)) replacement = this.options.replacement.replace('#CODE#',code);
            if(this.regexp.translateRegexp.test(this.options.replacement)) replacement = this.options.replacement.replace('#TRANSLATE#',code);
            if(!replacement) callback('You should set in your replacement string one of next codes: #CODE#, #TRANSLATE#');
            // Deal with it!
            this.buffer+=this.fileContent.substring(start,item.parse.start)+replacement;
            start = item.parse.end;
        }
        this.language(item,code,translateCode);
    }.bind(this));
    this.buffer+=this.fileContent.substring(start);
    // Final actions
    this.saveLanguageFiles(callback);
    this.saveContent(callback);
    callback(null);
}
/**
 * Create items for language cursor. It is representation of future language files.
 * @param item - cursor item.
 * @param code - it's appropriate for current item language code (like "MYNEWCODE_FILENAME")
 * @param langCode - language code it is code of current language (en,ru,es, etc)
 */
Translator.prototype.language = function(item,code,langCode){
    // Language cursor (it is representation of future language file)
    this.languageCursor[langCode][code] = item.translate[0] || 'Something gone wrong! If you see this message you should checkout your language file.';
    // Set Another translations in language cursor.
    Object.keys(this.options.translate).forEach(function(langKey){
        if(langKey!=langCode) {
            this.languageCursor[langKey] = this.languageCursor[langKey] || {};
            // Because of async translation we should find appropriate item
            // from another language set of cursor

            var aItem = this.getCursorItemByOriginal(langKey,item.original);
            this.languageCursor[langKey][code] =  aItem.translate[0] || 'Something gone wrong! If you see this message you should checkout your language file.';
        }
    }.bind(this));
}
/**
 * Save language files using language cursor
 * @returns {*}
 */
Translator.prototype.saveLanguageFiles = function(callback){
    if(!this.options.path || !fs.existsSync(this.options.path)) callback('You should set path to directory, which will be save all language files. And! This path should exists.');
    // Get All language keys
    Object.keys(this.options.translate).forEach(function(langKey){
        // Generate language file path
        var filePath = this.options.path+langKey+'.json';
        var fileContent = '';
        // Create\open language file
        if(!fs.existsSync(filePath)) {
            fs.openSync(filePath,'w');
            fileContent = fs.readFileSync(filePath);
        }
        else fileContent = fs.readFileSync(filePath);
        fileContent = fileContent.toString('utf-8');
        // Turn it into object to work with it.
        var languageData = {};
        if(!this.isEmptyString(fileContent))
            try{languageData = JSON.parse(fileContent);}catch(e){console.log(e)};
        // Set all of new language item in language file representation.
        if(this.languageCursor[langKey]) {
            Object.keys(this.languageCursor[langKey]).forEach(function(code){
                var translation = this.languageCursor[langKey][code];
                if(!languageData[code]) languageData[code] = translation;
            }.bind(this));
        }
        // Save file
        fs.writeFile(filePath,JSON.stringify(languageData, null, '\t'));
    }.bind(this));
}
/**
 * Save content of the file. It is available for the
 * current file or new created file.
 */
Translator.prototype.saveContent = function(){
    // If we on this function GAT will create new file,
    // else it will replacement in current file.
    if(this.options.createNewFile) {
        var newPath = path.dirname(this.path)+'/'+ path.basename(this.path,path.extname(this.path)) + '_translated' +path.extname(this.path);
        fs.writeFile(newPath,this.buffer);
    }
    else {
        fs.writeFile(this.path,this.buffer);
    }
}
/**
 * Get translate code by lamguage Code.
 * @param langCode - language code it is code of current language (en,ru,es, etc)
 * @returns {*}
 */
Translator.prototype.getTranslateCode = function(langCode){
    var code = null;
    if(!this.options.translate) {
        console.error('You need to setup translations config. See more details on official plugin page.');
        return false;
    }
    Object.keys(this.options.translate).forEach(function(key){
        var value = this.options.translate[key];
        if(langCode==value) code = key;
    }.bind(this));
    return code;
}
/**
 * Find item by originals
 * @param langKey - language Key - enUS,ruRU
 * @param original - original text of found phrase
 * @returns {*}
 */
Translator.prototype.getCursorItemByOriginal = function(langKey,original) {
    var result = {};
    this.cursor[langKey].forEach(function(item){
        if(item.original==original) result = item;
    });
    return result;
}

/**
 * Checkout empty string
 * @param string
 * @returns {boolean}
 */
Translator.prototype.isEmptyString = function(string) {
    return (string === null || string === "null" || string.length < 1);
}

module.exports = Translator;
