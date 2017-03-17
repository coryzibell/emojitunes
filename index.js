// require http, routing modules
const http = require('http')
const routes = require('patterns')()

// require spotify and initialise Spotify
const SpotifyWebApi = require('spotify-web-api-node')
const spotifyApi = new SpotifyWebApi({
  clientId: '6c926cf5c6cd4f2ead716ce1b20d9ef7',
  clientSecret: '36a13c94552449a79f856abfeabc0455'
})

const emoji = require('node-emoji')

// lodash helper functions
const _ = {
  forOwn: require('lodash/forOwn'),
  shuffle: require('lodash/shuffle')
}

// object of genres, each with an array of emojis
const genres = require('./lib/genres')

// fetch spotify access token
// clientCredentials method does not require user authentication
spotifyApi.clientCredentialsGrant().then(data => {
  spotifyApi.setAccessToken(data.body.access_token)
}, error => {
  console.log('Error retrieving access token', error)
})

// get recommendations API route
// @params emoji e.g 🤘
// @return JSON object containing genre and track arrays
routes.add('GET /recommendations/{emoji}', (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  const decodedEmojiParam = decodeURIComponent(req.params.emoji)
  let foundEmoji = false

	// param is actual emoji e.g 🤘
  if (emoji.which(decodedEmojiParam)) {
    foundEmoji = decodedEmojiParam

	// param is txt emoji e.g :the_horns:
  } else if (emoji.which(emoji.get(decodedEmojiParam))) {
    foundEmoji = emoji.get(decodedEmojiParam)
  } else {
    res.end(JSON.stringify({
      error: 'Emoji not supported'
    }))
  }

  getRecommendations(foundEmoji).then(
		recommendations => res.end(JSON.stringify(recommendations)),
		error => res.end(JSON.stringify(error))
	)
})

// get recommendations and return grid of Spotify play button iframes
routes.add('GET /recommendations-browser/{emoji}', (req, res) => {
  res.setHeader('Content-Type', 'text/html')

  const decodedEmojiParam = decodeURIComponent(req.params.emoji)
  let foundEmoji = false

	// param is actual emoji e.g 🤘
  if (emoji.which(decodedEmojiParam)) {
    foundEmoji = decodedEmojiParam

	// param is txt emoji e.g :the_horns:
  } else if (emoji.which(emoji.get(decodedEmojiParam))) {
    foundEmoji = emoji.get(decodedEmojiParam)
  } else {
    res.end('Emoji not supported')
  }

  getRecommendations(foundEmoji).then(recommendations => {
		// no tracks found
    if (!recommendations.tracks.length) {
      res.end('Nothing found 😞')
      return
    }

    const output = []

		// loop through recommendations and build up array of iframes
    recommendations.tracks.forEach(track => {
      output.push(`
				<iframe src="https://embed.spotify.com/?uri=${track.url}"
						width="300"
						height="380
						frameborder="0"
						style="border: 0;"
						allowtransparency="true">
				</iframe>
			`)
    })

		// render flex box grid of iframes with title of comma separated genres
    res.end(`
			<h1 style="text-align: center; text-transform: capitalize;">${recommendations.genres.join(', ')}</h1>
			<div style="width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap;">
				${output.join('<br />')}
			</div>
		`)
  }, error => {
    console.log('Error fetching recommendations', error)
    res.end('No genres match emoji')
  })
})

// create server
const server = http.createServer((req, res) => {
	// match routes
  const match = routes.match(`${req.method} ${req.url}`)

	// if match found call function
  if (match) {
    const fn = match.value
    req.params = match.params
    fn(req, res)
  } else {
    res.end('404')
  }
})

// listen for http request on port 9000
server.listen(9000, () => {
  console.log('🤘 Server is running on http://localhost:9000 🤘')
})

// find genres matching emoji and fetch recommendations from Spotify
// @params emoji e.g 🤘
function getRecommendations(emoji) {
  const foundGenres = []

	// loop through genres object
  _.forOwn(genres, (emojis, genre) => {
		// loop through genre's emojis
    emojis.every(g => {
			// if emoji found add genre to foundGenres and break loop
      if (g === emoji) {
        foundGenres.push(genre)
        return false
      }

      return true
    })
  })

	// shuffle the genres we found
  const shuffledFoundGenres = _.shuffle(foundGenres).slice(0, 4)

  console.log(shuffledFoundGenres)

	// return promise and wait for Spotify API call
  return new Promise((resolve, reject) => {
    if (!foundGenres.length) {
      reject({
        'error': 'No genres match emoji'
      })
    }

		// fetch recommendations from spotify using shuffle genres found above
    spotifyApi.getRecommendations({
      seed_genres: shuffledFoundGenres,
      min_popularity: 50
    }).then(data => {
      const tracks = []

			// loop through each track and add object containing artist, title, url
      data.body.tracks.forEach(track => {
        tracks.push({
          artist: track.artists[0].name,
          title: track.name,
          url: track.external_urls.spotify
        })
      })

			// resolve promise and return shuffled genres and tracks
      resolve({
        genres: shuffledFoundGenres,
        tracks
      })
		// error fetching recommendations from Spotify
		// reject promise
    }, error => {
      reject({
        error
      })
    })
  })
}
