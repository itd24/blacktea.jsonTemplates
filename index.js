var _ = require("lodash");
var Exceptions = require("blacktea.Exceptions");
var glob = require("glob");
var path = require("path");

var templateObject = {};

var options = {
    interpolate: /\{\{([\s\S]+?)\}\}/g,
    escape:/\{\{-([\s\S]+?)\}\}/g,
    evaluate:/\{\{!([\s\S]+?)\}\}/g
}

var privateFunctions = {
    prepareTemplate:function(template){
      return _.trim(template);  
    },
    isTemplateReplacement:function(template){
        var matches = this.prepareTemplate(template).match(options.interpolate);
        var rest = this.prepareTemplate(template).replace(options.interpolate,"");
        if(_.isEmpty(rest) && matches.length == 1)
            return true;
        return false;
    },
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
    parse:function(template){
        try{
            var compiled = _.template(template,options);
            return compiled(templateObject);
        }
        catch(e){
            throw e;
        }
    },
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
    addTemplateObjectFromFile:function(file){
        try{
                var name = path.basename(file,".js");
                this.addTemplateObject(name,require(file));
           }
           catch(e){
               console.log("error: "+e.message)
           }
    },
    addCoreTemplateObjects:function(){
        var self = this;
        var files = glob.sync(path.resolve(__dirname,"Helpers","*.js"));
       _.each(files,function(file){
           self.addTemplateObjectFromFile(file);
       });
    },
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
    evaluate:function(template){
        if(privateFunctions.isTemplateReplacement(template)){
           return privateFunctions.evaluate(template); 
        }
        else{
            return privateFunctions.parse(template);
        }
    },
    evaluateObject:function(obj){
        var self = this;
        if(_.isArray(obj) || _.isPlainObject(obj)){
            _.each(obj,function(element,index){
               obj[index] = self.evaluateObject(element); 
            });
        }
        else if(_.isString(obj)){
            return self.evaluate(obj);
        }
        else{
            return obj;
        }
    },
    add:function(name,obj){
        if(!_.isEmpty(name))
            privateFunctions.addTemplateObject(name,obj);
    },
    addPath:function(dir){
        privateFunctions.addTemplateObjectFromPath(dir);
    }
}