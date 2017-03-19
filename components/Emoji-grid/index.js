import request from 'superagent'
import emojis from 'node-emoji/lib/emoji.json'

export default class Search {
  constructor(opts) {
    this.container = document.querySelector(opts.container)
    this.search = document.querySelector(opts.search)
    this.list = document.createElement('ul')

    Object.entries(emojis).map((emoji, i) => this.addEmojiNode(emoji, i))

    this.list.classList.add('Emoji-grid__list')
    this.container.appendChild(this.list)

    this.search.addEventListener('keyup', e => this.filterEmojis(e))
    document.addEventListener('keydown', e => this.keyboardNav(e))
  }

  addEmojiNode(emoji, i) {
    const child = document.createElement('li')
    let [emojiName, emojiCode] = emoji
    child.classList.add('Emoji-grid__item')
    child.setAttribute('data-emoji', emojiName)
    child.setAttribute('data-index', i)
    child.setAttribute('data-visible', 'true')
    child.innerHTML = emojiCode
    child.tabIndex = 0
    child.addEventListener('click', e => this.getRecommendations(e.currentTarget.innerHTML))

    this.list.appendChild(child)
  }

  filterEmojis(e) {
    this.list.querySelectorAll('[data-emoji]').forEach(item => {
      if (!item.getAttribute('data-emoji').includes(e.currentTarget.value)) {
        item.classList.add('Emoji-grid__item--hide')
        item.setAttribute('data-visible', 'false')
      } else {
        item.classList.remove('Emoji-grid__item--hide')
        item.setAttribute('data-visible', 'true')
      }
    })
  }

  getRecommendations(emoji) {
    request
      .get(`${window.location.protocol}//${window.location.hostname}:9000/recommendations/${emoji}`)
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

  keyboardNav(e) {
    const active = document.activeElement
    const activeIndex = active.hasAttribute('data-index') ?
                        Number(active.getAttribute('data-index')) : -1

    switch (e.keyCode) {
    case 37:
    case 38:
      e.preventDefault()
      if (activeIndex === 0) {
        this.search.focus()
      } else {
        const quickPrev = this.list.querySelector(`[data-index="${activeIndex - 1}"`)
        let slowPrev = false

        if (quickPrev.getAttribute('data-visible') === 'true') {
          quickPrev.focus()
          return
        }

        Array.prototype.slice
        .call(this.container.querySelectorAll('[data-visible="true"]'))
        .reverse()
        .every(item => {
          console.log(item, activeIndex)
          if (Number(item.getAttribute('data-index')) < activeIndex) {
            item.focus()
            slowPrev = true
            return false
          }

          return true
        })

        if (!slowPrev) {
          this.search.focus()
        }
      }

      break

    case 39:
    case 40:
      e.preventDefault()

      Array.prototype.slice
      .call(this.container.querySelectorAll('[data-visible="true"]'))
      .every(item => {
        console.log(item, activeIndex)
        if (Number(item.getAttribute('data-index')) > activeIndex) {
          item.focus()
          return false
        }

        return true
      })

      break

    case 13:
      if (active.hasAttribute('data-emoji')) {
        this.getRecommendations(active.innerHTML)
      }
      break
    }
  }
}
