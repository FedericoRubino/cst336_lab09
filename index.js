/*


*/

var express = require("express");
// var bodyParser = require("body-parser");
var mysql = require("mysql");
var app = express();


/* Configure mysql dbms */

const connection = mysql.createConnection({
	host: "localhost",
	user: "frubino",
	password: "frubino",
	database: "new_database"
});

connection.connect();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static("css"));
// app.use(bodyParser.urlencoded({extended:true}));


app.get("/", function(req, res){
    res.render("home")
    
});

app.get("/author", function(req, res){
	var firstName = req.query.firstname;
	var lastName = req.query.lastname;
	var statement = 'select * ' + 
					'from l9_author ' + 
					'where firstname=\'' + firstName + '\'' + 
					'and lastName=\'' + lastName + '\';';
	connection.query(statement,function(error,found){
		var author = null;
		if(error) throw error;
		if(found.length){
			author = found[0]; // this gets us all of the data from the database of the given author
			author.dob = author.dob.toString().split(" ").splice(0,4).join(" ");
			author.dod = author.dod.toString().split(" ").splice(0,4).join(" ");
		}
		res.render('author', {author:author});
	});
});


app.get("/author/:authorId", function(req, res){
	var statement = 'select firstName, lastName, quote ' + 
					'from l9_author natural join l9_quotes ' +
					'where l9_author.authorId=' + req.params.authorId + ';';
	connection.query(statement,function(error,found){
		if(error) throw error;
		if(found.length){
			var name = found[0].firstName + ' ' + found[0].lastName;
			res.render('quotes', {name: name, quotes:found});
			
		}
	});
});

app.get("/*", function(req, res){
	res.render("error");
});

app.listen(process.env.PORT || 3000, function(){
	console.log("Server is running...");
});
