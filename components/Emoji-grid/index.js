import request from 'superagent'
import emojis from 'node-emoji/lib/emoji.json'

export default class Search {
  constructor(opts) {
    this.container = document.querySelector(opts.container)
    this.search = document.querySelector(opts.search)
    this.list = document.createElement('ul')

    Object.entries(emojis).map(emoji => this.addEmojiNode(emoji))

    this.list.classList.add('Emoji-grid__list')
    this.container.appendChild(this.list)

    this.search.addEventListener('keyup', e => this.filterEmojis(e))
  }

  addEmojiNode(emoji) {
    const child = document.createElement('li')
    let [emojiName, emojiCode] = emoji
    child.classList.add('Emoji-grid__item')
    child.setAttribute('data-emoji', emojiName)
    child.innerHTML = emojiCode
    child.addEventListener('click', e => this.getRecommendations(e.currentTarget.innerHTML))

    this.list.appendChild(child)
  }

  filterEmojis(e) {
    this.list.querySelectorAll('[data-emoji]').forEach(item => {
      if (!item.getAttribute('data-emoji').includes(e.currentTarget.value)) {
        item.classList.add('Emoji-grid__item--hide')
      } else {
        item.classList.remove('Emoji-grid__item--hide')
      }
    })
  }

  getRecommendations(emoji) {
    console.log(emoji)
    request
      .get(`http://localhost:9000/recommendations/${emoji}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          console.log('Error getting recommendations', err)
          return
        }

        const json = JSON.parse(res.text)

        if (json.error) {
          console.log(json.error)
          return
        }

        this.showRecommendations(json.tracks)
      })
  }

  showRecommendations(tracks) {
    this.container.innerHTML = ''
    tracks.forEach(track => {
      const trackContainer = document.createElement('div')
      trackContainer.style.display = 'inline'
      const iframe = `
        <iframe src="https://embed.spotify.com/?uri=${track.url}"
            width="300"
            height="380
            frameborder="0"
            style="border: 0;"
            allowtransparency="true">
        </iframe>
      `
      trackContainer.innerHTML = iframe
      this.container.appendChild(trackContainer)
    })
  }
}
