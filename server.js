const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const HTTP_PORT = process.env.PORT || 8080;
app.engine('.hbs',exphbs({
    extname: '.hbs',
    defaultLayout: 'main'
}));
app.set('view engine','.hbs');

app.use(express.static('public'));

app.get("/",(request,response)=>{
    response.render('index');
});

app.listen(HTTP_PORT,()=>{
    console.log(`Server is listening to port ${HTTP_PORT}`);
});