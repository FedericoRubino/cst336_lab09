/*


*/

var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var app = express();


/* Configure mysql dbms */

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "quotes_db"
});
connection.connect();


app.set('view engine', 'ejs');

app.use(express.static('public'));


app.use(express.static("css"));

app.use(bodyParser.urlencoded({extended:true}));



app.get("/", function(req, res){
    res.render("home")
    
});

app.get("/result", function(req, res){
	res.render("result");
});

app.get("/author", function(req, res){
	res.render("author");
});


app.get("/author/:authorId", function(req, res){
	res.render("quotes");
});

app.get("/*", function(req, res){
	res.render("error");
});

app.listen(process.env.PORT || 3000, function(){
	console.log("Server is running...");
});
