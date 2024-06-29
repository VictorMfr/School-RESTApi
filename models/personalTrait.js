const mongoose = require('mongoose');

const directorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
});


const PersonalTrait = mongoose.model('PersonalTrait', directorSchema);
module.exports = PersonalTrait;
