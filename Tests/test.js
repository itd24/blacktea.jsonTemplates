// tests/part1/cart-summary-test.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var jsonTemplates = require('../index');

jsonTemplates.add("test", {
	returnB: function() {
		return 4;
	},
	returnC: function() {
		return 5;
	}
});

describe('jsonTemplates', function() {
	it('evaluateObject() should return an evaluated object', function() {

		var rawObject = {
			a: "a",
			b: "{{test.returnB()}}",
			c: "The result is {{test.returnC()}}"
		};

		var result = jsonTemplates.evaluateObject(rawObject);
		expect(result).to.deep.equal({
			a: "a",
			b: 4,
			c: "The result is 5"
		});
	});

	it('evaluate() should return an evaluated string or object', function() {

		var rawObject = "{{test.returnC()}}";
		var rawString = "The result is {{test.returnB()}}";

		var result = jsonTemplates.evaluate(rawObject);
		var result2 = jsonTemplates.evaluate(rawString);
		expect([result, result2]).to.deep.equal([5, "The result is 4"]);
	});
});