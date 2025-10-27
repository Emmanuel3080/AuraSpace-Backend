const mongoose = require("mongoose");

const blackListedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
  },
});

const blackListedTokenModel = mongoose.model(
  "blackListedToken",
  blackListedTokenSchema
);

module.exports = blackListedTokenModel;
