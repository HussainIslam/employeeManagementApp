const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
var upload = multer();
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;
const exphbs = require('express-handlebars');
const HTTP_PORT = process.env.PORT || 8080;
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var uri = "mongodb://hussain:Junk%406204@web322-shard-00-00-o4pvl.mongodb.net:27017,web322-shard-00-01-o4pvl.mongodb.net:27017,web322-shard-00-02-o4pvl.mongodb.net:27017/test?ssl=true&replicaSet=web322-shard-0&authSource=admin&retryWrites=truemongodb://localhost:27017/restful"
mongoose.connect(uri,{useNewUrlParser: true});
var employeedb = new Schema({
    fName: String,
    lName: String,
    email: String,
    designation: String,
    department: String,
    address1: {
        type: String,
        required: true
    },
    address2: String,
    apartment: Number,
    city: String,
    province: String,
    postal: String,
    mangerid: Number,
    dob: Date,
    status: String,
    employeeimage: {
        data: Buffer,
        contentType: String
    }
});
var database = mongoose.model("employeedb",employeedb);
var connection = mongoose.connection;

connection.once("open",()=>{
    console.log("Database connected");
    database.find({})
    .exec()
    .then((data)=>{
       // console.log(data);
    })
});

app.engine('.hbs',exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: (url,options)=>{
            return '<a ' +((url == app.locals.activeRoute) ? 'class="nav-item nav-link active"' : 'class= "nav-item nav-link"')
                    +' href="' + url + '">' + options.fn(this) + ((url == app.locals.activeRoute) ? '<span class="sr-only">(current)</span>' : '') 
                    +'</a>';
        }
    }
}));

app.set('view engine','.hbs');

app.use(express.static('public'));
app.use((request,response,next)=>{
    let route = request.baseUrl +request.path;
    app.locals.activeRoute = (route == '/') ? '/' : route.replace(/\/$/,"");
    next(); 
});


app.get("/",(request,response)=>{
    response.render('index');
});

app.get("/employees",(request,response)=>{
    database.find({})
    .exec()
    .then((data)=>{
        response.render('employees',{
            employee: data
        });
    })
    .catch((error)=>{
        response.send(error);
    });
});

app.post("/employees",(request,response)=>{
    database.find({_id: request.body.id})
    .exec()
    .then((data)=>{
        response.json({ employee: data });
    })
    .catch((error)=>{
        response.json({ message: error });
    });
});


app.get("/addemployee",(request,response)=>{
    response.render('addemployee');
});

app.post("/addemployee",upload.single('employeeimage'),(request,response,next)=>{
    let employeeData = new database(request.body);
    employeeData.save((error)=>{
        if(error){
            response.send(error);
        } else {
            response.redirect("/");
        }
    });
});

app.get("/images",(request,response)=>{
    response.render('images');
});

app.listen(HTTP_PORT,()=>{
    console.log(`Server is listening to port ${HTTP_PORT}`);
});