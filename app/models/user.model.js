const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    nombre:String,
    password: String,
    email: String,
    numCelular:Number,
    nombreEmergencia:String,
    numEmergencia:Number,
    numCuarto:Number,
    username: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
  })
);

module.exports = User;