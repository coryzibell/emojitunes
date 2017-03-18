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
}
