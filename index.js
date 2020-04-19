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
	var stmtCategory = "select distinct(l9_quotes.category) from l9_quotes;";
	// var stmtNames = "select firstname, lastName from l9_author"			
	var stmtNames = "select * from l9_author"
	
	var fullnames = [];
	var authors = null
	connection.query(stmtNames,function(error,found){
    	if(error) throw error;
		if(found.length){
			found.forEach(function(f){
				console.log(f.firstName + " " + f.lastName);
				
				fullnames.push(f.firstName + " " + f.lastName);

			})
			// console.log(found);
			authors = found;			
			
		}
    });
    
	var categories = [];
	connection.query(stmtCategory,function(error,found){
	
    	if(error) throw error;
		if(found.length){
			found.forEach(function(f){
				console.log(f.category);
				categories.push(f.category);
			})
			
			
		}
	    res.render('home', {categories:categories,fullnames:fullnames,authors:authors});
	
    });
});

app.get("/quoteAuthor", function(req, res) {
    var name = req.query.name;
    console.log(name);
    var fname = name.split(" ").splice(0,1);
    var lname = name.split(" ").splice(1,2);
    console.log(fname, lname);

    
    
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
			console.log(found);
			authors = found; // this gets us all of the data from the database of the given author
		}
		res.render('quotes', {keyword:keyword, authors:authors});
    	
    });
});

// app.get("/author", function(req, res){
// 	var firstName = req.query.firstname;
// 	var lastName = req.query.lastname;
// 	var statement = 'select * ' + 
// 					'from l9_author left outer join l9_quotes on ' +
// 					'l9_author.authorId = l9_quotes.authorId ' +
// 					'where l9_author.firstname=\'' + firstName + '\' ' + 
// 					'and l9_author.lastName=\'' + lastName + '\';';
// 	console.log(statement);
// 	connection.query(statement,function(error,found){
// 		var authors = null;
// 		if(error) throw error;
// 		if(found.length){
// 			authors = found; // this gets us all of the data from the database of the given author
// 		}
// 		res.render('quotes', {keyword:firstName,authors:authors});
// 	});
// });


app.get("/gender",function(req, res){
	var gender = req.query.gender;
	var stmt = 'select * ' +
               'from l9_quotes natural join l9_author ' +
               'where sex=\'' + gender + '\';';
    connection.query(stmt, function(error, found){
    	var authors = null;
    	if(error) throw error;
		if(found.length){
			console.log(found);
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
