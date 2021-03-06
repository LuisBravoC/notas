const mongoose = require('mongoose');
const { Schema } = mongoose;

const NoteSchema = new Schema({
    title: { type: String, require: true},
    description: { type: String, require: true},
    private: { type: String},
    author: { type: String},
    date: { type: Date, default: Date.now},
    user: { type: String}
});

module.exports = mongoose.model('Note', NoteSchema)