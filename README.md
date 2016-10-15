#blacktea.jsonTemplates
This library provides a simple way of templating json files. It basically enables you to add variables/objects/function calls to a json file without having to save it as a js file. It can be helpful, if you have to use json files but want to add some dynamism to them.

##Overview
* [Installation](#installation)
* [Usage](#usage)
* [Documentation](#documentation)
* [License](#license)

##Installation
install it via the npm command:
`npm install blacktea.jsonTemplates --save`
No bower yet, or ever. 
##Usage
First you load the library:
´var t = require("blacktea.JsonTemplates");´
Now you can start adding objects, that should be available in your json files. For example:
´´´
var testObject = {
    add:function(a,b){
        return a+b;
    }
};
//first argument is a key, the second one is the object you want to add
t.add("test",testObject);
´´´
Lets assume, you have a file, called ***example.json*** with the following contents:

´´´
{
"example":"value1",
"example2":"{{=test.add(1,2)}}"
}
´´´
Run it through the templating engine:
´´´
var obj = require("./example.json");
var result = t.evaluateObject(obj);
console.log(obj);
´´´
The result will be:
´´´
{
"example":"value1",
"example2":3
}
´´´
The library uses the lodash templating engine with changed delimiters:
{{= }} - interpolation
{{- }} - escaping
{{ }} - evaluation

For now it is not possible to change the delimiters, there will maybe be support for custom delimiters in feature versions.

***Important:***
If the template string will contain only be the data wrapped in interpolate delimiters, the string will be replaced with the actual resulting object or function result. If the string will also contain other textual data, it will be ran through the lodash templating engine.

For example:

a json file containing this values:
´´´
{
"example":"value1",
"example2":"{{=test.add(1,2)}}"
}
´´´
Will, after it is compiled, contain these values:
´´´
{
"example":"value1",
"example2":3
}
´´´

A json file with these values: 

a json file containing this values:
´´´
{
"example":"value1",
"example2":"this is the value: {{=test.add(1,2)}}"
}
´´´
Will, after it is compiled, contain these values:
´´´
{
"example":"value1",
"example2":"this is the value: 3"
}
´´´
This way it is possible to inject entire objects or functions into the end result.

##Documentation
***add(name, object)***
    adds a variable / object / function to the template variables. After adding, an object is available in a template via its key.
    - ___name___   - the key of the object. Type of string
    - ___object___ - the object to add. It can be any type
***addPath(path)***
    requires and adds all .js files inside a specified path as template objects. The file name becomes the object key.
    - ___path___   - either a string containing a path or an array of strings which can be used with the "path.resolve" function
***evaluateObject(object)***
    recursively goes through all object members and evaluates them if needed.
    - ___object___   - a plain object, containing template strings
***evaluate(template)***
    evaluates a template. Based on if it is a replacement, it either evaluates or parses the string.
    - ___template___   - the template string to evaluate
## Licence
blacktea.jsonTemplates is released under the [MIT License](http://www.opensource.org/licenses/MIT).
