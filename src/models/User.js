const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    name: { type: String, require: true },
    email: { type: String, require: true },
    birthday: { type: Date, default: Date.now, require: true },
    description: { type: String },
    tel: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    password: { type: String, require: true },
    date: { type: Date, default: Date.now }
});

UserSchema.methods.encryptPassword = async (password) => {
   const salt = await bcrypt.genSalt(10);
   const hash = bcrypt.hash(password, salt);
   return hash;
};

UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);