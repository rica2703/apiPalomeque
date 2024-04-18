const mongoose = require("mongoose");

const Mensaje = mongoose.model(
  "Mensaje",
  new mongoose.Schema({
    username: String,
    contenido:String,
    fecha:Date,
  })
);

module.exports = Mensaje;