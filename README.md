📘 CodeAtlas AI – Save and Interpret Code Snippets

A production-ready full-stack application that allows developers to securely store, organize, bookmark, and interpret code snippets using AI-powered explanations.

🚀 Live Demo: https://codeatlas-ai.vercel.app/

🌐 Frontend: Vercel
⚙️ Backend API: Render

✨ Key Features:-

🧠 AI-Powered Code Interpretation:

- Real-time code explanation using Groq’s LLM API (LLaMA-based model).
- Server-side API calls for secure AI integration.
- Robust error handling and request validation.

📂 Snippet Management:

- Create, view, and delete reusable code snippets.
- Associate snippets with specific users.
- Bookmark snippets for later. 

🔐 Authentication & Security:

- Secure user registration and login with JWT-based authentication.
- Password hashing using bcrypt.
- Protected REST endpoints with token validation middleware.

⭐ Smart Bookmarking System:

- Toggle bookmarks per snippet.
- Dedicated bookmarks section for quick access.
- Bookmarked snippet with code + explanation.

🏗️ Architecture Overview:-

Frontend:

Vue.js
Vue Router
Axios
Responsive UI with modular component structure
Client-side state handling for bookmarks, snippets, and AI responses

Backend:

Node.js
Express.js (MVC architecture)
MongoDB with Mongoose
JWT authentication middleware
RESTful API design
Groq API integration via secure server-side Axios calls

Database Modeling:

- User → Snippets (1:N)
- User → Bookmarks (1:N)
- Snippet → Bookmarks (virtual relationships)
- Mongoose virtuals for relational population

🚀 Deployment:-

Frontend: Deployed on Vercel
Backend: Deployed on Render

⚡ Architecture Highlights:

- Clean MVC backend structure.
- Secure separation of client and server responsibilities.
- Asynchronous processing with structured error propagation.

📌 What This Project Demonstrates:-

- End-to-end full-stack architecture.
- Secure authentication + authorization flows.
- AI integration within production REST APIs.
- Clean data modeling with relational consistency.
- Deployment-ready configuration across multiple cloud platforms.
- Real-world developer tool design with practical UX decisions.