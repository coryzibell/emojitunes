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

const genres = {
	'acoustic': [],
	'afrobeat': [],
	'alt-rock': [],
	'alternative': [],
	'ambient': [],
	'anime': [],
	'black-metal': [
		'🤘',
	],
	'bluegrass': [],
	'blues': [],
	'bossanova': [],
	'brazil': [
		'🇧🇷',
	],
	'breakbeat': [],
	'british': [
		'🇬🇧',
	],
	'cantopop': [],
	'chicago-house': [],
	'children': [],
	'chill': [],
	'classical': [],
	'club': [],
	'comedy': [],
	'country': [],
	'dance': [],
	'dancehall': [],
	'death-metal': [
		'🤘',
	],
	'deep-house': [
		'🙌',
	],
	'detroit-techno': [],
	'disco': [],
	'disney': [],
	'drum-and-bass': [
		'🙌',
	],
	'dub': [],
	'dubstep': [
		'🙌',
	],
	'edm': [
		'🙌',
	],
	'electro': [],
	'electronic': [
		'🙌',
	],
	'emo': [],
	'folk': [],
	'forro': [],
	'french': [
		'🇫🇷',
	],
	'funk': [],
	'garage': [],
	'german': [
		'🇩🇪',
	],
	'gospel': [],
	'goth': [],
	'grindcore': [
		'🤘',
	],
	'groove': [],
	'grunge': [],
	'guitar': [],
	'happy': [],
	'hard-rock': [
		'🤘',
	],
	'hardcore': [
		'🤘',
	],
	'hardstyle': [],
	'heavy-metal': [
		'🤘',
	],
	'hip-hop': [],
	'holidays': [],
	'honky-tonk': [],
	'house': [
		'🙌',
	],
	'idm': [
		'🤓',
	],
	'indian': [
		'🇮🇳',
	],
	'indie': [],
	'indie-pop': [],
	'industrial': [],
	'iranian': [],
	'j-dance': [
		'🇯🇵',
	],
	'j-idol': [
		'🇯🇵',
	],
	'j-pop': [
		'🇯🇵',
	],
	'j-rock': [
		'🇯🇵',
	],
	'jazz': [],
	'k-pop': [
		'🇰🇷',
	],
	'kids': [],
	'latin': [],
	'latino': [],
	'malay': [],
	'mandopop': [],
	'metal': [
		'🤘',
	],
	'metal-misc': [
		'🤘',
	],
	'metalcore': [
		'🤘',
	],
	'minimal-techno': [
		'🙌',
	],
	'movies': [],
	'mpb': [],
	'new-age': [],
	'new-release': [],
	'opera': [],
	'pagode': [],
	'party': [],
	'philippines-opm': [],
	'piano': [],
	'pop': [],
	'pop-film': [],
	'post-dubstep': [],
	'power-pop': [],
	'progressive-house': [],
	'psych-rock': [],
	'punk': [],
	'punk-rock': [],
	'r-n-b': [],
	'rainy-day': [],
	'reggae': [],
	'reggaeton': [],
	'road-trip': [],
	'rock': [
		'🤘',
	],
	'rock-n-roll': [],
	'rockabilly': [],
	'romance': [],
	'sad': [],
	'salsa': [],
	'samba': [],
	'sertanejo': [],
	'show-tunes': [],
	'singer-songwriter': [],
	'ska': [],
	'sleep': [],
	'songwriter': [],
	'soul': [],
	'soundtracks': [],
	'spanish': [
		'🇪🇸',
	],
	'study': [],
	'summer': [],
	'swedish': [
		'🇸🇪',
	],
	'synth-pop': [],
	'tango': [],
	'techno': [
		'🙌',
	],
	'trance': [
		'🙌',
	],
	'trip-hop': [],
	'turkish': [
		'🇹🇷',
	],
	'work-out': [],
	'world-music': [
		'🌏',
	],
};

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
