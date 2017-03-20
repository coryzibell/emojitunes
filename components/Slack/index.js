export default class Slack {
  constructor(opts) {
    this.msgs = document.querySelectorAll(opts.msgs)
    this.startConversation()
  }

  startConversation() {
    setTimeout(() => {
      this.msgs[0].classList.add('Slack__row--first-animate')

      setTimeout(() => {
        this.typeMsg(this.msgs[0].querySelector('[data-msg]'), '🤘')
      }, 500)
    }, 4000)

    setTimeout(() => {
      this.msgs[0].classList.add('Slack__row--first-animate-2')

      setTimeout(() => {
        this.msgs[1].classList.add('Slack__row--second-animate')
        setTimeout(() => {
          this.typeMsg(this.msgs[1].querySelector('[data-msg]'), '👊')
          setTimeout(() => this.addIframe(this.msgs[1].querySelector('[data-msg]')), 1000)
        }, 500)
      }, 1000)
    }, 6000)
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

  addIframe(msg) {
    const container = document.createElement('div')
    const html = `
      <iframe
        class="Slack__spotify"
        src="https://embed.spotify.com/?uri=https://open.spotify.com/track/2SgbR6ttzoNlCRGQOKjrop"
        width="150"
        height="190"
        frameborder="0"
        style="border: 0;"
        allowtransparency="true">
      </iframe>
    `

    container.innerHTML = html
    msg.parentNode.appendChild(container)
  }
}
