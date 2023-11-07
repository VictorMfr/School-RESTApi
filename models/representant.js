const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const representantSchema = new mongoose.Schema({
    name: {
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
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    hijos_estudiantes: [{
        hijo_estudiante: {
            nombres: {
                type: String,
                required: true
            },
            apellidos: {
                type: String,
                required: true
            },
            fecha_de_nacimiento: {
                type: String,
                required: true
            },
            edad: {
                type: Number,
                required: true
            },
            grado: {
                type: String,
            },
            seccion: {
                type: String,
            },
            direccion: {
                type: String,
                required: true
            },
            docente: {
                type: String,
            },
            cedula_escolar: {
                type: String,
                required: true,
            },
            año_escolar: {
                type: String,
                required: true
            },
            literal_calificativo_final: {
                type: String,
            }
        }
    }]
});

// Método toJSON
representantSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
};

// Método generateAuthToken
representantSchema.methods.generateAuthToken = async function () {
    const user = this;
    try {
        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
        user.tokens = user.tokens.concat({ token });
        await user.save();
        return token;
    } catch (error) {
        throw new Error('Unable to generate authentication token');
    }
};

// Método estático findByCredentials
representantSchema.statics.findByCredentials = async (email, password) => {
    const representant = await Representant.findOne({ email });

    if (!representant) {
        throw new Error('El representante no se encuentra registrado');
    }

    const isMatch = await bcrypt.compare(password, representant.password);

    if (!isMatch) {
        throw new Error('Contraseña incorrecta');
    }

    return representant;
};

// Método pre 'save'
representantSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

// Método pre 'remove'
representantSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

const Representant = mongoose.model('Representant', representantSchema);

module.exports = Representant;