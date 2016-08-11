const http = require('http');
const routes = require('patterns')();
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
	clientId : '6c926cf5c6cd4f2ead716ce1b20d9ef7',
	clientSecret : '36a13c94552449a79f856abfeabc0455',
});

routes.add('GET /', (req, res, params) => {
	res.end('hello world');
});

const server = http.createServer((req, res) => {
	const match = routes.match(`${req.method} ${req.url}`);

	if (match) {
		const fn = match.value;
		req.params = match.params;
		fn(req, res);
	}
});

// listen for http request on port 9090
server.listen(6969, () => {
 	console.log('Server is running on http://localhost:6969');
});
