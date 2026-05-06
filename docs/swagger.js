import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "ChazaRadio API",
            version: "1.0.0",
            description: "Documentación de la API para streaming, red social y gestión de audio tipo radio IP",
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        schemas: {
            User: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    nombre: { type: "string" },
                    correo: { type: "string" },
                    rol: { type: "string" }
                }
            },

            LoginRequest: {
                type: "object",
                required: ["id", "password"],
                properties: {
                    id: { type: "string", example: "20201234" },
                    password: { type: "string", example: "123456" }
                }
            },

            RegisterRequest: {
                type: "object",
                required: ["id", "user", "email", "password"],
                properties: {
                    id: { type: "string" },
                    user: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" }
                }
            },

            CodeRequest: {
                type: "object",
                required: ["id"],
                properties: {
                    id: { type: "string" }
                }
            },

            VerifyRequest: {
                type: "object",
                required: ["id", "codigo"],
                properties: {
                    id: { type: "string" },
                    codigo: { type: "string" }
                }
            },

            PostRequest: {
                type: "object",
                required: ["mensaje"],
                properties: {
                    mensaje: { type: "string" },
                    link: { type: "string", example: "https://youtube.com/..." }
                }
            },

            DeletePostRequest: {
                type: "object",
                required: ["postId"],
                properties: {
                    postId: { type: "string" }
                }
            },

            LikeRequest: {
                type: "object",
                required: ["url"],
                properties: {
                    url: { type: "string" }
                }
            },

            PodcastRequest: {
                type: "object",
                required: ["serie", "autores", "url"],
                properties: {
                    serie: { type: "string" },
                    autores: { type: "string" },
                    url: { type: "string" }
                }
            }
        },
    },

    paths: {

        // =========================
        // AUTH
        // =========================

        "/api/login": {
            post: {
                tags: ["Auth"],
                summary: "Login de usuario",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/LoginRequest" }
                        }
                    }
                },
                responses: {
                    200: { description: "Token JWT" },
                    400: { description: "Credenciales inválidas" },
                    401: { description: "Usuario no verificado" }
                }
            }
        },

        "/api/registro": {
            post: {
                tags: ["Auth"],
                summary: "Registro de usuario",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/RegisterRequest" }
                        }
                    }
                },
                responses: {
                    200: { description: "Usuario registrado" },
                    400: { description: "Error en registro" }
                }
            }
        },

        "/api/verificar": {
            post: {
                tags: ["Auth"],
                summary: "Verificar código",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/VerifyRequest" }
                        }
                    }
                },
                responses: {
                    200: { description: "Usuario verificado" },
                    400: { description: "Código inválido" }
                }
            }
        },

        "/api/recode": {
            post: {
                tags: ["Auth"],
                summary: "Solicitar nuevo código",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CodeRequest" }
                        }
                    }
                },
                responses: {
                    200: { description: "Código enviado" },
                    400: { description: "Código aún válido" }
                }
            }
        },

        "/api/verify": {
            get: {
                tags: ["Auth"],
                summary: "Verificar token",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: "Token válido" },
                    401: { description: "No autorizado" }
                }
            }
        },

        "/api/retoken": {
            post: {
                tags: ["Auth"],
                summary: "Renovar token",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: "Nuevo token" }
                }
            }
        },

        // =========================
        // AUDIOS
        // =========================

        "/api/upload": {
            post: {
                tags: ["Audios"],
                summary: "Subir audio",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                required: ["audio", "data"],
                                properties: {
                                    audio: {
                                        type: "string",
                                        format: "binary"
                                    },
                                    data: {
                                        type: "string",
                                        example: JSON.stringify({
                                            titulo: "Mi audio",
                                            tipo: "cancion",
                                            autor: "Autor"
                                        })
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Audio subido" }
                }
            }
        },

        "/api/get_audios": {
            post: {
                tags: ["Audios"],
                summary: "Obtener lista de audios",
                responses: {
                    200: { description: "Lista de audios" }
                }
            }
        },

        "/api/get_sounds": {
            get: {
                tags: ["Streaming"],
                summary: "Obtener siguiente audio (stream)",
                responses: {
                    200: {
                        description: "Texto para Icecast",
                        content: {
                            "text/plain": {
                                example: 'annotate:title="X",artist="Y":url'
                            }
                        }
                    }
                }
            }
        },

        "/api/delete_audio": {
            post: {
                tags: ["Audios"],
                summary: "Eliminar audio",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["audioId"],
                                properties: {
                                    audioId: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Audio eliminado" }
                }
            }
        },

        // =========================
        // LIKES
        // =========================

        "/api/like_control": {
            post: {
                tags: ["Audios"],
                summary: "Like / Unlike",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/LikeRequest" }
                        }
                    }
                },
                responses: {
                    200: { description: "Lista de likes" }
                }
            }
        },

        "/api/get_likeList": {
            post: {
                tags: ["Audios"],
                summary: "Obtener likes del usuario",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: "Lista de URLs" }
                }
            }
        },

        // =========================
        // POSTS
        // =========================

        "/api/upload_post": {
            post: {
                tags: ["Posts"],
                summary: "Crear post",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/PostRequest" }
                        }
                    }
                }
            }
        },

        "/api/get_posts": {
            post: {
                tags: ["Posts"],
                summary: "Obtener posts paginados",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    page: { type: "number", example: 1 }
                                }
                            }
                        }
                    }
                }
            }
        },

        "/api/delete_post": {
            post: {
                tags: ["Posts"],
                summary: "Eliminar post",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/DeletePostRequest" }
                        }
                    }
                }
            }
        },

        // =========================
        // PODCAST
        // =========================

        "/api/upload_poadcast": {
            post: {
                tags: ["Podcasts"],
                summary: "Subir episodio",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/PodcastRequest" }
                        }
                    }
                }
            }
        },

        "/api/get_poadcast": {
            post: {
                tags: ["Podcasts"],
                summary: "Obtener podcasts"
            }
        }
    },
    apis: ["./conector.js"], // 👈 MUY IMPORTANTE: apunta a este archivo (conector)
};

export const swaggerSpec = swaggerJsdoc(options);

