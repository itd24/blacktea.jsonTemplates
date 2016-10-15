#blacktea.jsonTemplates
This library provides a simple way of templating json files. It basically enables you to add variables/objects/function calls to a json file without having to save it as a js file. It can be helpful, if you have to use json files but want to add some dynamism to them.

##Overview
* [Installation](#installation)
* [Usage](#usage)
* [Documentation](#documentation)
* [License](#license)

##Installation
Install it via the npm command:<br/>
`npm install blacktea.jsonTemplates --save`<br/>
No bower yet, or ever. 
##Usage
First you load the library:<br/>
`var t = require("blacktea.JsonTemplates");`<br/>
Now you can start adding objects, that should be available in your json files.<br/>For example:<br/>
```
var testObject = {
    add:function(a,b){
        return a+b;
    }
};
//first argument is a key, the second one is the object you want to add
t.add("test",testObject);
```
<br/>
Lets assume, you have a file, called ***example.json*** with the following contents:
<br/>
```
{
"example":"value1",
"example2":"{{=test.add(1,2)}}"
}
```
<br/>
Run it through the templating engine:<br/>
```
var obj = require("./example.json");
var result = t.evaluateObject(obj);
console.log(obj);
```
<br/>
The result will be:<br/>
```
{
"example":"value1",
"example2":3
}
```
<br/>
The library uses the lodash templating engine with changed delimiters:<br/>
   {{= }} - interpolation<br/>
   {{- }} - escaping<br/>
   {{ }} - evaluation<br/>
<br/><br/>
<br/>For now it is not possible to change the delimiters, there may be support for custom delimiters in feature versions.
<br/><br/>
***Important:***<br/>
If the template string will contain only be the data wrapped in interpolate delimiters, the string will be replaced with the actual resulting object or function result. If the string will also contain other textual data, it will be ran through the lodash templating engine.<br/>
<br/>
For example:<br/>
<br/>
a json file containing this values:<br/>
```
{
"example":"value1",
"example2":"{{=test.add(1,2)}}"
}
```
<br/>
Will, after it is compiled, contain these values:<br/>
```
{
"example":"value1",
"example2":3
}
```
<br/>
A json file with these values: <br/>
<br/>
a json file containing this values:<br/>
```
{
"example":"value1",
"example2":"this is the value: {{=test.add(1,2)}}"
}
```
<br/>
Will, after it is compiled, contain these values:<br/>
```
{
"example":"value1",
"example2":"this is the value: 3"
}
```
<br/>
This way it is possible to inject entire objects or functions into the end result.
<br/>
##Documentation
***add(name, object)***<br/>
    adds a variable / object / function to the template variables.<br/>After adding, an object is available in a template via its key.<br/>
    - ___name___   - the key of the object. Type of string<br/>
    - ___object___ - the object to add. It can be any type<br/>
***addPath(path)***<br/>
    requires and adds all .js files inside a specified path as template objects.<br/>The file name becomes the object key.<br/>
    - ___path___   - either a string containing a path or an array of strings which can be used with the "path.resolve" function<br/>
***evaluateObject(object)***<br/>
    recursively goes through all object members and evaluates them if needed.<br/>
    - ___object___   - a plain object, containing template strings<br/>
***evaluate(template)***<br/>
    evaluates a template. Based on if it is a replacement, it either evaluates or parses the string.<br/>
    - ___template___   - the template string to evaluate<br/>
## Licence
blacktea.jsonTemplates is released under the [MIT License](http://www.opensource.org/licenses/MIT).
