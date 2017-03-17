import emojis from 'node-emoji/lib/emoji.json'

const container = document.querySelector('[data-emoji-grid]')
const search = document.querySelector('[data-search]')
const list = document.createElement('ul')

Object.entries(emojis).map(emoji => addEmojiNode(list, emoji))

list.classList.add('Emoji-grid__list')
container.appendChild(list)

search.addEventListener('keyup', filterEmojis)

function addEmojiNode(parent, emoji) {
  const child = document.createElement('li')
  let [emojiName, emojiCode] = emoji
  child.classList.add('Emoji-grid__item')
  child.setAttribute('data-emoji', emojiName)
  child.innerHTML = emojiCode

  return parent.appendChild(child)
}

function filterEmojis(e) {
  console.log(e.currentTarget)
  list.querySelectorAll('[data-emoji]').forEach(item => {
    if (!item.getAttribute('data-emoji').includes(e.currentTarget.value)) {
      item.classList.add('Emoji-grid__item--hide')
    } else {
      item.classList.remove('Emoji-grid__item--hide')
    }
  })
}
