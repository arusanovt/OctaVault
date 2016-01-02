var app = require('./app');

//Simple server bind
app.listen(app.get('port') || 4000);
