
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    image: { type: String,required: true  },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    is_online:{ type:String, default:'0'},
    token:{type:String}
   
},{timestamps:true});

module.exports = mongoose.model('User', UserSchema);
