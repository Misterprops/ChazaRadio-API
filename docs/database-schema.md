# Esquema de Base de Datos - ChazaRadio

Documentación de todas las colecciones, campos, tipos y relaciones en MongoDB.

## 📋 Colecciones

### 1. `Usuarios`

Almacena información de los usuarios registrados en la plataforma.

```javascript
{
  _id: ObjectId,                           // ID único de MongoDB
  id: String,                              // Email o username único
  nombre: String,                          // Nombre completo
  correo: String,                          // Email (único)
  contraseña: String,                      // Contraseña hasheada (bcryptjs)
  rol: String,                             // "usuario" | "admin" (default: "usuario")
  verificado: Boolean,                     // True si email fue verificado
  creacion: Date                           // Fecha de creación (default: Date.now)
}
```

**Índices**:
```javascript
db.Usuarios.createIndex({ "correo": 1 }, { unique: true })
db.Usuarios.createIndex({ "id": 1 }, { unique: true })
```

**Ejemplo**:
```javascript
{
  _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j1"),
  id: "juan@email.com",
  nombre: "Juan Pérez",
  correo: "juan@email.com",
  contraseña: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gBS/O6",
  rol: "usuario",
  verificado: true,
  creacion: ISODate("2024-01-15T10:30:00Z")
}
```

**Campos Relacionados**:
- Audios: via `Audios.autor`
- Posts: via `Posts.autor`
- LikeList: via `LikeList.usuario_id`
- Verificacion: via `Verificacion.id`

---

### 2. `Audios`

Almacena todos los audios subidos por usuarios.

```javascript
{
  _id: ObjectId,                           // ID único
  titulo: String,                          // Título del audio
  url: String,                             // Ruta relativa (/media/...) o URL absoluta
  autor: String,                           // ID del usuario que subió (referencia a Usuarios.id)
  likes_count: Number,                     // Contador de likes (default: 0)
  duracion: Number,                        // Duración en segundos
  fecha: Date,                             // Fecha de subida (default: Date.now)
  descripcion: String,                     // Descripción opcional
  formato: String,                         // "webm" | "mp3" | "wav"
  tamaño: Number                           // Tamaño en bytes
}
```

**Índices**:
```javascript
db.Audios.createIndex({ "autor": 1 })
db.Audios.createIndex({ "fecha": -1 })  // Para ordenar descendente
db.Audios.createIndex({ "_id": 1, "autor": 1 })
```

**Ejemplo**:
```javascript
{
  _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j2"),
  titulo: "Mi primer podcast",
  url: "/media/audio_1705314600.webm",
  autor: "juan@email.com",
  likes_count: 42,
  duracion: 125.5,
  fecha: ISODate("2024-01-15T11:30:00Z"),
  descripcion: "Explicación sobre React Hooks",
  formato: "webm",
  tamaño: 2097152
}
```

**Ciclo de Vida**:
1. Usuario graba en frontend (Web Audio API)
2. Sube via `POST /api/upload`
3. Backend procesa y almacena
4. Documento insertado en `Audios`
5. Otros usuarios ven en lista via `/api/get_audios`
6. Usuario puede dar like via `/api/like_control`
7. Dueño puede eliminar via `/api/delete_audio`

**Caché**: Resultado de `get_audios` cacheado 180s en backend (LRU)

---

### 3. `LikeList`

Tabla de relación: qué usuarios han likeado qué audios.

```javascript
{
  _id: ObjectId,                           // ID único
  usuario_id: String,                      // ID del usuario (referencia a Usuarios.id)
  audio_id: ObjectId,                      // ID del audio (referencia a Audios._id)
  fecha: Date                              // Fecha del like (default: Date.now)
}
```

**Índices** (IMPORTANTE para performance):
```javascript
db.LikeList.createIndex({ "usuario_id": 1, "audio_id": 1 }, { unique: true })
// Evita likes duplicados, permite búsqueda rápida
db.LikeList.createIndex({ "usuario_id": 1 })
db.LikeList.createIndex({ "audio_id": 1 })
```

**Ejemplo**:
```javascript
{
  _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j3"),
  usuario_id: "juan@email.com",
  audio_id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j2"),
  fecha: ISODate("2024-01-16T14:22:00Z")
}
```

**Operaciones Típicas**:
```javascript
// Usuario da like a audio
db.LikeList.insertOne({
  usuario_id: "juan@email.com",
  audio_id: ObjectId("..."),
  fecha: new Date()
})

// Verificar si usuario likeó audio
db.LikeList.findOne({
  usuario_id: "juan@email.com",
  audio_id: ObjectId("...")
})

// Eliminar like (usuario click en corazón nuevamente)
db.LikeList.deleteOne({
  usuario_id: "juan@email.com",
  audio_id: ObjectId("...")
})

// Incrementar contador en Audios
db.Audios.updateOne(
  { _id: ObjectId("...") },
  { $inc: { likes_count: 1 } }
)
```

---

### 4. `Posts`

Feed social: mensajes con links de usuarios.

```javascript
{
  _id: ObjectId,                           // ID único
  contenido: String,                       // Texto del post (max ~500 chars)
  link: String,                            // URL opcional (YouTube, Spotify, etc)
  autor: String,                           // ID del usuario (referencia a Usuarios.id)
  autor_nombre: String,                    // Nombre del usuario (para mostrar sin join)
  fecha: Date,                             // Fecha de creación (default: Date.now)
  likes: Number                            // Contador de likes del post (default: 0)
}
```

**Índices**:
```javascript
db.Posts.createIndex({ "fecha": -1 })  // Para orden cronológico
db.Posts.createIndex({ "autor": 1 })
```

**Ejemplo**:
```javascript
{
  _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j4"),
  contenido: "Escucha mi último podcast! 🎙️",
  link: "https://youtube.com/watch?v=abc123",
  autor: "juan@email.com",
  autor_nombre: "Juan Pérez",
  fecha: ISODate("2024-01-17T09:15:00Z"),
  likes: 10
}
```

**Paginación**:
```javascript
// Obtener página 1 (posts 0-9)
db.Posts.find().sort({ fecha: -1 }).limit(10).skip(0)

// Obtener página 2 (posts 10-19)
db.Posts.find().sort({ fecha: -1 }).limit(10).skip(10)
```

**Caché**: Resultado de `get_posts` cacheado 60s en backend (LRU)

---

### 5. `Poadcasts`

Series de podcasts (una serie puede tener múltiples episodios).

```javascript
{
  _id: ObjectId,                           // ID único
  id: String,                              // Identificador único (alias)
  nombre: String,                          // Título de la serie
  autores: String,                         // Autores/productores
  capitulo: [                              // Array de episodios
    {
      creacion: Date,                      // Fecha del episodio (default: Date.now)
      url: String                          // URL del archivo de audio
    }
  ],
  descripcion: String,                     // Descripción de la serie (opcional)
  imagen: String,                          // URL de imagen/cover (opcional)
  creador: String                          // ID del usuario que creó
}
```

**Índices**:
```javascript
db.Poadcasts.createIndex({ "id": 1 }, { unique: true })
db.Poadcasts.createIndex({ "creador": 1 })
```

**Ejemplo**:
```javascript
{
  _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j5"),
  id: "tech-talk-2024",
  nombre: "Tech Talk 2024",
  autores: "Juan Pérez, María García",
  descripcion: "Conversaciones sobre tecnología y programación",
  imagen: "https://example.com/cover.jpg",
  creador: "juan@email.com",
  capitulo: [
    {
      creacion: ISODate("2024-01-10T08:00:00Z"),
      url: "https://example.com/ep1.mp3"
    },
    {
      creacion: ISODate("2024-01-17T08:00:00Z"),
      url: "https://example.com/ep2.mp3"
    }
  ]
}
```

**Operaciones**:
```javascript
// Agregar episodio a serie existente (upsert)
db.Poadcasts.updateOne(
  { id: "tech-talk-2024" },
  {
    $push: {
      capitulo: {
        creacion: new Date(),
        url: "https://example.com/ep3.mp3"
      }
    }
  },
  { upsert: true }
)
```

**Caché**: Resultado de `get_poadcast` cacheado 180s en backend (LRU)

---

### 6. `Verificacion`

Códigos de verificación de email temporales.

```javascript
{
  _id: ObjectId,                           // ID único
  id: String,                              // Email del usuario
  codigo: String,                          // Código de 6 dígitos
  vencimiento: Date,                       // Fecha/hora de expiración (TTL 15 min)
  creado: Date                             // Fecha de creación (default: Date.now)
}
```

**Índices con TTL**:
```javascript
// Documento se elimina automáticamente después de 900 segundos (15 min)
db.Verificacion.createIndex({ "vencimiento": 1 }, { expireAfterSeconds: 0 })
// O simplemente almacenar la fecha y verificar manually en aplicación
```

**Ciclo de Vida**:
1. Usuario se registra
2. Sistema genera código 6 dígitos
3. Inserta documento en `Verificacion` con vencimiento = now + 15min
4. Envía email con código
5. Usuario ingresa código en frontend
6. Backend busca en `Verificacion`, valida código y fecha
7. Si válido: marca usuario como verificado en `Usuarios`
8. Elimina documento de `Verificacion`

**Ejemplo**:
```javascript
{
  _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j6"),
  id: "juan@email.com",
  codigo: "123456",
  vencimiento: ISODate("2024-01-15T11:45:00Z"),
  creado: ISODate("2024-01-15T11:30:00Z")
}
```

---

### 7. `Registros` (Usuarios sin verificar)

Usuarios que se registraron pero aún no verificaron email.

```javascript
{
  _id: ObjectId,                           // ID único
  id: String,                              // Email o username
  nombre: String,
  correo: String,
  contraseña: String,                      // hashed
  rol: String,                             // default: "usuario"
  verificado: Boolean,                     // default: false
  creacion: Date                           // default: Date.now
}
```

**Ciclo de Vida**:
1. Usuario se registra
2. Documento insertado en `Registros` (no en `Usuarios`)
3. Email de verificación enviado
4. Usuario verifica código
5. Documento movido de `Registros` a `Usuarios`

---

## 🔄 Relaciones Entre Colecciones

```
Usuarios (1) ────→ (N) Audios
                    └─ via "autor" (Usuarios.id == Audios.autor)

Usuarios (1) ────→ (N) Posts
                    └─ via "autor" (Usuarios.id == Posts.autor)

Usuarios (1) ────→ (N) Poadcasts
                    └─ via "creador"

Usuarios (N) ←──→ (N) Audios  [through LikeList]
                    └─ Junction table: LikeList
```

**Consultas útiles**:

```javascript
// Obtener todos los audios de un usuario
db.Audios.find({ autor: "juan@email.com" })

// Obtener audios likeados por un usuario
db.LikeList.find({ usuario_id: "juan@email.com" })
  .then(likes => {
    audioIds = likes.map(l => l.audio_id)
    db.Audios.find({ _id: { $in: audioIds } })
  })

// Obtener estadísticas del usuario
db.Audios.countDocuments({ autor: "juan@email.com" })
db.Posts.countDocuments({ autor: "juan@email.com" })
db.LikeList.countDocuments({ usuario_id: "juan@email.com" })

// Audios más likeados
db.Audios.find().sort({ likes_count: -1 }).limit(10)

// Posts más recientes
db.Posts.find().sort({ fecha: -1 }).limit(20)
```

---

## 📊 Estadísticas de Almacenamiento

Estimación aproximada (por documento):

| Colección | Tamaño promedio/doc | Ejemplo |
|-----------|-------------------|---------|
| Usuarios | ~200 bytes | 100,000 docs = 20 MB |
| Audios | ~500 bytes | 10,000 docs = 5 MB |
| Posts | ~300 bytes | 50,000 docs = 15 MB |
| LikeList | ~100 bytes | 1,000,000 docs = 100 MB |
| Verificacion | ~150 bytes | TTL limpia automáticamente |
| Poadcasts | ~2 KB | 100 docs = 200 KB |

**Total estimado para 100K usuarios**: ~200 MB (muy manejable en cloud)

---

## 🔐 Validaciones de Datos

### Usuarios
- `correo`: Formato válido de email, único
- `contraseña`: Mínimo 8 caracteres, hasheada antes de guardar
- `rol`: Solo "usuario" o "admin"

### Audios
- `titulo`: Requerido, max 200 caracteres
- `url`: Debe ser path válido o URL
- `duracion`: Número positivo
- `tamaño`: Max 50 MB

### Posts
- `contenido`: Requerido, 1-500 caracteres
- `link`: URL opcional pero debe ser válida si se proporciona

### Verificacion
- `codigo`: Exactamente 6 dígitos
- `vencimiento`: Debe ser futuro

---

## 🚀 Optimizaciones

### Índices Creados
```javascript
// Usuarios
db.Usuarios.createIndex({ correo: 1 }, { unique: true })
db.Usuarios.createIndex({ id: 1 }, { unique: true })

// Audios
db.Audios.createIndex({ autor: 1 })
db.Audios.createIndex({ fecha: -1 })

// Posts
db.Posts.createIndex({ fecha: -1 })
db.Posts.createIndex({ autor: 1 })

// LikeList (IMPORTANTE)
db.LikeList.createIndex({ usuario_id: 1, audio_id: 1 }, { unique: true })

// Poadcasts
db.Poadcasts.createIndex({ id: 1 }, { unique: true })
```

### Caché en Backend
- `get_audios`: TTL 180s
- `get_posts`: TTL 60s
- `get_poadcast`: TTL 180s

### Agregaciones (si necesitas reportes)
```javascript
// Usuarios más activos
db.Audios.aggregate([
  { $group: { _id: "$autor", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])

// Audios más populares
db.Audios.aggregate([
  { $sort: { likes_count: -1 } },
  { $limit: 10 }
])
```

---

## 📝 Cambios Futuros

- [ ] Agregar campo `tags` a Audios para búsqueda
- [ ] Agregar `descripción` a Usuarios (biografía)
- [ ] Agregar `comentarios` a Audios
- [ ] Agregar `notificaciones` para nuevos likes/followers
- [ ] Campo `visibilidad` (público/privado) en Audios

---

**Última actualización**: Abril 2026

