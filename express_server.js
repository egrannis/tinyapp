const express = require("express");
const app = express();
const PORT = 3001; // changed default port because was having tech difficulties with 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['spring', 'summer', 'autumn']
}));
const bcrypt = require('bcryptjs');
const {findUserByEmail, urlsForUser, generateRandomString} = require('./helpers');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple",
 
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/urls", (request, response) => { // view my URLs page that shows everything (Main page)
  if (!users[request.session.userId]) { // if the users database at that specific userid doesn't exist
    const templateVars = {
      message: "Hi there! You can only view the 'My URLs' page if you are logged in. Please register or log in to create and view URLs.",
      statusCode: 401,
      user: false
    };
    return response.render("urls_error", templateVars);
  }
  const userId = request.session.userId;
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase), // users can only see the shortURLs for their specific userid
    user: users[userId]
  };
  response.render("urls_index", templateVars); // since we're using the Express convention of using a views directory, we don't have to tell express where to find the file
});

app.get("/urls/new", (request, response) => { // view "Create new URL"
  const userId = request.session.userId;
  if (!users[userId]) {// if users database at userid doesn't exist, then it'll respond and redirect the page
    return response.status(403).redirect('/login');
  }
  const templateVars = {
    user: users[userId]
  };
  response.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (request, response) => { // view when I want to edit my URL, or after I've created a new URL
  const shortURL = request.params.shortURL;
  if (!urlDatabase[shortURL]) {
    const templateVars = {
      message: "Sorry, that shortURL id does not exist!",
      statusCode: 401,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== request.session.userId) {
    const templateVars = {
      message: "Hi there! You can only edit URLs if you created them. Please register or log in.",
      statusCode: 401,
      user: false
    };
    return response.render("urls_error", templateVars);
  }
  const userId = request.session.userId;
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL,
    user: users[userId]
  };
  response.render("urls_show", templateVars);
});

app.get("/register", (request, response) => { // view register page
  const userId = request.session.userId;
  const templateVars = {
    user: users[userId]
  };
  response.render("urls_register", templateVars);
});

app.get("/login", (request, response) => { // view login page
  const userId = request.session.userId;
  const templateVars = {
    user: users[userId]
  };
  response.render("urls_login", templateVars);
});

app.get("/u/:shortURL", (request, response) => { // The created shortURL link that redirects to longURL
  if (!urlDatabase[request.params.shortURL]) {
    return response.send('Sorry, that shortURL id does not exist!');
  }
  const longURL = urlDatabase[request.params.shortURL].longURL;
  response.redirect(longURL);
});

app.get("/", (request, response) => { // homepage
  response.send("Hello!");
});

app.get("/urls.json", (request, response) => { // json object urlDatabase
  response.json(urlDatabase);
});

app.get("/hello", (request, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post('/urls/:shortURL/delete', (request, response) => { // delete a short URL
  const shortURL = request.params.shortURL;
  if (!urlDatabase[shortURL]) {// if the requested short URL can't be found, receive an error page
    const templateVars = {
      message: "Sorry, that shortURL id does not exist!",
      statusCode: 401,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== request.session.userId) { // if the requested short URL exists, but the user ID doesn't match for it, provide the user with a denial message
    const templateVars = {
      message: "Hi there! You can only delete URLs if you created them. Please register or log in to make your own URLs.",
      statusCode: 401,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  delete(urlDatabase[shortURL]);
  response.redirect('/urls');
});

app.post('/login', (request, response) => { // login page
  const user = findUserByEmail(request.body.email, users);
  if (!user) {// if the user cannot be found by the email, prompt with a message that email isnt linked to an account
    const templateVars = {
      message: "Hello, it looks like your email isn't linked with an account. Please try registering instead!",
      statusCode: 403,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  if (!bcrypt.compareSync(request.body.password, user.password)) { // if the password doesn't match the password saved in the database, provide an error message
    const templateVars = {
      message: "Hello, it looks like your password is incorrect. Please try logging in again!",
      statusCode: 403,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  request.session.userId = user.id; // set the session id as the id linked to that user's email
  response.redirect('/urls');
});

app.post('/logout', (request, response) => {
  request.session = null; //response.clearCookie('userId')
  response.redirect('/urls');
});

app.post('/register', (request, response) => {
  const userId = generateRandomString();
  const {email, password} = request.body; // Destructuring - js smart to know that email and password fall into request.body object
  if (email === '' || password === '') { // If email or password are empty strings, provide error message
    const templateVars = {
      message:'You can\'t enter an empty string as an email or password!',
      statusCode: 400,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  if (findUserByEmail(email, users)) { // If an email is already in the database, provide an error message and mention logging in
    const templateVars = {
      message:'Your account already exists. Please log in instead!',
      statusCode: 400,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  const hashedPass = bcrypt.hashSync(request.body.password, 10);
  const user = {id: userId, email: request.body.email, password: hashedPass }; // creating a new user in the database, storing hashed password in database
  users[userId] = user; // at key of userID, the value is an object.
  request.session.userId = userId;
  response.redirect('/urls');
});

app.post('/urls', (request, response) => { //Creating new URL
  const userId = request.session.userId;
  if (!users[userId]) { // if a user with that user ID doesn't exist in the database, then redirect to the login page
    return response.status(403).redirect('/login');
  }
  let shortURL = generateRandomString(); // generating randomstring and storing in shortURL variable
  urlDatabase[shortURL] = { longURL: request.body.longURL, userID: userId };
  response.redirect(`/urls/${shortURL}`); // redirecting to shortURL page
});

app.post('/urls/:shortURL', (request, response) => { //editing the longURL value
  const shortURL = request.params.shortURL;// took existing short URL, and changing the long URL value at the same short URL value
  if (urlDatabase[shortURL].userID !== request.session.userId) { //checking if the userid for that short URL matches that of the person requesting
    const templateVars = {
      message: "Hi there! You can only edit URLs if you created them. Please register or log in to create your own editable URLs.",
      statusCode: 401,
      user: false
    };
    return response.render("urls_error", templateVars);
  }
  const longURL = request.body.longURL;
  urlDatabase[shortURL].longURL = longURL; // resetting the value of long URL within the user object since it is being edited
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
