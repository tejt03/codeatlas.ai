const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  snippet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Snippet'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

BookmarkSchema.index({ user_id: 1, snippet_id: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', BookmarkSchema);

module.exports = Bookmark;
