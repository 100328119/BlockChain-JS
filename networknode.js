const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();

const port = process.argv[2];
const api = require('./routes/api');
const full_node = require('./NodeIni');

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/api', api);



// define the port for runnign server

app.listen(port, function (err) {
  if (err) return err;
  console.log(`App is listening on port ${port}`);
});
