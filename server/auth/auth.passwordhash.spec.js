'use strict';
var passwordHash = require('./auth.passwordhash');
var expect = require('expect.js');

describe('Password hashing', function() {
  it('should generate password hashes',function (){
    let pwdHash = passwordHash.generate('longpassword');
    expect(pwdHash).not.to.contain('longpassword');
  });

  it('should validate password hashes',function (){
    let pwdHash = passwordHash.generate('longpassword');
    expect(passwordHash.isHashed(pwdHash)).to.be(true);
    expect(passwordHash.isHashed('blablabla')).to.be(false);
  });

  it('should validate password hashes',function (){
    let pwdHash = passwordHash.generate('longpassword');
    expect(passwordHash.verify('longpassword',pwdHash)).to.be(true);
    expect(passwordHash.verify('wrongpassword',pwdHash)).to.be(false);
  });

  it('password hash should be slow',function (){
    //More than 1ms to generate a password hash
    let now = process.hrtime()[1];
    passwordHash.generate('longpassword');
    expect(process.hrtime()[1] - now).to.be.greaterThan(1000000);
  });

});
'use strict';
