const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Mensaje=db.mensaje;


var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.createMensaje = async (req, res) => {
  try {
    const { username, contenido, fecha } = req.body;

    // Crear una nueva instancia del modelo de mensaje
    const nuevoMensaje = new Mensaje({
      username: username,
      contenido: contenido,
      fecha: fecha
    });

    // Guardar el nuevo mensaje en la base de datos
    const mensajeGuardado = await nuevoMensaje.save();

    res.status(201).json({ message: 'Mensaje agregado correctamente', mensaje: mensajeGuardado });
  } catch (error) {
    console.error('Error al agregar el mensaje:', error);
    res.status(500).json({ message: 'Error al agregar el mensaje', error: error.message });
  }
};


exports.getAllMensajes = (req, res) => {
  Mensaje.find()
    .then(mensajes => {
      res.status(200).json(mensajes);
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Error al obtener todos los mensajes." });
    });
};
exports.getUserByNumCuarto = (req, res) => {
  const numCuarto = req.params.numCuarto;

  // Buscar al usuario por su número de cuarto
  User.findOne({ numCuarto: numCuarto })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: `Usuario con número de cuarto ${numCuarto} no encontrado.` });
      }
      res.status(200).json({ message: "Usuario encontrado correctamente", user });
    })
    .catch(err => {
      res.status(500).json({ message: 'Error al buscar usuario por número de cuarto', error: err.message });
    });
};
exports.updateUserById = (req, res) => {
  const numCuarto = req.params.numCuarto;
  const updatedData = {
    username: req.body.username,
    email: req.body.email,
    nombre: req.body.nombre,
    numCelular: req.body.numCelular,
    nombreEmergencia: req.body.nombreEmergencia,
    numEmergencia: req.body.numEmergencia,
  };

  // Encuentra y actualiza al usuario por su número de cuarto
  User.findOneAndUpdate({ numCuarto: numCuarto }, updatedData, { new: true })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: `Usuario con número de cuarto ${numCuarto} no encontrado.` });
      }
      res.status(200).send({ message: "Usuario actualizado correctamente", user });
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Error al actualizar usuario por número de cuarto." });
    });
};

exports.getAllUsers = (req, res) => {
  User.find()
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Error retrieving users." });
    });
}

exports.deleteUserById = (req, res) => {
  const numCuarto = req.params.numCuarto;

  // Encuentra y elimina al usuario por su número de cuarto
  User.findOneAndDelete({ numCuarto: numCuarto })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: `Usuario con número de cuarto ${numCuarto} no encontrado.` });
      }
      res.status(200).send({ message: "Usuario eliminado correctamente", user });
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Error al eliminar usuario por número de cuarto." });
    });
};

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    nombre: req.body.nombre,
    numCelular: req.body.numCelular,
    nombreEmergencia: req.body.nombreEmergencia,
    numEmergencia: req.body.numEmergencia,
    numCuarto: req.body.numCuarto,
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }


  //   if (req.body.roles) {
  //     Role.find(
  //       {
  //         name: { $in: req.body.roles }
  //       },
  //       (err, roles) => {
  //         if (err) {
  //           res.status(500).send({ message: err });
  //           return;
  //         }

  //         user.roles = roles.map(role => role._id);
  //         user.save(err => {
  //           if (err) {
  //             res.status(500).send({ message: err });
  //             return;
  //           }

  //           res.send({ message: "Usuario registrado satisfactoriamente!",user});
  //         });
  //       }
  //     );
  //   } else {
  //     Role.findOne({ name: "user" }, (err, role) => {
  //       if (err) {
  //         res.status(500).send({ message: err });
  //         return;
  //       }
  //       user.roles = [role._id];
       user.save(err => {
           if (err) {
             res.status(500).send({ message: err });
             return;
           }
           res.send({ message: "Usuario registrado satisfactoriamente!!" });
         });
       });
    }
  // });
// };

exports.signin = (req, res) => {
  try {
    User.findOne({
      numCuarto: req.body.numCuarto
    })
      .populate("roles", "-__v")
      .exec((err, user) => {
        if (err) {
          console.error('Error al buscar usuario:', err);
          return res.status(500).send({ message: "Error interno del servidor." });
        }

        if (!user) {
          return res.status(404).send({ message: "Número de cuarto no encontrado." });
        }

        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );

        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Contraseña inválida."
          });
        }

        const token = jwt.sign({ id: user.id },
          config.secret,
          {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
            expiresIn: 86400, // 24 horas
          });

        var authorities = [];

        for (let i = 0; i < user.roles.length; i++) {
          authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user._id,
          username: user.username,
          email: user.email,
          nombre: user.nombre,
          numCelular: user.numCelular,
          nombreEmergencia: user.nombreEmergencia,
          numEmergencia: user.numEmergencia,
          numCuarto: user.numCuarto,
          roles: authorities,
          accessToken: token
        });
      });
  } catch (error) {
    console.error('Error en el controlador de signin:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};
