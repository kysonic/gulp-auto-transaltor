'use strict';
// Requirements
var gutil      = require('gulp-util');
var through    = require('through2');
var Translator = require('./lib/Translator');


var path    = require('path');
// Basic varibales
var PLUGIN_NAME = 'gulp-auto-translator';


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
        translator.options = options;
        translator.path = file.path;
        // Startup translator, catch up all errors and handle it by PluginError
        translator.parse(function(err){
            if(err) return cb(new gutil.PluginError(PLUGIN_NAME, err));
            translator.translate(function(){
                if(err) return cb(new gutil.PluginError(PLUGIN_NAME, err));
                translator.replace(function(err){
                    if(err) return cb(new gutil.PluginError(PLUGIN_NAME, err));
                });
            });
        });
    });
};


