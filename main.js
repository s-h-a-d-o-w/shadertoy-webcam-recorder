const path = require('path');
const compression = require('compression');
const express = require('express');

const app = express();

// Heroku sets PORT as environment variable
const port = process.env.PORT || 3000;

console.log('Using production bundle');
app.use(compression());
app.use(express.static(path.join(__dirname, '/dist'), {
	setHeaders: (res, path, stat) => {
		if(path.indexOf('index.html') > 0) {
			// Maybe use server push via cloud flare in the future:
			// https://www.cloudflare.com/website-optimization/http2/serverpush/
			// Especially since the following works with Chrome but not Firefox
			res.set('Link', '<fonts/Montserrat-Light.woff>; rel=preload; as=font, <ffmpeg-worker-webm.js>; rel=preload; as=script');
		}
	},
}));

app.listen(port, function() {
	console.log(`Listening on port ${port}!\n`);
});
