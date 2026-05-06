# ChazaRadio Backend API

Servidor Node.js/Express con MongoDB para la plataforma de radio social ChazaRadio.

## 🎯 Descripción

Backend REST que proporciona:
- 🔐 Autenticación con JWT y verificación por email
- 🎵 Gestión de audios (subida, reproducción, likes)
- 📱 Feed social con posts y comentarios
- 🎙️ Series de podcasts
- 📧 Notificaciones por email
- 💾 Almacenamiento local o en Azure Blob
- 🚀 Caché LRU para optimización

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Node.js** | 16+ | Runtime |
| **Express** | 5.x | Framework HTTP |
| **MongoDB** | 5+ | Base de datos |
| **Mongoose** | 7+ | ODM |
| **JWT** | 9.x | Autenticación |
| **Nodemailer** | 6+ | Emails |
| **FFmpeg** | Static | Procesamiento audio |
| **Multer** | 2+ | File uploads |

## 📦 Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env (ver ejemplo abajo)
cp .env.example .env
# Editar .env con tus valores

# 3. Ejecutar servidor
npm start
# Servidor escuchando en http://localhost:3000
```

**Variables .env requeridas**:
```env
PORT=3000
URI=mongodb://localhost:27017/ChazaRadio
JWT_SECRET=your_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

Ver [BACKEND_SETUP.md](./docs/BACKEND_SETUP.md) para configuración detallada.

## 📖 Documentación

- [BACKEND_SETUP.md](./docs/BACKEND_SETUP.md) — Instalación y configuración
- [database-schema.md](./docs/database-schema.md) — Esquema de MongoDB
- [openapi.yaml](./docs/openapi.yaml) — Especificación OpenAPI/Swagger

## 🔌 Endpoints Principales

### Autenticación
- `POST /api/registro` — Registrar usuario
- `POST /api/login` — Iniciar sesión
- `POST /api/verificar` — Verificar email
- `GET /api/verify` — Validar token (protected)
- `POST /api/retoken` — Renovar token (protected)

### Audios
- `POST /api/upload` — Subir audio (protected)
- `GET /api/get_audios` — Listar audios
- `POST /api/delete_audio` — Eliminar audio (protected)

### Likes
- `POST /api/like_control` — Dar/quitar like (protected)
- `GET /api/get_likeList` — Listar audios likeados (protected)

### Posts
- `POST /api/upload_post` — Crear post (protected)
- `GET /api/get_posts` — Listar posts
- `POST /api/delete_post` — Eliminar post (protected)

### Podcasts
- `POST /api/upload_poadcast` — Crear/actualizar podcast (protected)
- `GET /api/get_poadcast` — Listar podcasts

Especificación completa en [openapi.yaml](./docs/openapi.yaml)

## 📁 Estructura de Archivos

```
ChazaRadio-API/
├── conector.js               # 🎯 Entry point, rutas, middleware
├── conectordb.js             # 🔗 Conexión a MongoDB
├── tokenServices.js          # 🔐 JWT generation/validation
├── user_data.js              # 👤 Endpoints autenticación
├── audio_data.js             # 🎵 CRUD audios
├── like_control.js           # ❤️ Sistema de likes
├── upload_post.js            # 📱 Posts sociales
├── poadcast_data.js          # 🎙️ Podcasts
├── mail_sender.js            # 📧 Emails
├── mail_verificar.js         # ✉️ Verificación
├── storageServices.js        # 💾 Almacenamiento
├── cacheServices.js          # 🚀 Caché LRU
├── database/
│   └── esquemas.js           # 📋 Modelos Mongoose
├── media/                    # 🗂️ Audios (local)
├── package.json
├── .env                      # Variables de entorno
├── .gitignore                # Archivos a ignorar
├── BACKEND_SETUP.md          # Guía de setup
└── database-schema.md        # Esquema de BD
```

## 🏗️ Arquitectura

```
Cliente (React)
    ↓ HTTP/REST
    ↓ JWT Auth
┌─────────────────────────────┐
│    Express Router           │
│   (conector.js)             │
│  ┌─────────────────────────┐│
│  │ authenticateToken       ││ Middleware
│  │ multer middleware       ││
│  └─────────────────────────┘│
└──────────┬──────────────────┘
           ↓
    ┌──────────────────┐
    │  Request Handlers│
    │  (*.js files)    │
    └────────┬─────────┘
             ↓
      ┌─────────────────┐
      │   Mongoose ORM  │
      │   (esquemas.js) │
      └────────┬────────┘
             ↓
      ┌─────────────────┐
      │   MongoDB       │
      │  Collections    │
      └─────────────────┘
```

## 🔐 Seguridad

### Autenticación
- **JWT**: HS256 (HMAC SHA-256)
- **Expiración**: 20 minutos
- **Renovación**: Automática si <5 min
- **Almacenamiento**: localStorage en cliente

### Contraseñas
- **Hashing**: bcryptjs (salt rounds: 10)
- **Nunca en logs**: Contraseñas no se imprimen

### CORS
```javascript
app.use(cors());
// ⚠️ En producción: restringir orígenes
```

### Validación
- Middleware de autenticación en endpoints protegidos
- Validación de input en handlers
- Verificación de ownership antes de eliminar

## 📊 Caché

Backend implementa caché LRU con TTL automático:

| Operación | TTL | Propósito |
|-----------|-----|----------|
| `get_audios` | 180s | Lista principal |
| `get_posts` | 60s | Feed social |
| `get_poadcast` | 180s | Series |

Caché se invalida automáticamente cuando hay cambios.

## 🧪 Testing

### Con Postman/Thunder Client

```bash
# 1. POST /api/login
Body: { "id": "usuario@email.com", "password": "password" }
Response: { "token": "jwt...", "user": {...} }

# 2. POST /api/get_audios (usar token como Bearer)
Headers: Authorization: Bearer {token}
Response: { "audios": [...] }

# 3. POST /api/like_control (con token)
Body: { "url": "/media/audio.webm" }
Response: { "action": "liked", "likes_count": 42 }
```

### Con cURL

```bash
# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"id":"user@email.com","password":"pass"}'

# Listar audios
curl http://localhost:3000/api/get_audios

# Con autenticación
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/verify
```

## 🚀 Deployment

### Azure App Service
```bash
# Ver BACKEND_SETUP.md para pasos completos
az webapp create --resource-group myGroup --plan myPlan --name charada-api
git push azure main
```

### Variables Producción
```env
NODE_ENV=production
URI=mongodb+srv://user:pass@cluster.mongodb.net/ChazaRadio
JWT_SECRET=secure_random_key_here
STORAGE_TYPE=azure
AZURE_STORAGE_ACCOUNT=myaccount
```

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| MongoDB not connecting | Verificar URI en .env, mongod corriendo |
| "Token invalid" | JWT_SECRET debe ser igual en token generation y validation |
| CORS error | Agregar origen en app.use(cors({ origin: [...] })) |
| Email no llega | Verificar EMAIL_USER y EMAIL_PASSWORD, app passwords |
| Puerto 3000 en uso | Cambiar PORT en .env o matar proceso |

Ver [BACKEND_SETUP.md](./BACKEND_SETUP.md) para más detalles.

## 📚 Documentación Adicional

- [Express API Reference](https://expressjs.com/api.html)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Schema Guide](https://mongoosejs.com/docs/guide.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## 💡 Próximos Pasos

- [ ] Agregar tests unitarios (Jest)
- [ ] Implementar rate limiting
- [ ] Agregar logging centralizado (Winston)
- [ ] Mejorar manejo de errores (custom error handler)
- [ ] Documentación de WebSockets (notificaciones en tiempo real)
- [ ] Implementar refresh tokens

## 📞 Soporte

- GitHub Issues para bugs
- Email: maintainer@example.com
- Discord: [link]

---

**Creado por**: ChazaRadio Team  
**Última actualización**: Abril 2026  
**Licencia**: MIT

