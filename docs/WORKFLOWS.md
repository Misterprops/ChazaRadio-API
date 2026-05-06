# Workflows de ChazaRadio

Diagramas de flujo detallados para los procesos principales de la aplicación.

---

## 1️⃣ Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRO Y VERIFICACIÓN                       │
└─────────────────────────────────────────────────────────────────┘

Frontend: register.tsx
│
├─ Usuario ingresa: email + contraseña + username
│
├─ POST /api/registro
│  │
│  └─ Backend: user_data.js
│     ├─ Validar email no existe
│     ├─ Validar formato contraseña
│     ├─ Crear documento en colección Registros (sin verificar)
│     ├─ Generar código 6 dígitos
│     ├─ Insertar en Verificacion { email, code, expiry: +15min }
│     ├─ Enviar email vía mail_sender.js (Nodemailer)
│     └─ Response: { success: true, mensaje: "Verifica tu email" }
│
├─ Frontend muestra formulario verificación
│
├─ Usuario ingresa código
│
├─ POST /api/verificar
│  │
│  └─ Backend: user_data.js
│     ├─ Validar código existe y no expiró
│     ├─ Si válido:
│     │  ├─ Crear documento en Usuarios
│     │  ├─ Eliminar de Verificacion
│     │  └─ Response: { success: true }
│     └─ Si inválido:
│        └─ Response: { error: "Código inválido o expirado" }
│
└─ Frontend redirige a LOGIN
```

### Diagrama Mermaid - Registro

```mermaid
sequenceDiagram
    actor User as Usuario
    participant Frontend
    participant Backend
    participant MongoDB
    participant Email as Gmail SMTP

    User->>Frontend: Ingresa email, contraseña, username
    Frontend->>Backend: POST /api/registro
    Backend->>MongoDB: Verifica email no existe
    alt Email ya existe
        Backend-->>Frontend: { error: "Email ya registrado" }
        Frontend-->>User: Muestra error
    else Email nuevo
        Backend->>MongoDB: Insert en colección Registros
        Backend->>MongoDB: Insert código en Verificacion (TTL 15min)
        Backend->>Email: Envía código por email
        Email-->>User: Email recibido con código
        Frontend-->>User: Muestra campo para ingresar código
        
        User->>Frontend: Ingresa código
        Frontend->>Backend: POST /api/verificar { email, code }
        Backend->>MongoDB: Valida código vs Verificacion
        
        alt Código correcto y no expiró
            Backend->>MongoDB: Crear documento Usuarios
            Backend->>MongoDB: Eliminar de Verificacion
            Backend-->>Frontend: { success: true }
            Frontend-->>User: "Registrado! Inicia sesión"
        else Código inválido o expirado
            Backend-->>Frontend: { error: "Código inválido" }
            Frontend-->>User: Muestra error
        end
    end
```

### Diagrama Mermaid - Login

```mermaid
sequenceDiagram
    actor User as Usuario
    participant Frontend
    participant Backend
    participant TokenSvc as tokenServices
    participant Storage as localStorage

    User->>Frontend: Ingresa email + contraseña
    Frontend->>Backend: POST /api/login { email, password }
    Backend->>Backend: user_data.js: valida credenciales
    
    alt Credenciales incorrectas
        Backend-->>Frontend: { error: "Email o contraseña inválidos" }
        Frontend-->>User: Muestra error
    else Credenciales correctas
        Backend->>TokenSvc: Genera JWT (incluye user_id, email, rol)
        TokenSvc-->>Backend: token + expiryTime (20min)
        Backend-->>Frontend: { success: true, token, user }
        Frontend->>Storage: localStorage.setItem('authToken', token)
        Frontend->>Frontend: authContext.setAuthToken(token)
        Frontend-->>User: Redirige a HOME
    end
```

---

## 2️⃣ Flujo de Carga de Audio

```
┌─────────────────────────────────────────────────────────────────┐
│                  GRABACIÓN Y CARGA DE AUDIO                      │
└─────────────────────────────────────────────────────────────────┘

Frontend: perfil.tsx + recorder.tsx
│
├─ Usuario abre sección "Grabar"
│
├─ Componente recorder.tsx inicializa Web Audio API
│  ├─ Solicita permiso de micrófono
│  └─ Estado: "Listo para grabar"
│
├─ Usuario presiona GRABAR
│  ├─ MediaRecorder captura audio stream
│  └─ Muestra timer de grabación
│
├─ Usuario presiona DETENER
│  ├─ MediaRecorder genera Blob (audio/wav o audio/webm)
│  └─ Guarda en estado local
│
├─ Usuario ingresa título y presiona SUBIR
│
├─ Frontend arma FormData:
│  ├─ archivo: Blob de audio
│  ├─ titulo: string
│  └─ metadata: { formato: 'webm', duracion: 120s, ... }
│
├─ POST /api/upload (con JWT header)
│  │
│  └─ Backend: upload.js
│     ├─ Middleware: valida JWT
│     ├─ Middleware: multer captura archivo → /tmp/
│     ├─ Validar tamaño (<50MB recomendado)
│     ├─ FFmpeg (opcional): convierte a MP3/formato estándar
│     ├─ storageServices.upload():
│     │  ├─ Si LOCAL: mueve a /media/audio_<timestamp>.webm
│     │  └─ Si AZURE: sube a Blob Storage → obtiene URL
│     ├─ Mongoose: inserta en colección Audios
│     │  └─ { titulo, url, autor: user_id, likes_count: 0, fecha: now, ... }
│     ├─ Invalida caché (LRU get_audios)
│     └─ Response: { success: true, audioId, url, titulo }
│
├─ Frontend recibe respuesta
│  ├─ Limpia estado (borra grabación local)
│  ├─ Muestra "✓ Audio subido exitosamente"
│  └─ Refresca lista de audios
│
└─ Nuevo audio aparece en "Emisora" para todos los usuarios
```

### Diagrama Mermaid

```mermaid
flowchart TD
    A["Usuario abre Perfil"] --> B["Presiona GRABAR"]
    B --> C["Web Audio API captura stream"]
    C --> D["Usuario habla/canta"]
    D --> E["Presiona DETENER"]
    E --> F["MediaRecorder genera Blob"]
    F --> G["Usuario ingresa Título"]
    G --> H["Presiona SUBIR"]
    
    H --> I["Frontend arma FormData"]
    I --> J["POST /api/upload con JWT"]
    
    J --> K["Backend recibe"]
    K --> L["Valida JWT y tamaño archivo"]
    L --> M{¿FFmpeg necesario?}
    
    M -->|Sí| N["Convierte a formato estándar"]
    M -->|No| O["Usa archivo directamente"]
    
    N --> P["storageServices.upload"]
    O --> P
    
    P --> Q{¿Almacenamiento?}
    Q -->|Local| R["Guarda en /media/"]
    Q -->|Azure| S["Sube a Blob Storage"]
    
    R --> T["Mongoose: insert Audios"]
    S --> T
    
    T --> U["Invalida caché LRU"]
    U --> V["Response: { success, audioId, url }"]
    
    V --> W["Frontend muestra ✓"]
    W --> X["Lista de audios se refresca"]
    X --> Y["Nuevo audio visible para todos"]
```

---

## 3️⃣ Flujo de Reproducción y Likes

```
┌─────────────────────────────────────────────────────────────────┐
│                 REPRODUCCIÓN Y SISTEMA DE LIKES                  │
└─────────────────────────────────────────────────────────────────┘

Frontend: emisora_main.tsx + lista.tsx
│
├─ Usuario abre sección "Emisora"
│
├─ componente lista.tsx monta
│  ├─ efectoCall: GET /api/get_audios?limit=10&skip=0
│  └─ cacheServices en Backend: retorna (180s TTL)
│
├─ Backend: audio_data.js
│  ├─ Verifica caché LRU
│  ├─ Si CACHE HIT: retorna datos cached
│  ├─ Si CACHE MISS:
│  │  ├─ Mongoose query: Audios.find().limit(10)
│  │  ├─ Guarda en caché
│  │  └─ Retorna datos
│  └─ Response: [{ id, titulo, url, autor, likes_count, ... }]
│
├─ Frontend muestra lista con:
│  ├─ Nombre del audio
│  ├─ Botón PLAY (HTML5 <audio>)
│  ├─ Contador de likes
│  └─ Botón LIKE/UNLIKE
│
├─ Usuario presiona PLAY
│  ├─ HTML5 <audio> reproduce desde URL
│  ├─ Muestra progreso/duración
│  └─ Usuario puede pausar, cambiar volumen, etc.
│
├─ Usuario presiona LIKE
│
├─ POST /api/like_control (con JWT)
│  │
│  └─ Backend: like_control.js
│     ├─ Valida JWT (obtiene user_id)
│     ├─ Verifica si usuario ya likeó este audio
│     ├─ Si NO likeó:
│     │  ├─ Insertar en LikeList { user_id, audio_id }
│     │  ├─ Incrementar Audios.likes_count
│     │  └─ Responde: { action: "liked", likes_count: 25 }
│     └─ Si YA likeó:
│        ├─ Eliminar de LikeList
│        ├─ Decrementar Audios.likes_count
│        └─ Responde: { action: "unliked", likes_count: 24 }
│     ├─ Invalida caché
│     └─ Response: { success, action, likes_count }
│
├─ Frontend recibe
│  ├─ Actualiza botón (LIKE → UNLIKE o viceversa)
│  └─ Actualiza contador dinámicamente
│
└─ Experiencia: usuario ve likes subiendo en tiempo real (pseudo-realtime via UI)
```

### Diagrama Mermaid

```mermaid
sequenceDiagram
    participant User as Usuario
    participant Frontend
    participant Backend
    participant DB as MongoDB
    participant Cache as LRU Cache

    User->>Frontend: Abre "Emisora"
    Frontend->>Backend: GET /api/get_audios?limit=10&skip=0
    
    Backend->>Cache: ¿Existe en caché?
    alt Caché hit (TTL 180s válido)
        Cache-->>Backend: Retorna datos cacheados
    else Caché miss/expirado
        Backend->>DB: Mongoose query Audios
        DB-->>Backend: [audios]
        Backend->>Cache: Guarda en LRU (TTL 180s)
    end
    
    Backend-->>Frontend: { audios: [...] }
    Frontend-->>User: Muestra lista con botones PLAY y LIKE
    
    User->>Frontend: Presiona PLAY
    Frontend->>Frontend: <audio> comienza reproducción
    Frontend-->>User: Muestra progreso
    
    User->>Frontend: Presiona LIKE
    Frontend->>Backend: POST /api/like_control { audio_id } + JWT
    
    Backend->>DB: Verifica LikeList (user_id, audio_id)
    alt Usuario NO ha likeado
        Backend->>DB: Insert LikeList
        Backend->>DB: Audios.likes_count += 1
        Backend-->>Frontend: { action: "liked", likes_count: 25 }
    else Usuario YA likeó
        Backend->>DB: Delete LikeList
        Backend->>DB: Audios.likes_count -= 1
        Backend-->>Frontend: { action: "unliked", likes_count: 24 }
    end
    
    Backend->>Cache: Invalida caché get_audios
    Frontend->>Frontend: Actualiza contador en UI
    Frontend-->>User: ❤️ Like registrado
```

---

## 4️⃣ Flujo de Feed Social (Posts)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FEED SOCIAL - CREAR Y LISTAR                  │
└─────────────────────────────────────────────────────────────────┘

### CREAR POST

Frontend: red_social.tsx
│
├─ Usuario ingresa mensaje (max 500 caracteres)
├─ Usuario (opcional) ingresa link
│
├─ POST /api/upload_post (con JWT)
│  │
│  └─ Backend: upload_post.js
│     ├─ Valida JWT
│     ├─ Valida contenido no esté vacío
│     ├─ Mongoose: inserta en Posts
│     │  └─ { contenido, link, autor: user_id, fecha: now, likes: 0 }
│     ├─ Invalida caché (get_posts)
│     └─ Response: { success: true, postId, post }
│
├─ Frontend actualiza lista
│
└─ Nuevo post aparece al tope del feed

### LISTAR POSTS (CON PAGINACIÓN)

Frontend: red_social.tsx
│
├─ useEffect: GET /api/get_posts?page=1&limit=10
│
├─ Backend: upload_post.js
│  ├─ Verifica caché LRU (60s TTL)
│  ├─ Si CACHE MISS:
│  │  ├─ Mongoose: Posts.find().skip(page*10).limit(10).sort({fecha: -1})
│  │  ├─ Guarda en caché
│  │  └─ Retorna posts con datos de autor (nombre, avatar)
│  ├─ Response: { posts: [...], total, page }
│
├─ Frontend renderiza lista paginada
│  ├─ Muestra cada post con:
│  │  ├─ Autor
│  │  ├─ Contenido
│  │  ├─ Link (si existe)
│  │  └─ Fecha
│  └─ Botón SIGUIENTE si hay más posts
│
└─ Usuario puede:
   ├─ Hacer click en link (abre en nueva pestaña)
   └─ Eliminar si es dueño del post

### ELIMINAR POST (SOLO DUEÑO)

Frontend: red_social.tsx
│
├─ Usuario presiona botón "Eliminar"
│
├─ DELETE /api/delete_post/:postId (con JWT)
│  │
│  └─ Backend: upload_post.js
│     ├─ Valida JWT
│     ├─ Verifica que user_id == post.autor
│     ├─ Si es dueño:
│     │  ├─ MongoDB: delete post
│     │  ├─ Invalida caché
│     │  └─ Response: { success: true }
│     └─ Si NO es dueño:
│        └─ Response: { error: "No autorizado" } (403)
│
├─ Frontend recibe
│
└─ Refresca lista (post desaparece)
```

### Diagrama Mermaid

```mermaid
flowchart TD
    A["Usuario en Red Social"] --> B{¿Crear o Listar?}
    
    B -->|Crear| C["Ingresa mensaje + link"]
    C --> D["Presiona ENVIAR"]
    D --> E["POST /api/upload_post"]
    E --> F["Backend valida JWT y contenido"]
    F --> G["MongoDB: insert Posts"]
    G --> H["Invalida caché"]
    H --> I["Response: { success }"]
    I --> J["Frontend: post aparece al tope"]
    
    B -->|Listar| K["useEffect llama GET /api/get_posts"]
    K --> L["Backend verifica caché"]
    L --> M{¿Caché hit?}
    M -->|Sí| N["Retorna datos cacheados"]
    M -->|No| O["Query MongoDB + ordenar por fecha"]
    O --> P["Guarda en caché LRU 60s"]
    P --> N
    N --> Q["Response: { posts, page, total }"]
    Q --> R["Frontend renderiza lista paginada"]
    R --> S["Usuario puede navegar página"]
    
    R --> T["Usuario presiona 'Eliminar'"]
    T --> U{¿Es dueño?}
    U -->|Sí| V["DELETE /api/delete_post"]
    U -->|No| W["Botón deshabilitado"]
    V --> X["Backend verifica ownership"]
    X --> Y["MongoDB: delete post"]
    Y --> Z["Invalida caché"]
    Z --> AA["Response: { success }"]
    AA --> AB["Post desaparece del feed"]
```

---

## 5️⃣ Flujo de Podcasts

```
┌─────────────────────────────────────────────────────────────────┐
│            GESTIÓN DE SERIES DE PODCASTS                         │
└─────────────────────────────────────────────────────────────────┘

Frontend: (componente específico no documentado, ver poadcast_data.js)
│
├─ Usuario (creador) crea serie de podcast
│  ├─ Ingresa: nombre, descripción, imagen
│  └─ Agrega episodios (URL de audio)
│
├─ POST /api/upload_poadcast (con JWT)
│  │
│  └─ Backend: poadcast_data.js
│     ├─ Valida JWT
│     ├─ Valida creador y datos
│     ├─ Mongoose: MongoDB.findOneAndUpdate (upsert)
│     │  └─ Crea o actualiza documento Poadcasts
│     ├─ Campos: { titulo, descripcion, creador: user_id, episodios: [...] }
│     ├─ Invalida caché
│     └─ Response: { success: true, poadcastId }
│
└─ Backend: poadcast_data.js: GET /api/get_poadcast
   ├─ Verifica caché
   ├─ Retorna todas las series
   ├─ Frontend renderiza lista
   └─ Usuario puede:
      ├─ Reproducir episodios
      ├─ Ver descripción
      └─ Editar si es creador (future: no implementado)
```

---

## 🔄 Manejo de Errores Comunes

### 1. Token Expirado

```mermaid
sequenceDiagram
    Frontend->>Backend: GET /api/get_audios + expired JWT
    Backend->>Backend: tokenServices: valida JWT
    Backend-->>Frontend: { error: "Token expirado" } (401)
    Frontend->>Frontend: authContext detecta 401
    Frontend->>Backend: POST /api/retoken (con refresh logic)
    alt Token puede renovarse (<5 min expirado)
        Backend-->>Frontend: { success: true, token: new_jwt }
        Frontend->>Frontend: localStorage actualiza token
        Frontend->>Backend: Reintenta request original
    else Token muy viejo (>5 min)
        Frontend->>Frontend: Redirige a /login
        Frontend-->>User: "Sesión expirada, inicia sesión"
    end
```

### 2. Archivo Demasiado Grande

```
Usuario sube audio > 50MB
│
├─ Frontend: archivo muy grande (validación lado cliente)
│
├─ Backend: multer rechaza si > configuración
│
└─ Response: { error: "Archivo excede límite" } (413)
   └─ Frontend muestra error al usuario
```

### 3. Base de Datos No Disponible

```
Backend intenta conectar MongoDB
│
├─ Si falla: conector.js log error
├─ Response: { error: "Servidor no disponible" } (500)
└─ Frontend muestra: "Error temporal, intenta más tarde"
```

---

## 📊 Matriz de Endpoints

| Operación | Método | Endpoint | Protegido | Cache |
|-----------|--------|----------|-----------|-------|
| Crear usuario | POST | /api/registro | No | No |
| Verificar email | POST | /api/verificar | No | No |
| Iniciar sesión | POST | /api/login | No | No |
| Renovar token | GET | /api/retoken | Sí | No |
| Listar audios | GET | /api/get_audios | No | 180s |
| Subir audio | POST | /api/upload | Sí | N/A |
| Eliminar audio | DELETE | /api/delete_audio/:id | Sí | N/A |
| Dar/quitar like | POST | /api/like_control | Sí | N/A |
| Listar likes | GET | /api/get_likeList | Sí | 60s |
| Crear post | POST | /api/upload_post | Sí | N/A |
| Listar posts | GET | /api/get_posts | No | 60s |
| Eliminar post | DELETE | /api/delete_post/:id | Sí | N/A |
| Crear podcast | POST | /api/upload_poadcast | Sí | N/A |
| Listar podcasts | GET | /api/get_poadcast | No | 180s |

---

## 🎯 Resumen

- **Autenticación**: Verificación email → JWT 20min → Auto-renew
- **Audios**: Grab vía Web Audio API → Upload → Storage → Reproducción + Likes
- **Social**: Posts → Paginación → Eliminación si dueño
- **Podcasts**: Series con episodios → Listable para todos
- **Caché**: LRU en backend, TTL 60-180s para optimizar BD
- **Errores**: Manejo de token expirado, archivo grande, DB offline

