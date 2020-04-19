/*
Author: Federico Rubino
email: frubino@csumb.edu
Lab09
*/

var express = require("express");
var mysql = require("mysql");
var app = express();

/* Configure mysql dbms */
const connection = mysql.createConnection({
	host: "un0jueuv2mam78uv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
	user: "hz5nbp4iluujbllh",
	password: "s7xzbnqojilaz860",
	database: "p6zg6wa2vkqv2y4c"
});

connection.connect();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static("css"));

app.get("/", function(req, res){
	var stmtCategory = "select distinct(l9_quotes.category) from l9_quotes;";
	var stmtNames = "select * from l9_author"
	
	var fullnames = [];
	var authors = null
	connection.query(stmtNames,function(error,found){
    	if(error) throw error;
		if(found.length){
			found.forEach(function(f){
				fullnames.push(f.firstName + " " + f.lastName);
			})
			authors = found;			
		}
    });
    
	var categories = [];
	connection.query(stmtCategory,function(error,found){
    	if(error) throw error;
		if(found.length){
			found.forEach(function(f){
				categories.push(f.category);
			})
		}
	    res.render('home', {categories:categories,fullnames:fullnames,authors:authors});
    });
});

app.get("/quoteAuthor", function(req, res) {
    var name = req.query.name;
    var fname = name.split(" ").splice(0,1);
    var lname = name.split(" ").splice(1,2);
    var statement = "select * from l9_quotes natural join l9_author "+
    				"where l9_author.firstName = '" + fname + "'" +
    				"and l9_author.lastName='"+ lname + "';" ; 
    connection.query(statement,function(error,found){
    	var authors = null;
    	if(error) throw error;
		if(found.length){
			authors = found; // this gets us all of the data from the database of the given author
		}
		res.render('quotes', {keyword:name, authors:authors});
    });
});

app.get("/quoteCategory", function(req, res) {
    var categ = req.query.category;
    var statement = "select * from l9_quotes natural join l9_author "+
    				"where l9_quotes.category = '" + categ + "';" ; 
    connection.query(statement,function(error,found){
    	var authors = null;
    	if(error) throw error;
		if(found.length){
			authors = found; // this gets us all of the data from the database of the given author
		}
		res.render('quotes', {keyword:categ, authors:authors});
    });
});

app.get("/quoteKeyword", function(req, res) {
    var keyword = req.query.keyword;
    var statement = "select * from l9_quotes natural join l9_author where l9_quotes.quote like '%" +keyword+ "%'" ; //TODO: more here
    connection.query(statement,function(error,found){
    	var authors = null;
    	if(error) throw error;
		if(found.length){
			authors = found; // this gets us all of the data from the database of the given author
		}
		res.render('quotes', {keyword:keyword, authors:authors});
    });
});

app.get("/gender",function(req, res){
	var gender = req.query.gender;
	var stmt = 'select * ' +
               'from l9_quotes natural join l9_author ' +
               'where sex=\'' + gender + '\';';
    connection.query(stmt, function(error, found){
    	var authors = null;
    	if(error) throw error;
		if(found.length){
			authors = found; // this gets us all of the data from the database of the given author
		}
		if(gender == "F"){
			gender = "Female"
		} else {
			gender = "Male"
		}
		res.render('quotes', {keyword:gender, authors:authors});     
    });
});

app.get("/author/:authorId", function(req, res){
	var authorId = req.params.authorId;
	var statement = "select * from l9_author where authorId=" + 
					authorId + ';';
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

app.get("/*", function(req, res){
	res.render("error");
});

app.listen(process.env.PORT || 3000, function(){
	console.log("Server is running...");
});
