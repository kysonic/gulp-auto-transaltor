'use strict';
// Requirements
var gutil      = require('gulp-util');
var through    = require('through2');
var Exceler    = require('./lib/Exceler');


var path    = require('path');
var fs      = require('fs');
// Basic varibales
var PLUGIN_NAME = 'gulp-auto-translator';


module.exports.excel = function (options) {
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
        var exceler = new Exceler(options,file);
        exceler.create();
    });
};

module.exports.parse = function (options) {
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
        var exceler = new Exceler(options);
        exceler.parse(file);
    });
};

module.exports.assembler = function (options) {
    /**
     * Pick up the stream to get all of the
     * needed file for searching keywords.
     */
    return through.obj(function (file, enc, cb) {
        // If this file don't exist or empty - Give control to the next point.
        if (file.isNull())return cb(null, file);
        // Checkout streaming support
        if (file.isStream()) return cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        var assemble = null;
        fs.exists(options.path,function(exist) {
            if(!exist) fs.writeFileSync(options.path,'[]');
            fs.readFile(options.path,function(err,content) {
                if(err) throw new Error(err);
                //
                var assembleContent = JSON.parse(content);
                var fileContent = JSON.parse(file.contents.toString('utf8'));
                var fileName = path.basename(file.path,'.json');
                //
                var i = 0;
                for(var key in fileContent) {
                    var value = fileContent[key];
                    var o = {};
                    o[fileName] = value;
                    //
                    if(!assembleContent[i]) assembleContent.push(o);
                    else assembleContent[i][fileName] = value;
                    //
                    if(!assembleContent[i].code) assembleContent[i].code = key;
                    i++;
                }
                fs.writeFile(options.path,JSON.stringify(assembleContent),function(err) {
                    if(err) throw new Error(err);
                    cb(null,file);
                });
            });
        });
    });
};






