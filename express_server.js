//Express config
const express = require("express");
const app = express();

//Port
const PORT = 8080; // default port 8080

//Import function
const findUserEmail = require('./helpers');

//Cookie config 
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["aSecret"],
}));

//Bcrypt config
const bcrypt = require("bcryptjs");
const salt_rounds = 10;
const salt = bcrypt.genSaltSync(salt_rounds);

//Ejs config 
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Database 
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//Users Object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "p",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString() {
  let sixCharacterUniqueId = "";
  let characters = "abcdefghijklmnopqrstuvwxyz123456789";
  let charArr = characters.split("");
  for (let i = 0; i < 6; i++) {
    sixCharacterUniqueId += charArr[Math.round(Math.random() * charArr.length)];
  };
  return sixCharacterUniqueId;
};

//Creates Object for each new user registration
const urlsForUser = function(userId) {
  const userOwnShortUrls = {};
  for (const shortURL in urlDatabase) {
    if (userId === urlDatabase[shortURL].userID) {
      userOwnShortUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userOwnShortUrls;
};

/////////////////////////////////////////////////////////////////////////
//ROUTES
/////////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.redirect("/login");
});

/////////////////////////////////////////////////////////////////////////
//URLS ROUTES// 
/////////////////////////////////////////////////////////////////////////

//Loads the urls page 
app.get("/urls", (req, res) => {

  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).send("Please log in to see your urls");
  };
  const userOwnShortUrls = urlsForUser(userId);

  const templateVars = {
    urls: userOwnShortUrls,
    users,
    userId
  };

  res.render("urls_index", templateVars);
});

// Loads the page for creating new urls 
app.get("/urls/new", (req, res) => {

  const userId = req.session.user_id;

  if (!userId) {
    return res.redirect("/login");
  }

  const templateVars = {
    urls: urlDatabase,
    userId,
    users
  };

  res.render("urls_new", templateVars);

});

//Creates shortened urls 
app.post("/urls", (req, res) => {

  const userId = req.session.user_id;
  const shortUrl = generateRandomString();

  if (!userId) {
    return res.status(404).send("you must be logged in to shorten urls");
  };

  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: userId
  };

  res.redirect(`/urls/${shortUrl}`);

});

/////////////////////////////////////////////////////////////////////////
//ID PARAMETER ROUTES
/////////////////////////////////////////////////////////////////////////

//Loads the page for editing the url entered 
app.get("/urls/:id", (req, res) => {

  const id = req.params.id;
  const userId = req.session.user_id;

  if (urlDatabase[id] === undefined) {
    return res.status(401).send("that is not a valid Id");
  };

  if (userId !== urlDatabase[id].userID) {
    return res.status(401).send("Please enter a short url that you own");
  };

  const longURL = urlDatabase[id].longURL;

  if (!userId) {
    return res.status(401).send("that is not allowed");
  };

  const templateVars = {
    urls: urlDatabase,
    userId,
    id,
    longURL,
    users,
  };

  res.render("urls_show", templateVars);

});

//Allows a user to delete a url & id
app.post("/urls/:id/delete", (req, res) => {

  const id = req.params.id;
  const userId = req.session.user_id;

  if (userId !== urlDatabase[id].userID) {
    return res.status(401).send("Please delete a short url that you own");
  };

  if (!userId) {
    return res.status(401).send("must delete a short url that you own");
  }

  delete urlDatabase[id];
  res.redirect("/urls");

});

//Redirects users to the page associated to the id  
app.get("/u/:id", (req, res) => {

  const id = req.params.id;
  const longURL = urlDatabase[req.params.id].longURL;
  const userId = req.session.user_id;

  if (urlDatabase[id] === undefined || urlDatabase[id].longURL === undefined) {
    return res.status(401).send("that is not a valid Id");
  };

  if (userId !== urlDatabase[id].userID) {
    return res.status(401).send("Please enter a short url that you own");
  };

  if (!Object.keys(urlDatabase).includes(id)) {
    return res.status(404).send("That id does not exist");
  };

  res.redirect(longURL);

});

//Edits long urls
app.post("/urls/:id", (req, res) => {

  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;

  res.redirect("/urls");

});

/////////////////////////////////////////////////////////////////////////
//LOGIN ROUTES//
/////////////////////////////////////////////////////////////////////////

//Loads the login page
app.get("/login", (req, res) => {

  const userId = req.session.user_id;

  const templateVars = {
    urls: urlDatabase,
    userId,
    users
  };

  if (userId) {
    return res.redirect("/urls");
  }

  res.render("login", templateVars);

});

//Validates login and creates a cookie 
app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const emailFound = findUserEmail(users, email);
  const id = emailFound.id;

  if (!emailFound) {
    return res.redirect("/register");
  };

  if (!id) {
    return res.status(403).send("email not found");
  };

  if (!bcrypt.compareSync(password, hashedPassword)) {
    return res.status(403).send("incorrect password");
  };

  req.session.user_id = id;
  res.redirect("/urls");

});

/////////////////////////////////////////////////////////////////////////
//LOGOUT ROUTES
/////////////////////////////////////////////////////////////////////////

//Logs-out the user & clears cookies 
app.post("/logout", (req, res) => {

  const userId = req.session.user_id;

  req.session = null;
  res.redirect("/login");

});

/////////////////////////////////////////////////////////////////////////
//REGISTER ROUTES 
/////////////////////////////////////////////////////////////////////////

//Loads the registration page 
app.get("/register", (req, res) => {

  const userId = req.session.user_id;

  if (userId) {
    res.redirect("/urls");
  };

  const templateVars = {
    urls: urlDatabase,
    users,
    userId,
  };

  res.render("register", templateVars);

});

//Validates registration 
app.post("/register", (req, res) => {

  const id = generateRandomString();
  const email = req.body.email;
  const emailFound = findUserEmail(users, email);
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id,
    email: req.body.email,
    password: hashedPassword,
  };

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("email/password cant be empty");
  };

  if (emailFound) {
    return res.status(400).send("An account has already been registered to that email adress.");
  }

  users[id] = newUser;
  req.session.user_id = id;
  res.redirect("/urls");

});

//Server Listening 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 