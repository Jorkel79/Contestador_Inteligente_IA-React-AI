# 🤖 Smart Reply AI

Smart Reply AI es una aplicación web que automatiza la generación de respuestas a correos electrónicos utilizando inteligencia artificial.

El sistema conecta Gmail con un backend en Node.js y utiliza modelos de lenguaje para generar respuestas profesionales basadas en el contenido del correo. El usuario puede traer el último correo recibido o escribir/editar manualmente el contenido antes de generar la respuesta.

Este proyecto demuestra la integración entre APIs externas, automatización y generación de texto mediante inteligencia artificial.

---

# 🚀 Características

* Lectura de correos desde Gmail
* Generación automática de respuestas con IA
* Interfaz para visualizar y editar el contenido del correo
* Backend con API REST
* Integración con OpenAI API
* Integración con Gmail API
* Persistencia con MongoDB

---

# 🧠 Tecnologías utilizadas

### Backend

* Node.js
* Express
* MongoDB
* Gmail API
* OpenAI API
* Dotenv

### Frontend

* React
* JavaScript
* Fetch API

---

# 🏗️ Arquitectura

Frontend (React)

⬇

Backend API (Node.js + Express)

⬇

Integraciones externas

* Gmail API
* OpenAI API

⬇

Base de datos

* MongoDB

---

# 📦 Instalación

Clonar el repositorio

```
git clone https://github.com/tuusuario/smart-reply-ai.git
```

Entrar al proyecto

```
cd smart-reply-ai
```

Instalar dependencias del backend

```
cd backend
npm install
```

Instalar dependencias del frontend

```
cd ../frontend
npm install
```

---

# 🔑 Variables de entorno

Crear un archivo `.env` dentro de la carpeta **backend**.

Ejemplo:

```
OPENAI_API_KEY=your_openai_api_key
MONGO_URI=mongodb://127.0.0.1:27017/smartreply
PORT=4000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback
```

---

# ▶️ Ejecutar el proyecto

Ejecutar el backend

```
cd backend
npm start
```

Ejecutar el frontend

```
cd frontend
npm start
```

La aplicación estará disponible en:

```
http://localhost:3000
```

---

# 📡 Endpoints principales

### Obtener correos

```
GET /emails
```

Devuelve los últimos correos del inbox.

---

### Generar respuesta con IA

```
POST /generate-reply
```

Body:

```
{
  "emailText": "contenido del correo"
}
```

Respuesta:

```
{
  "reply": "respuesta generada por IA"
}
```

---

# 🧪 Flujo de uso

1. El sistema obtiene el último correo desde Gmail.
2. El usuario puede editar o escribir manualmente el contenido.
3. El backend envía el texto al modelo de lenguaje.
4. La IA genera una respuesta profesional.
5. La respuesta se muestra en la interfaz.

---

# 🎯 Objetivo del proyecto

Este proyecto fue desarrollado para practicar:

* integración de APIs externas
* automatización de flujos de trabajo
* uso de inteligencia artificial en aplicaciones reales
* arquitectura fullstack

---

# 📚 Aprendizajes

Durante el desarrollo se trabajó con:

* autenticación OAuth con Gmail
* manejo de variables de entorno
* integración con APIs externas
* diseño de prompts para generación de texto
* comunicación entre frontend y backend

---

# 👨‍💻 Autor

Jorge Raúl Valencia Santos

Proyecto personal enfocado en automatización, integración de APIs y uso práctico de inteligencia artificial en aplicaciones web.
