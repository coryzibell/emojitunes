import emojis from 'node-emoji/lib/emoji.json'

const container = document.querySelector('[data-emoji-grid]')
const list = document.createElement('ul')

Object.entries(emojis).map(emoji => addEmojiNode(list, emoji))

list.classList.add('Emoji-grid__list')
container.appendChild(list)

function addEmojiNode(parent, emoji) {
  const child = document.createElement('li')
  child.classList.add('Emoji-grid__item')
  child.innerHTML = emoji[1]

  return parent.appendChild(child)
}
