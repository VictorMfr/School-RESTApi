const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const directorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase() === 'password') {
                throw new Error('Password cannot be "password"');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

directorSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
};

directorSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    user.tokens.push({ token });
    await user.save();

    return token;
};

directorSchema.statics.findByCredentials = async (email, password) => {
    const director = await Director.findOne({ email });

    if (!director) {
        throw new Error('Director no encontrado');
    }

    const isMatch = await bcrypt.compare(password, director.password);

    if (!isMatch) {
        throw new Error('Contraseña incorrecta');
    }

    return director;
};

directorSchema.pre('save', async function (next) {
    const director = this;
    if (director.isModified('password')) {
        director.password = await bcrypt.hash(director.password, 8);
    }
    next();
});

const Director = mongoose.model('Director', directorSchema);

module.exports = Director;
