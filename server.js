const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const dbConfig = require("./app/config/db.config");
const db = require("./app/models");
const Role = db.role;

const app = express();

// Configuración de CORS
var corsOptions = {
  origin: "http://localhost:8081"
};
app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Limitar peticiones de la API
const accountLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 100, // 50 peticiones en 5 minutos
  message: "Demasiadas peticiones, intenta nuevamente en 5 minutos"
});
app.use("/api/auth/signin", accountLimiter);
// app.use("/api/auth/crearsugerencia",accountLimiter);
// app.use("/api/auth/crearsugerencia", accountLimiter);
app.use("/api/auth/signup", accountLimiter);
// app.use("/api/auth/crearproducto", accountLimiter);
// app.use("/api/auth/eliminarproducto/:id", accountLimiter);
// app.use("/api/auth/crearPedido", accountLimiter);
// app.use("/api/auth/editarpedido/:id", accountLimiter);
// app.use("/api/auth/crearreporte", accountLimiter);




// Ruta para el inicio
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// Rutas
require("./app/routes/auth.routes") (app);
require("./app/routes/user.routes")(app);

// Configuración y conexión a MongoDB
db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// Establecer puerto y escuchar solicitudes
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Función para inicializar roles en la base de datos
function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "cocina"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "Mesero"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'admin' to roles collection");
      });
    }
  });
}
