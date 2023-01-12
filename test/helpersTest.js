const { assert } = require('chai');

const findUserEmail = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserEmail(testUsers, "user@example.com")
    const expectedUser = testUsers.userRandomID;
    assert.deepEqual(user, expectedUser);
  });
  it('should return undefined if the user is not in the database', function() {
    const user = findUserEmail(testUsers, "seconduser@example.com")
    const expectedUser = testUsers.userRandomID;
    assert.equal(user, undefined);
  });
});

