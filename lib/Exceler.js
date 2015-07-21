var json2xls = require('json2xls');
var fs = require('fs');
var path = require('path');
var excel2json = require("excel-to-json");

function Exceler(options,file) {
    this.options = options;
    if(file) {
        this.filePath = file.path;
        try  {this.content = JSON.parse(file.contents.toString('utf8'))}catch(e) {throw new Error(e)};
    }
}

Exceler.prototype.create = function(){
   var xls = json2xls(this.content);
   fs.writeFileSync(this.options.path, xls, 'binary');
}

Exceler.prototype.parse = function(file) {
    console.log(path.dirname(file.path))
    excel2json({
        input: './examples/excel/',
        output: "./output/parsed"
    }, function(err, result) {
        if(err) {
            console.error(err);
        } else {
            console.log(result);
        }
    });
}

module.exports = Exceler;