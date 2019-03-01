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
var uri = "mongodb://localhost:27017/restful"
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

app.delete("/employees",(request,response)=>{
    database.deleteOne({_id: request.body.id})
    .exec()
    .then((data)=>{
        response.json({message: "Data deleted"});
    })
    .catch((error)=>{
        response.json({error: "There was an error"});
    })
});

// app.put("/employees",(request,response)=>{
//     console.log("The first one is working");
//     response.redirect('/updateemployee');
//     //response.json({message: "Data updated"});
// });

app.get("/updateemployee",(request,response)=>{
    console.log("the second one is also working");
    response.render('updateEmployee');
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