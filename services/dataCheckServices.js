import { body, validationResult } from "express-validator";

/**
 * Valida la informacion upload_audio antes de continuar
 *
 * @constant validarUploadAudio
 *
 * @param {Request} req - Objeto Request de Express
 * @param {Object} req.body.data - Metadata de la pista
 * @param {string} req.body.data.titulo - Título del audio
 * @param {string} req.body.data.tipo - Tipo de audio
 * @param {string} req.body.data.autor - Autor del audio
 * @param {Object} req.file - Archivo recibido por multer (buffer en memoria)
 * @param {string} req.file.mimetype - Tipo MIME del archivo
 *
 * @param {Object} res - Objeto Response de Express
 *
 * @returns {Response} Respuesta HTTP:
 * - 200: Datos validos (next())
 * - 400: Datos invalidos
 * 
 * @sideEffects
 * - Genera datos parseados de body.data como req.parsedData
 *
 * @description
 * - Valida que esten los datos de la pista
 * - Valida que el titulo de este sea un texto
 * - Valida que sea una cuña o una cancion
 * - Valida que los datos del autor sean texto
 * - Valida que el archivo de audio exista
 * - Valida formato del archivo (MP3 o WebM)
 */
export const validarUploadAudio = [
    //Valida que exista el campo data
    body("data")
        .notEmpty().withMessage("Falta data")
        .isString().withMessage("Data debe ser string JSON"),

    //Validar JSON interno
    (req, res, next) => {
        try {
            const parsed = JSON.parse(req.body.data);
            //Validar la existencia de un titulo y tenga el formato de texto
            if (!parsed.titulo || typeof parsed.titulo !== "string") {
                return res.status(400).json({ error: "titulo inválido" });
            }
            //Validar la existencia un tipo de pista y tenga el formato de texto
            if (!parsed.tipo || !["cancion", "cuña"].includes(parsed.tipo)) {
                return res.status(400).json({ error: "tipo inválido" });
            }
            //Validar la existencia de un autor y tenga el formato de texto
            if (!parsed.autor || typeof parsed.autor !== "string") {
                return res.status(400).json({ error: "autor inválido" });
            }

            // Guarda la data parseada para no volver a parsear
            req.parsedData = parsed;

            //Continua a la siguiente funcion
            next();
        } catch {
            return res.status(400).json({ error: "JSON inválido en data" });
        }
    },

    //Validar archivo
    (req, res, next) => {
        //Validar la existencia del archivo
        if (!req.file) {
            return res.status(400).json({ error: "Archivo requerido" });
        }

        //Validar mimetype
        if (!req.file.mimetype.startsWith("audio/mp3") && !req.file.mimetype.startsWith("audio/webm") && !req.file.mimetype.startsWith("audio/mpeg")) {
            return res.status(400).json({ error: "Archivo debe ser audio mp3 o webm" });
        }

        //Continua a la siguiente funcion
        next();
    },

    //Manejo de errores
    (req, res, next) => {
        //Valida el status del proceso
        const errors = validationResult(req);
        //Si hay errores, no prosigue con upload_audio
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        //Si no hay errores continua con upload_audio
        next();
    }
];

/**
 * Valida que los datos de delete_audio esten bien.
 *
 * @constant validarDeleteAudio
 *
 * @param {Request} req - Objeto Request de Express
 * @param {Object} req.body.audioId - Archivo recibido por multer (buffer en memoria)
 *
 * @param {Object} res - Objeto Response de Express
 *
 * @returns {Response} Respuesta HTTP:
 * - 200: Datos validos (next())
 * - 400: Datos invalidos
 * 
 * @description
 * - Valida y sanitiza que el id de la pista sea un string con informacion
 */
export const validarDeleteAudio = [
    //Valida y sanitiza el id de la pista
    body("audioId")
        .notEmpty().withMessage("Falta id del audio")
        .isString().withMessage("id del audio debe ser string")
        .trim(),

    //Manejo de errores
    (req, res, next) => {
        //Valida el status del proceso
        const errors = validationResult(req);
        //Si hay errores, no prosigue con delete_audio
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        //Si no hay errores continua con delete_audio
        next();
    }
];

/**
 * Valida que los datos de like_control esten bien.
 *
 * @constant validarLikeControl
 *
 * @param {Request} req - Objeto Request de Express
 * @param {Object} req.body.url - Url de la pista
 *
 * @param {Object} res - Objeto Response de Express
 *
 * @returns {Response} Respuesta HTTP:
 * - 200: Datos validos (next())
 * - 400: Datos invalidos
 * 
 * @description
 * - Valida y sanitiza que el url de la pista sea un string con informacion
 */
export const validarLikeControl = [
    //Valida y sanitiza el url de la pista
    body("url")
        .isURL().withMessage("url debe ser valido")
        .trim(),

    //Manejo de errores
    (req, res, next) => {
        //Valida el status del proceso
        const errors = validationResult(req);
        //Si hay errores, no prosigue con like_control
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        //Si no hay errores continua con like_control
        next();
    }
];

/**
 * Valida que los datos de request_code esten bien.
 *
 * @constant validarRequestCode
 *
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.id - ID del usuario
 *
 * @param {Object} res - Objeto Response de Express
 *
 * @returns {Response} Respuesta HTTP:
 * - 200: Datos validos (next())
 * - 400: Datos invalidos
 * 
 * @description
 * - Valida y sanitiza el id del usuario para que este correcto
 */
export const validarRequestCode = [
    //Valida y sanitiza el id del usuario
    body("id")
        .notEmpty().withMessage("Falta id")
        .isString().withMessage("id debe ser string")
        .trim()
        .isLength({ min: 10, max: 15 }),

    //Manejo de errores
    (req, res, next) => {
        //Valida el status del proceso
        const errors = validationResult(req);
        //Si hay errores, no prosigue con request_code
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: "Datos inválidos",
                detalles: errors.array()
            });
        }
        //Si no hay errores continua con request_code
        next();
    }
];

/**
 * Valida que los datos de mail_verificar esten bien.
 *
 * @constant validarMailVerificar
 *
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.id - ID del usuario
 * @param {string} req.body.codigo - Codigo de verificación
 *
 * @param {Object} res - Objeto Response de Express
 *
 * @returns {Response} Respuesta HTTP:
 * - 200: Datos validos (next())
 * - 400: Datos invalidos
 * 
 * @description
 * - Valida y sanitiza el id del usuario y su codigo de verificacion para que esten correctos
 */
export const validarMailVerificar = [
    //Valida y sanitiza el id del usuario
    body("id")
        .notEmpty().withMessage("Falta id")
        .isString().withMessage("id debe ser string")
        .trim()
        .isLength({ min: 10, max: 15 }),
    //Valida y sanitiza el codigo de verificación
    body("codigo")
        .notEmpty().withMessage("Falta codigo")
        .isString().withMessage("codigo debe ser string")
        .isLength({ min: 6, max: 6 }),
    //Manejo de errores
    (req, res, next) => {
        //Valida el status del proceso
        const errors = validationResult(req);
        //Si hay errores, no prosigue con mail_verificar
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: "Datos inválidos",
                detalles: errors.array()
            });
        }
        //Si no hay errores continua con mail_verificar
        next();
    }
];

/**
 * Valida que los datos de upload_poadcast esten bien.
 *
 * @constant validarUploadPoadcast
 *
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.url - Url del capitulo
 * @param {string} req.body.serie - Nombre de la serie
 * @param {string} req.body.autores - Nombre del autor
 *
 * @param {Object} res - Objeto Response de Express
 *
 * @returns {Response} Respuesta HTTP:
 * - 200: Datos validos (next())
 * - 400: Datos invalidos
 * 
 * @description
 * - Valida y sanitiza el url del capitulo para que este correcto
 * - Valida y sanitiza el nombre de la serie para que este correcto
 * - Valida y sanitiza el autores de la serie para que este correcto
 */
export const validarUploadPoadcast = [
    //Valida y sanitiza el url del capitulo
    body("url")
        .isURL().withMessage("url debe ser valido")
        .trim(),
    //Valida y sanitiza el nombre de la serie
    body("serie")
        .isString().withMessage("serie debe ser valido")
        .trim(),
    //Valida y sanitiza el nombre de los autores
    body("autores")
        .isString().withMessage("autores debe ser valido")
        .trim(),

    //Manejo de errores
    (req, res, next) => {
        //Valida el status del proceso
        const errors = validationResult(req);
        //Si hay errores, no prosigue con upload_poadcast
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        //Si no hay errores continua con upload_poadcast
        next();
    }
]

/**
 * Valida que los datos de upload_post esten bien.
 *
 * @constant validarUploadPost
 *
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.link - Url del capitulo
 * @param {string} req.body.mensaje - Mensaje del post
 *
 * @param {Object} res - Objeto Response de Express
 *
 * @returns {Response} Respuesta HTTP:
 * - 200: Datos validos (next())
 * - 400: Datos invalidos
 * 
 * @description
 * - Valida y sanitiza el url del post para que este correcto
 * - Valida y sanitiza el mensaje del post para que este correcto
 */
export const validarUploadPost = [
    //Valida y sanitiza el url del post
    body("link")
        .optional()
        .isURL().withMessage("link debe ser una url valida")
        .trim(),

    //Valida y sanitiza el mensaje del post
    body("mensaje")
        .optional()
        .isString().withMessage("mensaje debe ser string")
        .trim(),

    (req, res, next) => {
        const { link, mensaje } = req.body;
        // Validación para saber que existe al menos uno de los dos
        if ((!link || link === "") && (!mensaje || mensaje === "")) {
            return res.status(400).json({
                error: "Debe enviar al menos un link o un mensaje"
            });
        }
        //Continua a la siguiente funcion
        next();
    },

    // Manejo de errores
    (req, res, next) => {
        //Valida el status del proceso
        const errors = validationResult(req);
        //Si hay errores, no prosigue con upload_post
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        //Si no hay errores continua con upload_post
        next();
    }
];

/**
 * Valida que los datos de delete_post esten bien.
 *
 * @constant validarDeletePost
 *
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.postId - ID del post
 *
 * @param {Object} res - Objeto Response de Express
 *
 * @returns {Response} Respuesta HTTP:
 * - 200: Datos validos (next())
 * - 400: Datos invalidos
 * 
 * @description
 * - Valida y sanitiza el ID del post para que este correcto
 */
export const validarDeletePost = [
    //Valida y sanitiza el ID del post
    body("postId")
        .notEmpty().withMessage("Falta id del post")
        .isString().withMessage("id del post debe ser string")
        .trim(),
    //Manejo de errores
    (req, res, next) => {
        //Valida el status del proceso
        const errors = validationResult(req);
        //Si hay errores, no prosigue con delete_post
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        //Si no hay errores continua con delete_post
        next();
    }
];

/**
 * Valida que los datos de get_posts esten bien.
 *
 * @constant validarGetPosts
 *
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.page - Numero de pagina del listado de posts
 *
 * @param {Object} res - Objeto Response de Express
 *
 * @returns {Response} Respuesta HTTP:
 * - 200: Datos validos (next())
 * - 400: Datos invalidos
 * 
 * @description
 * - Valida y sanitiza el numero de pagina del listado de posts para que este correcto
 */
export const validarGetPosts = [
    //Valida y sanitiza el page
    body("page")
        .optional()
        .isInt({ min: 1, max: 1000 }).withMessage("page debe ser un entero mayor a 0")
        .toInt(),

    //Manejo de errores
    (req, res, next) => {
        //Valida el status del proceso
        const errors = validationResult(req);
        //Si hay errores, no prosigue con get_posts
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        //Si no hay errores continua con get_posts
        next();
    }
];

/**
 * Valida que los datos de registro esten bien.
 *
 * @constant validarRegistro
 *
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.id - Codigo universitario del usuario
 * @param {string} req.body.password - Contraseña del usuario
 * @param {string} req.body.email - Correo universitario del usuario
 * @param {string} req.body.user - Nombre del usuario
 *
 * @param {Object} res - Objeto Response de Express
 *
 * @returns {Response} Respuesta HTTP:
 * - 200: Datos validos (next())
 * - 400: Datos invalidos
 * 
 * @description
 * - Valida y sanitiza el codigo universitario para que este correcto
 * - Valida y sanitiza la contraseña del usuario para que este correcta
 * - Valida y sanitiza el correo universitario para que este correcto
 * - Valida y sanitiza el nombre del usuario para que este correcto
 * - Valida que el correo del usuario sea de la universidad
 */
export const validarRegistro = [
    //Valida y sanitiza el codigo universitario del usuario
    body("id")
        .notEmpty().withMessage("Falta codigo universitario")
        .isInt().withMessage("El codigo universitario debe ser numerico")
        .isLength({ min: 10, max: 15 }).withMessage("El codigo universitario debe ser de 10 a 15 caracteres")
        .toInt(),

    //Valida y sanitiza la contraseña del usuario
    body("password")
        .notEmpty().withMessage("Falta contraseña")
        .isString().withMessage("La constraseña debe ser string")
        .isLength({ min: 4 }).withMessage("La contraseña es muy corta")
        .trim(),

    //Valida y sanitiza el correo universitario del usuario
    body("email")
        .notEmpty().withMessage("Falta correo")
        .isEmail().withMessage("No es un correo valido")
        .trim(),

    //Valida y sanitiza el nombre del usuario
    body("user")
        .notEmpty().withMessage("Falta usuario")
        .isString().withMessage("El usuario debe ser string")
        .trim(),

    (req, res, next) => {
        const { email } = req.body;
        // Validación para saber que es un correo de la universidad
        if (!email || !email.includes("@udistrital.edu.co")) {
            return res.status(400).json({
                error: "El correo no es valido"
            });
        }
        //Continua a la siguiente funcion
        next();
    },
    //Manejo de errores
    (req, res, next) => {
        //Valida el status del proceso
        const errors = validationResult(req);
        //Si hay errores, no prosigue con registro
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        //Si no hay errores continua con registro
        next();
    }
];

/**
 * Valida que los datos del login esten bien.
 *
 * @constant validarUserLogin
 *
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.id - Codigo universitario del usuario
 * @param {string} req.body.password - Contraseña del usuario
 *
 * @param {Object} res - Objeto Response de Express
 *
 * @returns {Response} Respuesta HTTP:
 * - 200: Datos validos (next())
 * - 400: Datos invalidos
 * 
 * @description
 * - Valida y sanitiza el codigo universitario para que este correcto
 * - Valida y sanitiza la contraseña del usuario para que este correcta
 */
export const validarUserLogin = [
    //Valida y sanitiza el codigo universitario del usuario
    body("id")
        .notEmpty().withMessage("Falta codigo universitario")
        .isInt().withMessage("El codigo universitario debe ser numerico")
        .isLength({ min: 10, max: 15 }).withMessage("El codigo universitario debe ser de 10 a 15 caracteres")
        .toInt(),

    //Valida y sanitiza la contraseña del usuario
    body("password")
        .notEmpty().withMessage("Falta contraseña")
        .isString().withMessage("La constraseña debe ser string")
        .isLength({ min: 4 }).withMessage("La contraseña es muy corta")
        .trim(),

    //Manejo de errores
    (req, res, next) => {
        //Valida el status del proceso
        const errors = validationResult(req);
        //Si hay errores, no prosigue con login
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        //Si no hay errores continua con login
        next();
    }
];
