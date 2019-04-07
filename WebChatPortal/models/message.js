const mongoose = require('mongoose');
Schema = mongoose.Schema;
const MessageSchema = new Schema({
    from:{
         type:String,
         required:true
         },
    to:{
        type:String,
        required:true
       },
    body:{
        type:String,
        required:true
    },
    delivered:{
        type:Boolean,
        default:true
    },
    msgtype:{
        type:String,
        default:'text'
    }
},
    {
    timestamps:true
}); 

const Msg = module.exports= mongoose.model('Msg',MessageSchema);