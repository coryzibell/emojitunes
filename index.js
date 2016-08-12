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

// routes.add('GET /recommendations/{emoji}', (req, res) => {
//
// });

routes.add('GET /recommendations-browser/{emoji}', (req, res) => {
	getRecommendations(req).then(recommendations => {
		if (!recommendations.tracks && recommendations.tracks.length) {
			res.end('Nothing found 😞');
			return;
		}

		const output = [];

		recommendations.tracks.forEach(track => {
			output.push(`
				<iframe src="https://embed.spotify.com/?uri=${track.url}"
						width="300"
						height="380
						frameborder="0"
						style="border: 0;"
						allowtransparency="true">
				</iframe>
			`);
		});

		res.end(`
			<h1 style="text-align: center; text-transform: capitalize;">${recommendations.genres.join(', ')}</h1>
			<div style="width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap;">
				${output.join('<br />')}
			</div>
		`);
	}, error => {
		console.log(error);
		res.end('There was an error 😢');
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

function getRecommendations(req) {
	const emoji = decodeURIComponent(req.params.emoji);
	const foundGenres = [];

	_.forOwn(genres, (emojis, genre) => {
		emojis.every(g => {
			if (g === emoji) {
				foundGenres.push(genre);
				return false;
			}

			return true;
		});
	});

	const shuffledFoundGenres = _.shuffle(foundGenres).slice(0, 4);

	console.log(shuffledFoundGenres);

	if (!foundGenres.length) {
		return false;
	}

	return new Promise((resolve, reject) => {
		spotifyApi.getRecommendations({
			seed_genres: shuffledFoundGenres,
			min_popularity: 50,
		}).then(data => {
			const tracks = [];

			data.body.tracks.forEach(track => {
				tracks.push({
					artist: track.artists[0].name,
					title: track.name,
					url: track.external_urls.spotify,
				});
			});

			resolve({
				genres: shuffledFoundGenres,
				tracks,
			});
		}, error => {
			reject(error);
		});
	});
}
