var expect = require('chai').expect;
var logs = require('./index');

logs.success("SUCCESS", "A very happy success message from the library")
describe("Success Log Message", function() {

    it('should work!', function() {
        expect(true).to.be.true;
    });

});