const findUserEmail = function(users, email) {
  for (let userId in users) {
    if (users[userId].email === email) {
     return users[userId];
    }
  }
  return;
};

module.exports = findUserEmail; 