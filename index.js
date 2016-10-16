var _ = require("lodash");
var Exceptions = require("blacktea.exceptions");
var glob = require("glob");
var path = require("path");

var templateObject = {};

/**
 * Regex values for interpolation, escaping and evaluation
 * @type {Object}
 */
var options = {
    interpolate: /\{\{([\s\S]+?)\}\}/g,
    escape:/\{\{-([\s\S]+?)\}\}/g,
    evaluate:/\{\{!([\s\S]+?)\}\}/g
}

var privateFunctions = {
    /**
     * prepares the template string.
     * @param  {string} template the raw, untrimmed template
     * @return {string}          a template, that is ready for evaluation
     */
    prepareTemplate:function(template){
      return _.trim(template);  
    },
    /**
     * checks, if the template is a replacement, or just a string, that needs to be run over the lodash template engine
     * @param  {string}  template the template to check
     * @return {Boolean}          true, if the template is a replacement, false otherwise
     */
    isTemplateReplacement:function(template){
        var matches = this.prepareTemplate(template).match(options.interpolate);
        var rest = this.prepareTemplate(template).replace(options.interpolate,"");
        if(_.isEmpty(rest) && matches.length == 1)
            return true;
        return false;
    },
    /**
     * evaluates the template and returns a replacement
     * @param  {string} template the template to evaluate
     * @return {mixed}          the result of the evaluation
     */
    evaluate:function(template){
        //gets the first interpolate match and evaluates it
        var matches = this.prepareTemplate(template).match(options.interpolate);
        if(matches.length == 0)
        {
            throw new Exceptions.RuntimeException("The template can not be transformed into a single value");
        }
        var match = _.trim(matches[0]);
        var body = "(function(){return templateObject."+match.replace(options.interpolate,"$1")+"}())";
        try{
            var evalResult = eval(body);
            return evalResult;
        }
        catch(e){
            throw e;
        }
    },
    /**
     * parses a template using the lodash templating engine
     * @param  {string} template the template to parse
     * @return {string}          the result of the compiled template function
     */
    parse:function(template){
        try{
            var compiled = _.template(template,options);
            return compiled(templateObject);
        }
        catch(e){
            throw e;
        }
    },
    /**
     * adds a template object to the "templateObject" variable, so it can be used in templates
     * @param {string} name the key under which the object will be available
     * @param {mixed} obj  the value to store under that key
     */
    addTemplateObject:function(name,obj){
        if(!templateObject[name])
            templateObject[name] = obj;
        else if(templateObject[name] && _.isPlainObject(templateObject[name]) && _.isPlainObject(obj)){
            _.merge(templateObject[name],obj);
        }
        else{
            throw new Exceptions.InvalidArgumentException("template object already exists, merge wasn't possible");
        }
    },
    /**
     * adds a template object from file rather than directly. It basically just requires a file and adds the result 
     * @param {[type]} file [description]
     */
    addTemplateObjectFromFile:function(file){
        try{
                var name = path.basename(file,".js");
                this.addTemplateObject(name,require(file));
           }
           catch(e){
               console.log("error: "+e.message)
           }
    },
    /**
     * adds core template object. That is, objects/helpers stored in the Helpers directory
     */
    addCoreTemplateObjects:function(){
        var self = this;
        var files = glob.sync(path.resolve(__dirname,"Helpers","*.js"));
       _.each(files,function(file){
           self.addTemplateObjectFromFile(file);
       });
    },
    /**
     * requires all files from a path and adds them as template objects
     * @param {[type]} dir [description]
     */
    addTemplateObjectsFromPath:function(dir){
        var self = this;
        var dirPath = "";
        if(_.isArray(dir) && dir.length > 0){
            if(dir[dir.length - 1] != "*.js")
                dir.push("*.js");
            dirPath = path.resolve.apply(this,dir);
        }
        else if(_.isString(dir)){
            if(!_.endsWith(dir,"*.js"))
                dir = _.trim(dir,"/\\ ")+"/*.js";
        }
        else{
            throw new Exceptions.InvalidArgumentException("dir has to be either string or an array of strings");
        }
        var files = glob.sync(dirPath);
       _.each(files,function(file){
           self.addTemplateObjectFromFile(file);
       });      
    }
}

privateFunctions.addCoreTemplateObjects();

module.exports = {
    /**
     * evaluates a template. Based on if it is a replacement, it either evaluates or parses the string
     * @param  {string} template the template to evaluate
     * @return {mixed}          the result of the evaluation
     */
    evaluate:function(template){
        if(privateFunctions.isTemplateReplacement(template)){
           return privateFunctions.evaluate(template); 
        }
        else{
            return privateFunctions.parse(template);
        }
    },
    /**
     * It recursively goes through all object members and evaluates them if needed
     * @param  {object} obj the object to evaluate
     * @return {object}     the evaluated object
     */
    evaluateObject:function(obj){
        var self = this;
        if(_.isArray(obj) || _.isPlainObject(obj)){
            _.each(obj,function(element,index){
               obj[index] = self.evaluateObject(element); 
            });
            return obj;
        }
        else if(_.isString(obj)){
            return self.evaluate(obj);
        }
        else{
            return obj;
        }
    },
    /**
     * adds a variable to the template objects
     * @param {string} name the key under which the value will be accessible
     * @param {mixed} obj  the value to add
     */
    add:function(name,obj){
        if(!_.isEmpty(name))
            privateFunctions.addTemplateObject(name,obj);
    },
    /**
     * adds all files in a directory as template objects
     * @param {string} dir the directory to add
     */
    addPath:function(dir){
        privateFunctions.addTemplateObjectFromPath(dir);
    }
}
