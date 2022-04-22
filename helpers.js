
const findUserByEmail = (email, database) => {
  const givenEmail = email;
  for (let userKey in database) {
    if (database[userKey].email === givenEmail) {
      return database[userKey];
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  const userURLS = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userURLS[shortURL] = database[shortURL];
    }
  }
  return userURLS;
};

const generateRandomString = () => {
  let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randString = '';
 
  for (let i = 0; i < 6; i++) {
    randString += string[Math.floor(Math.random() * string.length)];
  }
  return randString;
};

module.exports = {findUserByEmail, urlsForUser, generateRandomString};