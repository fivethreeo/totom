var path           = require('path');
var through2       = require('through2');
var gutil          = require('gulp-util');
var assign         = require('object-assign');

var PluginError    = gutil.PluginError;

module.exports = function (opts) {
  // Mixes in default options.
  opts = assign({}, {
      templates_variable: 'templates',
      inject_function: null,
      as_javascript: true
    }, opts);
    
  var inject_as_javascript = function(basename, name, indent, content) {
    var templates = templates || {};  
    var nl_re = new RegExp('(\\r\\n|\\n|\\r)', 'gm');
    var ap_re = new RegExp("'", 'g');
          
    var templates_init = 'var ' + opts.templates_variable + ' = ' + opts.templates_variable + ' || {}; \n'
    var templates_variable = "templates." + basename + '_' + name + "_template"
          
    return templates_init
      // + '(function() {\n'
      + templates_variable + " = '"
      +  (indent + content)
        .replace(nl_re, "\\" + '\n')
        .replace(ap_re, "\\\'")
      // + "'\n})();\n"
      + "';\n"
  }
      
  var inject_as_template = function(basename, name, indent, content) {
    return '<script id="' + basename + '_' + name + '_template" type="text/template">' + indent + content + '</script>'
  }
      
  var inject_function = opts.inject_function || opts.as_javascript ? inject_as_javascript : inject_as_template
    
  var startTag = ['<!-- template:',  ')([^\\s]*?) (', '-->'], endTag = '<!-- endtemplate -->'
    
  function getInjectorTagsRegExp (starttag, endtag) {
    var re = '(' + makeWhiteSpaceOptional(escapeForRegExp(starttag[0])) + 
      starttag[1] +
      makeWhiteSpaceOptional(escapeForRegExp(starttag[2]))+ ')(\\s*)((\\n|\\r|.)*?)(' + 
      makeWhiteSpaceOptional(escapeForRegExp(endtag)) + ')';
        
    return new RegExp(re, 'gi');
  }
    
  function makeWhiteSpaceOptional (str) {
    return str.replace(/\s+/g, '\\s*');
  }
    
  function escapeForRegExp (str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  
  function inject_templates(file) {
    var basename = path.basename(file.path, '.ejsc');
    return file.contents.toString('utf8').replace(
      getInjectorTagsRegExp(startTag, endTag),
      function injector (match, starttag1, name, starttag2, indent, content, endtag) {
        return inject_function(basename, name, indent, content)
      }
    );
  }
     
  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError('gulp-ejs-inject', 'Streaming not supported'));
    }

    file.contents = new Buffer(inject_templates(file));
    file.path = gutil.replaceExtension(file.path, '.js');
  
    return cb(null, file);

  });

};
