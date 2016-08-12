const http = require('http');
const routes = require('patterns')();
const SpotifyWebApi = require('spotify-web-api-node');
const _ = {
	forOwn: require('lodash/forOwn'),
	shuffle: require('lodash/shuffle'),
};

const spotifyApi = new SpotifyWebApi({
	clientId: '6c926cf5c6cd4f2ead716ce1b20d9ef7',
	clientSecret: '36a13c94552449a79f856abfeabc0455',
});

const genres = require('./lib/genres');

spotifyApi.clientCredentialsGrant().then(data => {
	spotifyApi.setAccessToken(data.body.access_token);
}, err => {
	console.log('Something went wrong when retrieving an access token', err);
});

routes.add('GET /recommendations/{emoji}', (req, res) => {
	res.setHeader('content-type', 'text/html');

	const emoji = decodeURIComponent(req.params.emoji);
	const foundGenres = [];

	_.forOwn(genres, (emojis, genre) => {
		console.log(genre);
		emojis.every(g => {
			console.log(g);
			if (g === emoji) {
				foundGenres.push(genre);
				return false;
			}

			return true;
		});
	});

	console.log(foundGenres);

	if (!foundGenres.length) {
		res.end('Nothing found 😞');
	}

	spotifyApi.getRecommendations({
		seed_genres: _.shuffle(foundGenres).slice(0, 4),
		min_popularity: 50,
	}).then(data => {
		const output = [];

		data.body.tracks.forEach(track => {
			output.push({
				artist: track.artists[0].name,
				title: track.name,
			});
		});

		res.end(JSON.stringify(output));
	}, error => {
		console.log(error);
		res.end('There was an error');
	});
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
server.listen(9000, () => {
	console.log('Server is running on http://localhost:9000');
});
