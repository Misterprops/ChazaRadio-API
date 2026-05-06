# Guía de Setup - ChazaRadio Backend

## 📋 Requisitos Previos

- **Node.js**: 16.x o superior ([descargar](https://nodejs.org/))
- **npm**: Incluido con Node.js
- **MongoDB**: 5.x o superior
  - Opción 1: Local ([descargar](https://www.mongodb.com/try/download/community))
  - Opción 2: MongoDB Atlas (cloud gratuito: https://cloud.mongodb.com)
- **Git**: Para clonar repositorio
- **Nodemailer** (para emails): Requiere cuenta Gmail o similar

## 🚀 Instalación y Ejecución

### 1. Instalar Dependencias

```bash
# En carpeta ChazaRadio-API/
npm install
```

Dependencias principales:
- **express**: Framework HTTP
- **mongoose**: ODM para MongoDB
- **jsonwebtoken**: Generación y validación JWT
- **cors**: Cross-origin resource sharing
- **multer**: Manejo de file uploads
- **nodemailer**: Envío de emails
- **ffmpeg-static**: Procesamiento de audio
- **bcryptjs**: Hashing de contraseñas
- **dotenv**: Variables de entorno

### 2. Configurar Variables de Entorno

Crear archivo `.env` en `ChazaRadio-API/`:

```bash
# .env

# ============= SERVIDOR =============
PORT=3000
NODE_ENV=development

# ============= BASE DE DATOS =============
# Opción 1: MongoDB local
URI=mongodb://localhost:27017/ChazaRadio

# Opción 2: MongoDB Atlas (reemplaza con tu conexión)
# URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/ChazaRadio?retryWrites=true&w=majority

# ============= AUTENTICACIÓN =============
JWT_SECRET=tu_super_secret_key_aqui_minimo_32_caracteres
JWT_EXPIRY=20m

# ============= EMAIL (Nodemailer) =============
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app  # Para Gmail: usar "App Password"
EMAIL_FROM=noreply@charada.com

# ============= ALMACENAMIENTO =============
# Opción 1: Local
STORAGE_TYPE=local
MEDIA_FOLDER=./media

# Opción 2: Azure Blob (comentar si no usas)
# STORAGE_TYPE=azure
# AZURE_STORAGE_ACCOUNT=
# AZURE_STORAGE_KEY=
# AZURE_CONTAINER_NAME=

# ============= FFMPEG =============
FFMPEG_PATH=./node_modules/ffmpeg-static/ffmpeg
```

**Notas importantes**:

#### Gmail App Password
1. Habilitar 2FA en Gmail
2. Ir a https://myaccount.google.com/apppasswords
3. Seleccionar "Mail" y "Windows Computer"
4. Copiar contraseña de 16 caracteres
5. Usar esa contraseña en `EMAIL_PASSWORD`

#### MongoDB Local
```bash
# En Windows: abrir MongoDB
mongod

# Verificar conexión
mongo
> use ChazaRadio
> show collections
```

#### MongoDB Atlas (Cloud)
```bash
# 1. Crear cuenta en https://cloud.mongodb.com
# 2. Crear cluster gratuito
# 3. Obtener connection string
mongodb+srv://user:pass@cluster0.abc123.mongodb.net/ChazaRadio?retryWrites=true&w=majority
```

### 3. Ejecutar Servidor

```bash
npm start
```

Salida esperada:
```
Servidor Node escuchando en http://localhost:3000
(conexión a MongoDB exitosa)
```

## 📁 Estructura de Archivos Backend

```
ChazaRadio-API/
├── conector.js               # 🎯 Entry point, rutas y middleware
├── conectordb.js             # 🔗 Conexión a MongoDB
├── tokenServices.js          # 🔐 JWT generation/validation
├── user_data.js              # 👤 Endpoints autenticación
├── audio_data.js             # 🎵 CRUD audios + caché
├── like_control.js           # ❤️ Sistema de likes
├── upload_post.js            # 📱 Posts sociales
├── poadcast_data.js          # 🎙️ Series de podcasts
├── mail_sender.js            # 📧 Envío de emails
├── mail_verificar.js         # ✉️ Verificación de email
├── storageServices.js        # 💾 Abstracción de almacenamiento
├── cacheServices.js          # 🚀 LRU cache
├── database/
│   └── esquemas.js           # 📋 Modelos Mongoose
├── media/                    # 🗂️ Audios almacenados (local)
├── services/                 # 🛠️ Servicios adicionales
├── package.json
├── .env                      # Variables de entorno (NO commitear)
└── .env.example              # Template de .env
```

## 🔌 Endpoints Principales

| Método | Endpoint | Descripción | Autenticado |
|--------|----------|-------------|-------------|
| POST | `/api/registro` | Registrar usuario | No |
| POST | `/api/login` | Iniciar sesión | No |
| POST | `/api/verificar` | Verificar email | No |
| GET | `/api/verify` | Validar token | Sí |
| POST | `/api/retoken` | Renovar token | Sí |
| POST | `/api/upload` | Subir audio | Sí |
| POST | `/api/get_audios` | Listar audios | No |
| POST | `/api/like_control` | Dar/quitar like | Sí |
| POST | `/api/upload_post` | Crear post | Sí |
| GET | `/api/get_posts` | Listar posts | No |
| POST | `/api/upload_poadcast` | Crear podcast | Sí |
| GET | `/api/get_poadcast` | Listar podcasts | No |

Ver `openapi.yaml` para especificación completa.

## 🗄️ Base de Datos

### Colecciones (Collections)

#### `Usuarios`
```javascript
{
  _id: ObjectId,
  id: String,                  // email o username
  nombre: String,
  correo: String,
  contraseña: String,          // hashed (bcryptjs)
  rol: String,                 // "usuario" o "admin"
  verificado: Boolean,
  creacion: Date
}
```

#### `Audios`
```javascript
{
  _id: ObjectId,
  titulo: String,
  url: String,                 // /media/audio_timestamp.webm
  autor: String,               // id del usuario
  likes_count: Number,
  duracion: Number,            // segundos
  fecha: Date,
  descripcion: String
}
```

#### `Posts`
```javascript
{
  _id: ObjectId,
  contenido: String,           // max 500 chars
  link: String,                // opcional
  autor: String,               // id del usuario
  autor_nombre: String,        // para mostrar en feed
  fecha: Date,
  likes: Number
}
```

#### `LikeList`
```javascript
{
  _id: ObjectId,
  usuario_id: String,
  audio_id: ObjectId,
  fecha: Date
}
```

#### `Poadcasts`
```javascript
{
  _id: ObjectId,
  id: String,                  // identificador
  nombre: String,
  autores: String,
  capitulo: [
    {
      creacion: Date,
      url: String              // audio URL
    }
  ]
}
```

#### `Verificacion`
```javascript
{
  _id: ObjectId,
  id: String,                  // email del usuario
  codigo: String,              // 6 dígitos
  vencimiento: Date,           // TTL 15 minutos
  creado: Date
}
```

### Crear Índices (Performance)

En MongoDB shell:
```javascript
db.Usuarios.createIndex({ "correo": 1 }, { unique: true })
db.Usuarios.createIndex({ "id": 1 }, { unique: true })
db.Audios.createIndex({ "autor": 1 })
db.Audios.createIndex({ "fecha": -1 })
db.Posts.createIndex({ "fecha": -1 })
db.LikeList.createIndex({ "usuario_id": 1, "audio_id": 1 }, { unique: true })
db.Verificacion.createIndex({ "expireAt": 1 }, { expireAfterSeconds: 900 })
```

## 🔐 Seguridad

### JWT
- **Algoritmo**: HS256 (HMAC SHA-256)
- **Expiración**: 20 minutos
- **Payload**: id, correo, nombre, rol, exp, iat
- **Renovación**: Automática si quedan <5 min

### Contraseñas
- **Hashing**: bcryptjs con salt rounds 10
- **Validación**: Mínimo 8 caracteres (recomendado)

### CORS
```javascript
app.use(cors());
// Acepta requests desde cualquier origen (cambiar en producción)
```

### Middleware de Autenticación
```javascript
app.post("/api/upload", authenticateToken, async (req, res) => {
  // Solo usuarios autenticados
});
```

## 🚀 Scripts Disponibles

```bash
npm start         # Inicia servidor (node conector.js)
npm run dev       # Dev mode con nodemon (si está configurado)
```

## 📊 Caché (LRU)

Backend implementa caché LRU con TTL:

| Endpoint | TTL | Tamaño |
|----------|-----|--------|
| `/api/get_audios` | 180s | Última query |
| `/api/get_posts` | 60s | Última query |
| `/api/get_poadcast` | 180s | Última query |

Caché se invalida automáticamente cuando:
- Expire el TTL
- Se cree/modifique/elimine un recurso

## 🐛 Troubleshooting

### "MongoDB connection failed"
**Verificar**:
- MongoDB está corriendo (`mongod` en terminal)
- URI en .env es correcta
- Credenciales de Atlas son válidas

**Solución**:
```bash
# Si usas Atlas, prueba conectar directamente
mongo "mongodb+srv://user:pass@cluster.mongodb.net/ChazaRadio"
```

### "CORS error"
**Solución**: CORS ya está habilitado en `conector.js`:
```javascript
app.use(cors());
```

Si necesitas restringir:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true
}));
```

### "Email de verificación no llega"
**Verificar**:
1. `EMAIL_USER` y `EMAIL_PASSWORD` son correctos
2. Para Gmail: habilitaste "App Passwords"
3. Email no está en SPAM

**Solucionar**:
```bash
# Test de email
# Agrega logging en mail_sender.js
console.log('Enviando a:', email);
```

### "FFmpeg no encontrado"
**Solución**:
```bash
# Reinstalar ffmpeg-static
npm install --save ffmpeg-static
```

### "Puerto 3000 ya está en uso"
**Solución**:
```bash
# Cambiar puerto en .env
PORT=3001

# O matar proceso en puerto 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

## 🌐 Deploy

### Azure App Service

```bash
# 1. Crear App Service
az webapp create --resource-group myGroup --plan myPlan --name charada-api

# 2. Configurar variables de entorno en Azure Portal
# Settings > Configuration > Application Settings

# 3. Deploy
git push azure main

# 4. Ver logs
az webapp log tail -n charada-api -g myGroup
```

### Heroku (deprecated)

```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create charada-api

# 4. Set env vars
heroku config:set VITE_APP_API=https://charada-api.herokuapp.com

# 5. Deploy
git push heroku main
```

## 📖 Documentación Adicional

- [Express Docs](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Security](https://owasp.org/)

## 💡 Tips de Desarrollo

- **Logging**: Añade `console.log()` en funciones críticas
- **Validation**: Valida inputs en endpoint handler (no confíes en frontend)
- **Error Handling**: Usa try/catch en async functions
- **Testing**: Usa Postman o Thunder Client para probar endpoints
- **Documentación**: Mantén openapi.yaml sincronizado con cambios

## 📞 Soporte

Reportar errores o preguntas:
- Issues en GitHub
- Email del mantenedor

---

**Última actualización**: Abril 2026

