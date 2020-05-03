/*
Author: Federico Rubino
email: frubino@csumb.edu
Lab09
*/

var express = require("express");
var mysql = require("mysql");
var bcrypt = require('bcrypt');
var session = require('express-session');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');


var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));



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

app.use(session({
	secret: "wabbadubbadubdub!!",
	resave: true,
	saveUninitialized: true
}));


/* Middleware functions */
function isAuthenticated(req, res, next){
	if(!req.session.authenticated){ 
		res.redirect('/login');
	} else next();
}


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
	    res.render('home', {categories:categories,fullnames:fullnames,authors:authors, admin:req.session.authenticated});
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


/* 

additions for lab 10!!!

*/

/* logout rout */
app.get('/logout', isAuthenticated, function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

// get's you to the login page
app.get("/login", function(req, res) {
    res.render("login");
});


/* login an admin */
app.post("/admin/login", function(req, res){
	let admin = "admin";
	let password = "admin"; 
	var usernameMatch = admin == req.body.username;
	var passwordMatch = password == req.body.password;
	
	if(passwordMatch && usernameMatch){
		req.session.authenticated = true;
		res.redirect('/');	
	} else {
		req.session.authenticated = false;
		res.render('login', {error: true});
	}
});


//path to the admin page
app.get("/admin/page", isAuthenticated, function(req,res){
	var statement = "Select * from l9_author"
	connection.query(statement,function(error, found) {
	   if(error) throw error;
	   var authors = null;
	   if(found.length){
	   		authors = found;
	   		authors.forEach(function(author){
   				author.dob = author.dob.toString().split(" ").splice(0,4).join(" ");
				author.dod = author.dod.toString().split(" ").splice(0,4).join(" ");
	   		})
			res.render("adminPage", {authors:authors});
	   }
	});
});



/* sends us to the create new author page */
app.get("/new_author",isAuthenticated, function(req, res) {
   res.render('new_author'); 
});

app.post("/author/new",isAuthenticated, function(req, res) {
	var authorId = -1;
	let firstname = req.body.Firstname;
	let lastname = req.body.Lastname;
	let sex = req.body.sex;
	let dob = req.body.dob;
	let dod = req.body.dod;
	let profession = req.body.profession;
	connection.query('SELECT COUNT(*) FROM l9_author;', function(error, found){
	    if(error) throw error;
	    if(found.length){
			// console.log(found[0]['COUNT(*)'] + 1);
	    	authorId = found[0]['COUNT(*)'] + 1;
    		var statement = "INSERT INTO l9_author (authorId, firstName, lastName, dob, dod, sex, profession, country, portrait, biography) VALUES(?,?,?,?,?,?,?,?,?,?);";
			connection.query(statement,[authorId,firstname,lastname,dob,dod,sex,profession," "," "," "],function(error,result){
				if(error) throw error;
				res.redirect("/admin/page");
			});
	    }
	});
});

/* sends us to the edit page for author */
app.get("/author/:authrId/edit", isAuthenticated, function(req, res){
	var authorId = req.params.authrId;
    var statement = "select * from l9_author "+
    				"where authorId=" + authorId + ";" ; 
    connection.query(statement,function(error,found){
    	var author = null;
    	if(error) throw error;
		if(found.length){
			author = found[0]; // this gets us all of the data from the database of the given author
		}
		res.render('edit_author', {author:author});
    });
});

/* updates the user information */
app.put("/update/:authrID", isAuthenticated, function(req, res) {
    console.log(req.body);
    
    var statement = "UPDATE l9_author SET " +
    				"firstName = '" + req.body.Firstname + "'," +
    				"lastName  = '" + req.body.Lastname + "'," +
    				"sex = '" + req.body.sex + "'," +
    				"profession = '" + req.body.profession + "'" +
    				"WHERE authorID = " + req.params.authrID + ";";
    console.log(statement);
    connection.query(statement,function(error, found) {
        if(error) throw error;
	    res.redirect("/admin/page");
    })
})


/* delete a user - needs some protection */
app.get("/author/:authrId/delete", isAuthenticated, function(req, res) {
    var statement = "DELETE FROM l9_author where authorId=" + req.params.authrId + ";";
    connection.query(statement, function(error, found) {
        if(error) throw error;
        res.redirect("/admin/page");
    });
});

app.get("/*", function(req, res){
	res.render("error");
});

app.listen(process.env.PORT || 3000, function(){
	console.log("Server is running...");
});
