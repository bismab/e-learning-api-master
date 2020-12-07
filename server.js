const express = require('express');
const app = express();
require('express-async-errors');
const error = require('./middlewares/promisesErrorHandler');
const config = require('config');
const mongoose = require('mongoose');
const cors = require('cors');
const Joi = require('@hapi/joi');
const hbs = require('handlebars');
Joi.objectId = require('joi-objectid')(Joi);
const compression = require('compression');
const morgan = require('morgan');
const http = require('http').createServer(app);
// const io = require('socket.io')(http);

app.use(compression());
app.use('/public', express.static('public'));
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));

//api modules
require('./app/users/routes_definations/userRoutesDef')(app);
require('./app/quiz/routes_definations/quizRoutesDef')(app);
require('./app/contract/routes_definations/contractRoutesDef')(app);
require('./app/class_room/routes_definations/classRoutesDef')(app);
require('./app/training/routes_definations/trainingRoutesDef')(app);
require('./app/levels/routes_definations/levelRoutesDef')(app);
require('./app/sessions/routes_definations/sessionRoutesDef')(app);

// init handlebars custom helpers
require('./helper_functions/handleBars.helper').init(hbs);


app.use(error);

mongoose
  .connect(config.get('dbConnection'), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('connected to the db......');
    //migrations
    require('./helper_functions/migrations')();
  })
  .catch(err => {
    console.log('Érror .....', err.message);
  });

const port = process.env.PORT || 9009;
http.listen(port, () => {
  console.log(`We are in ${config.get('mode')} mode!`);
  console.log(`listening port ${port}`);
});
