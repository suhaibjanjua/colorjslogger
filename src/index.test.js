var expect = require('chai').expect;
var logs = require('./index');


describe("Color JS Logger", function() {

    describe("Success Log Message", function() {

        it('It should log a success message into the console.', function() {
            //expect(true).to.be.true;
            expect(logs.success("SUCCESS", "A very happy success message from the library")).to.be.an('undefined');
        });

    });

});