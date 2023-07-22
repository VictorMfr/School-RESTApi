// Importando librerias
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')



// Especificaciones del profesor: nombre, email, password
const professorSchema = new mongoose.Schema({
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
                throw new Error('Email is invalid')
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
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    section: {
        type: String,
        required: false,
        lowercase: true
    },
    habilitado: {
        required: false,
        type: Boolean
    }
})

professorSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

// generar un token de autenticacion
professorSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// Buscar Director en la base de datos por sus credenciales
professorSchema.statics.findByCredentials = async (email, password) => {
    const professor = await Professor.findOne({ email })

    if (!professor) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, professor.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return professor
}

// Código a ejecutar cuando se guardar nueva info en la BBDD
professorSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next();
})

const Professor = mongoose.model('Professor', professorSchema);

module.exports = Professor;