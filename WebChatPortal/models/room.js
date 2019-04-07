const mongoose = require('mongoose');
Schema = mongoose.Schema;

const Conversation = new Schema({
   name:{
       type:String,
       default: ''
   },
  admin:{
    type:String,
    default:''
  },
  users:[{
       type:String,
       required: true
   }],
  group:{
        type:String,
        default: false
    }
});

const Room = module.exports = mongoose.model('Room',Conversation);