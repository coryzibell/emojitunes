import request from 'superagent'

export default class Slack {
  constructor(opts) {
    this.msgs = document.querySelectorAll(opts.msgs)
    this.emojis = [
      '🤘',
      '🎸',
      '🙌'
    ]

    if (window.matchMedia('(max-width: 47.9375em)').matches) {
      return
    }

    this.animate()
  }

  typeMsg(msg, emoji) {
    const letters = `
      <span class="Slow__msg-part">
      ${msg.innerHTML.split('').join('</span><span class="Slow__msg-part">')}
      </span>
      <span class="Slow__msg-part">${emoji}</span>
    `
    msg.innerHTML = letters
    msg.style.opacity = 1

    const parts = msg.querySelectorAll('.Slow__msg-part')
    parts.forEach((part, index) => {
      setTimeout(function() {
        this.style.opacity = 1
      }.bind(part), index * 30)
    })
  }

  addRecommendation(msg, emoji) {
    request
      .get(`/api/recommendations/${emoji}`)
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

        const container = document.createElement('div')
        const html = `
          <iframe class="Slack__spotify" src="https://embed.spotify.com/?uri=${json.tracks[0].url}"
              width="300"
              height="190"
              frameborder="0"
              style="border: 0;"
              allowtransparency="true">
          </iframe>
        `

        container.innerHTML = html
        msg.parentNode.appendChild(container)
      })
  }

  randomEmoji() {
    return this.emojis[Math.floor(Math.random() * this.emojis.length)]
  }

  animate() {
    const emoji = this.randomEmoji()
    setTimeout(() => {
      this.msgs[0].classList.add('Slack__row--first-animate')
      setTimeout(() => {
        this.typeMsg(this.msgs[0].querySelector('[data-msg]'), emoji)
        setTimeout(() => {
          this.msgs[0].classList.add('Slack__row--first-animate-2')
          setTimeout(() => {
            this.msgs[1].classList.add('Slack__row--second-animate')
            setTimeout(() => {
              this.typeMsg(this.msgs[1].querySelector('[data-msg]'), '👊')
              setTimeout(() => this.addRecommendation(
                this.msgs[1].querySelector('[data-msg]'),
                emoji
              ), 1000)
            }, 500)
          }, 1000)
        }, 1500)
      }, 500)
    }, 1500)
  }
}
