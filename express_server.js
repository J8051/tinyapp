const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Original Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Users Object
const users = {

};

function generateRandomString() {
  let sixCharacterUniqueId = "";
  let characters = "abcdefghijklmnopqrstuvwxyz123456789";
  let charArr = characters.split("");
  for (let i = 0; i < 6; i++) {
    sixCharacterUniqueId += charArr[Math.round(Math.random() * charArr.length)];
  };
  return sixCharacterUniqueId;
}

//ROUTES//
app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");

});

//URLS ROUTES// 

//loads the urls page 
app.get("/urls", (req, res) => {

  const userId = req.cookies.user_id;

  const templateVars = {
    urls: urlDatabase,
    users,
    userId
  };
  res.render("urls_index", templateVars);
});

// loads the page for creating new urls 
app.get("/urls/new", (req, res) => {

  const userId = req.cookies.user_id;

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

// creates shortened urls 
app.post("/urls", (req, res) => {

  const userId = req.cookies.user_id;
 
  if (!userId) {
    return res.status(404).send("you must be logged in to shorten urls");
  };

  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;

  res.redirect(`/urls/${shortUrl}`);

});

//ID PARAMETER ROUTES//  

//loads the page for editing the url entered 
app.get("/urls/:id", (req, res) => {

  const id = req.params.id;
  const longURL = urlDatabase[id];
  const userId = req.cookies.user_id;

  const templateVars = {
    urls: urlDatabase,
    userId,
    id,
    longURL,
    users,
  };

  res.render("urls_show", templateVars);

});

//allows a user to delete a url & id
app.post("/urls/:id/delete", (req, res) => {
  
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");

});

// redirects user to webpage associated with the id entered  
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];

  if (!Object.keys(urlDatabase).includes(id)) {
    return res.status(404).send("That id does not exist");
  };
  
  res.redirect(longURL);

});

//edits long urls
app.post("/urls/:id", (req, res) => {
  
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;

  res.redirect("/urls");

});

//LOGIN ROUTES//

//loads the login page
app.get("/login", (req, res) => {

  const userId = req.cookies.user_id;

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

//validates the login info and creates a cookie 
app.post("/login", (req, res) => {

  const userId = req.cookies.user_id;
  const email = req.body.email;
  const password = req.body.password;
  let user;

  for (const userId in users) {
    if (users[userId].email === email) {
      user = users[userId];
      res.cookie("user_id", userId);
      res.redirect("/urls");
    }
  }; 

  if (!user) {
    return res.status(403).send("email not found");
  }

  if (user.password !== password) {
    return res.status(403).send("incorrect password");
  }

});

//LOGOUT ROUTES

// logs out the user & clears cookies 
app.post("/logout", (req, res) => {

  const userId = req.cookies.user_id;

  res.clearCookie("user_id");
  res.redirect("/login");

});

//REGISTER ROUTES 

//loads the registration page 
app.get("/register", (req, res) => {

  const userId = req.cookies.user_id;

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

//validates the registration 
app.post("/register", (req, res) => {

  const userId = generateRandomString();

  const newUser = {
    userId,
    email: req.body.email,
    password: req.body.password,
  };

  if (req.body.email === "" || req.body.password === "") {
    return res.sendStatus(400).send("email/password cant be empty");
  };

  for (const user in users) {
    if (req.body.email === users[user].email) {
      return res.sendStatus(400).send("An account has already been registered to that email adress.");
    }
  };

  users[userId] = newUser;
  res.cookie("user_id", userId);
  res.redirect("/urls");

});

//Server Listening 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 