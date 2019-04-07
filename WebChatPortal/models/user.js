const mongoose = require('mongoose');
Schema = mongoose.Schema;

const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    username:{
        type:String,
        required: true
    },
    phone:{
        type:Number,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    friends:{
        type: Schema.Types.ObjectId,
        ref: 'friends'
    
    },
    group:[{
        type:String
    }]
    
});

const User = module.exports = mongoose.model('User',UserSchema);