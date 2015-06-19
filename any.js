'use strict';
// Requirements
var gutil      = require('gulp-util');
var through    = require('through2');
var request    = require('request');
var async      = require('async');

var path    = require('path');
var util    = require('util');
var fs      = require('fs');
// Basic varibales
var PLUGIN_NAME = 'gulp-auto-translator';
// Expressions


var numberRegexp = /^[0-9]+$/g;
var trimRegexp = /(^\s+|\s+$)/g;
var spacesRegexp = /[\s]+/g;
var stRegexp = /[,\-\:\.]/g;
var escapeRegexp = /([\.\^\$\*\+\?\(\)\[\{\\\|\-\,])/g;
var letterRegexp = /[a-zA-Zа-яА-Я]/;
var notLetterRegexp = /[^a-zA-Zа-яА-Я]/;
/**
 * Because we use FREE Yandex Translate api,
 * the code of auto translator can be changed sometimes.
 */

// Yandex Translate API String

var YandexApiString = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=%s&lang=%s&text=%s";
/**
 * Translator class needed for a
 * definition of  translator entity.
 * @constructor
 */
function Translator() {
    // Basic object, which will be contains translation objects by category
    this.cursor = {};
    // Additional object representing .JSON language files by category
    this.languageCursor = {};
    // Content of current file
    this.fileContent = '';
    // Name of current file
    this.fileName = '';
}
/**
 * Translate current word\phrase.
 * @param phrase - word or phrase to translation
 * @param langKey - special language Key defining translation file, method and other.
 * @param options - options object, which were received from plugin options.
 * @param callback - async callback - call to forward a control on the next executor.
 */
Translator.prototype.translate = function(phrase,langKey,options,callback) {
    var endPoint = options.translate[langKey];
    this.cursor[langKey] = this.cursor[langKey] || [];
    // Now! Time to translate our match word(s)
    // If we have Yandex Translate API Key, use it!
    if(options.yandexApiKey) {
        var translateDirection = options.basic!=endPoint ? options.basic+ '-'+endPoint : false;
        if(translateDirection) {
            var url = util.format(YandexApiString, options.yandexApiKey, translateDirection, phrase);
            request(url,function(err,response,body){
                var data = JSON.parse(body);
                this.cursor[langKey].push({original:phrase,translate:data.text || false,from:options.basic,to:endPoint});
                callback(this.cursor);
            }.bind(this));
        }else {
            var translate = [];
            translate.push(phrase);
            this.cursor[langKey].push({original:phrase,translate:translate,from:options.basic,to:endPoint});
            callback(this.cursor);
        }
    }
}
/**
 * Checkout empty string
 * @param string
 * @returns {boolean}
 */
Translator.prototype.isEmptyString = function(string) {
    return (string === null || string === "null" || string.length < 1);
}
/**
 * This function helps to get needed item from cursor
 * @param langKey - key of language set of cursor
 * @param original - original for searching
 * @returns {*}
 */
Translator.prototype.getCursorItemByOriginal = function(langKey,original) {
    var result = null;
    this.cursor[langKey].forEach(function(item){
        if(item.original==original) result = item;
    });
    return result;
}
/**
 * Entry point of plugin
 * @param options
 * @param options.regexp - The Base Regular Expression
 *      by which will be organized searching
 *      of needed words to translate
 * @param options.cleaner - Additional Regular Expression
 *      by which found result will be cleared.
 * @returns {*}
 */
module.exports = function (options) {
    /**
     * Pick up the stream to get all of the
     * needed file for searching keywords.
     */
    return through.obj(function (file, enc, cb) {
        // If this file don't exist or empty - Give control to the next point.
        if (file.isNull())return cb(null, file);
        // Checkout streaming support
        if (file.isStream()) return cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        // Define new translator to current file.
        var translator = new Translator();
        //Find all matches of Regular Expression added in options.
        translator.fileContent = file.contents.toString('utf8');
        translator.fileName = path.basename(file.path).split('.')[0].substr(0,10).toUpperCase();

        if(!options.regexp) return cb(new gutil.PluginError(PLUGIN_NAME, 'For searching you need to add Regular Expression.'));

        async.each(translator.fileContent.match(options.regexp), function(item,callback){
            var mtch = item.trim();
            // Checkout a empty string
            if(!translator.isEmptyString(mtch)) {
                // Checkout numbers
                if (!parseInt(mtch) && !numberRegexp.test(mtch)) {
                    // If we have cleaner regular expression - use it right now.
                    if (options.cleaner) mtch = mtch.replace(options.cleaner, '');
                    var phrase = mtch.replace(trimRegexp,'');
                    if (!translator.isEmptyString(phrase)) {
                        if (!options.translate) callback('You need to setup translations config. See more details on official plugin page.');
                        // Execute
                        async.each(Object.keys(options.translate), function (langKey, currentCB) {
                            translator.translate(phrase,langKey,options,function(){
                                currentCB();
                            })
                        }, function (cursor) {
                            callback();
                        });
                    }else {
                        callback();
                    }
                }
            }
        }, function(err, results){
            // First we need to create code of phrase
            // for language file
            try {
                translator.languageCursor[options.code] = translator.languageCursor[options.code] || {};
                translator.cursor[options.code].forEach(function(item,itemKey){
                    var translate = item.translate[0];
                    var code = translate.replace(stRegexp,' ').trim().replace(notLetterRegexp,'')
                                        .replace(spacesRegexp,'')
                                        .split(' ').splice(0,options.wordCodeLimit || 3).join('')
                                        .substr(0,options.codeLimit || 20).toUpperCase();
                    if (!translator.isEmptyString(code) && letterRegexp.test(code)) {
                        // Add additional prefix to code.
                        if(options.useFileNamePrefix) code = code+'_'+translator.fileName;
                        // Replacement
                        if(options.replacement) {
                            var replacement = null;
                            // Define replacement
                            if(/#CODE#/.test(options.replacement)) replacement = options.replacement.replace('#CODE#',code);
                            if(/#TRANSLATE#/.test(options.replacement)) replacement = options.replacement.replace('#CODE#',code);
                            if(!replacement) return cb(new gutil.PluginError(PLUGIN_NAME, 'You should set in your replacement string one of next codes: #CODE#, #TRANSLATE#'));
                            // Deal with it!
                            var regexp = new RegExp(item.original.replace(escapeRegexp,'\\$1'));

                            translator.fileContent = translator.fileContent.replace(regexp,replacement);
                        }
                        // Language cursor (it is representation of future language file)
                        translator.languageCursor[options.code][code] = item.translate[0] || 'Something gone wrong! If you see this message you should checkout your language file.';
                        // Set Another translations in language cursor.
                        if (!options.translate) return cb(new gutil.PluginError(PLUGIN_NAME, 'You need to setup translations config. See more details on official plugin page.'));
                        Object.keys(options.translate).forEach(function(langKey){
                            if(langKey!=options.code) {
                                translator.languageCursor[langKey] = translator.languageCursor[langKey] || {};
                                // Because of async translation we should find appropriate item
                                // from another language set of cursor
                                var aItem = translator.getCursorItemByOriginal(langKey,item.original);
                                translator.languageCursor[langKey][code] =  aItem.translate[0] || 'Something gone wrong! If you see this message you should checkout your language file.';
                            }
                        });
                    }
                });
            }catch(e){
                console.log(e)
            }
            // Now we must set all of language cursor items to
            // appropriate language file
            if(options.useLangFiles && options.translate) {
                if(!options.path || !fs.existsSync(options.path)) return cb(new gutil.PluginError(PLUGIN_NAME, 'You should set path to directory, which will be save all language files. And! This path should exists.'));
                // Get All language keys
                Object.keys(options.translate).forEach(function(langKey){
                    var filePath = path.normalize(options.path+langKey+'.json');
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
                    if(!translator.isEmptyString(fileContent))
                        try{languageData = JSON.parse(fileContent);}catch(e){console.log(e)};

                    // Set all of new language item in language file representation.
                    if(translator.languageCursor[langKey]) {
                        Object.keys(translator.languageCursor[langKey]).forEach(function(code){
                            var translation = translator.languageCursor[langKey][code];
                            if(!languageData[code]) languageData[code] = translation;
                        });
                    }
                    // Save file

                    fs.writeFile(filePath,JSON.stringify(languageData, null, '\t'));
                });
            }
            // Save file content now!
            if(options.replacement) {
                // If we on this function GAT will create new file,
                // else it will replacement in current file.
                if(options.createNewFile) {
                    var newPath = path.dirname(file.path)+'/'+ path.basename(file.path,path.extname(file.path)) + '_translated' +path.extname(file.path);
                    fs.writeFile(newPath,translator.fileContent);
                }
                else fs.writeFile(file.path,translator.fileContent);
            }
        });
    });
};

