const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const HTTP_PORT = process.env.PORT || 8080;
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

app.get("/addemployee",(request,response)=>{
    response.render('addemployee');
});

app.get("/images",(request,response)=>{
    response.render('images');
});

app.listen(HTTP_PORT,()=>{
    console.log(`Server is listening to port ${HTTP_PORT}`);
});