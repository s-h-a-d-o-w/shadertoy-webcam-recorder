const express = require('express');
const app = express();

// Heroku sets PORT as environment variable automatically
const port = process.env.PORT || 3000

console.log('Using production bundle');
app.use(express.static(__dirname + '/dist'));

app.listen(port, function () {
	console.log(`Listening on port ${port}!\n`);
});
