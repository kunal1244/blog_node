const express = require('express');
const config = require('./config/config.js');
const app = express();


app.listen(process.env.PORT || 3000,()=>{
    console.log('Listening on ' + 3000);
});


require('./config/express')(app, config);
require('./config/passport')();
require('./config/routes')(app);