export default class Slack {
  constructor(opts) {
    this.msgs = document.querySelectorAll(opts.msgs)
    this.startConversation()
  }

  startConversation() {
    setTimeout(() => {
      this.msgs[0].classList.add('Slack__row--first-animate')
    }, 4000)

    setTimeout(() => {
      this.msgs[0].classList.add('Slack__row--first-animate-2')

      setTimeout(() => {
        this.msgs[1].classList.add('Slack__row--second-animate')
      }, 1000)
    }, 6000)
  }
}
