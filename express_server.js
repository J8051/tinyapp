const express = require("express"); 
const app = express(); 
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Original Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; 


function generateRandomString() {
  let sixCharacterUniqueId = ""; 
  let characters = "abcdefghijklmnopqrstuvwxyz123456789";
  let charArr = characters.split("");
  for (let i = 0; i <6; i++) { 
    sixCharacterUniqueId += charArr[Math.round(Math.random() * charArr.length)];  
  };
  return sixCharacterUniqueId; 
}

//Routes 
app.get("/", (req, res) => {
  res.send("Hello");
}); 

app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase); 
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; 
  res.render("urls_index", templateVars); 
}); 

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  console.log(req.params);
  const longURL = urlDatabase[id];
  const templateVars = { id: req.params.id, longURL: longURL};
  res.render("urls_show", templateVars);
}); 

app.post("/urls", (req, res) => { 
  const shortUrl = generateRandomString(); 
  urlDatabase[shortUrl] = req.body.longURL;
  console.log(urlDatabase); 
  //console.log(req.body)// Log the POST request body to the console
    res.redirect(`/urls/${shortUrl}`);
  //res.send("ok"); // Respond with 'Ok' (we will replace this)
})

app.post("/urls/:id/delete", (req, res) => { 
  const id = req.params.id;
  delete urlDatabase[id];

    res.redirect("/urls");

})

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//Server Listening 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); 
}); 