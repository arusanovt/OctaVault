'use strict';
var authCodes = require('./auth.codes');
var expect = require('expect.js');

describe('Auth codes', function() {
  it('should generate codes',function (){
    let code = authCodes.generateDigits(7);
    expect(code).to.have.length(7);
    expect(code).to.match(/\d{7}/);
  });

  it('should generate 7 numbers by default',function (){
    let code = authCodes.generateDigits();
    expect(code).to.have.length(7);
    expect(code).to.match(/\d{7}/);
  });
});
