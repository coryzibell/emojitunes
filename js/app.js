import 'babel-polyfill'

// ==========================================================================
// Components
// ==========================================================================
import EmojiGrid from '../components/Emoji-grid'

new EmojiGrid({
  container: '[data-emoji-grid]',
  search: '[data-search]'
})
