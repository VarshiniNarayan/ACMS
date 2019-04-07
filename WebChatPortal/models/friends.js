const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const FriendsSchema = new Schema({
  friends: [{ type: String}],
  requestTo: [{type: String}]
  });

module.exports = mongoose.model('Friends', FriendsSchema);