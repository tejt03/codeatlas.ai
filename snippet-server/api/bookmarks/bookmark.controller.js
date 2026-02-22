const Bookmark = require('./bookmark.model');

const createBookmark = async (req, res) => {
  const { snippet_id, user_id } = req.body;

  if (!snippet_id || !user_id) {
    return res.status(400).json({ error: 'snippet_id and user_id are required' });
  }

  try {
    const existing = await Bookmark.findOne({ snippet_id, user_id });
    if (existing) {
      return res.status(200).json(existing);
    }

    const bookmarkDoc = new Bookmark({ snippet_id, user_id });
    const bookmark = await bookmarkDoc.save();

    return res.json(bookmark);
  } catch (error) {

    if (error.code === 11000) {
      const existing = await Bookmark.findOne({ snippet_id, user_id });
      return res.status(200).json(existing);
    }

    return res.status(500).json({ error: error.toString() });
  }
};

const deleteBookmark = async (req, res) => {
  const { params } = req;
  const id = params.id;

  try {
    const bookmark = await Bookmark.findOneAndDelete({ _id: id });

    if (bookmark) {
      res.json({ message: 'success', bookmark: id });
    } else {
      res.status(404).json({ error: `No bookmark found by id: ${id}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

module.exports = {
  createBookmark,
  deleteBookmark
};
