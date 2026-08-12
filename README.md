# DevCopet Backend

> Backend service for DevCopet — a personalized programming learning platform powered by AI.

**🌐 Live Demo:** https://devcopet.vercel.app/

**🖥️ Frontend:** https://github.com/phuong-tran2006/devcopet_fe
### 🎨 Frontend Team

- **Trần Thị Yến Phương** - VietNam National University Ho Chi Minh City University of Technology
- **Đàng Tiến Thành** - VietNam National University Ho Chi Minh City University of Technology
### 👥 Backend Team

- **Nguyễn Hoàng Nhân** — VietNam National University Ho Chi Minh City University of Technology
- **Đặng Tuấn Kiệt** — VietNam National University Ho Chi Minh City University of Technology
- **Võ Chí Thành** — Ho Chi Minh City University of Technology and Engineering

## 📖 Overview

**DevCopet** is a personalized programming learning platform that combines interactive learning, AI assistance, and real-time arena experiences.

### 📚 Courses

Structured courses such as **Python** and **Data Structures**, combining learning materials with interactive coding exercises and practice quizzes .

### 🗺️ Learning Roadmap

A personalized **Learning Roadmap** guides learners from **Easy → Medium → Hard** through interactive challenges such as **Fill in the Blank, Multiple Choice, Arrange the Code, and Optimal Answer Selection...** while simultaneously tracking their learning progress.
### 🤖 AI-Powered Learning

A **context-aware AI Assistant** provides personalized learning support, while **AI-powered Daily Missions** adapt to each learner's progress and activities.

### ⚡ Real-Time Coding Arena

A **Real-Time Coding Arena** allows learners to practice programming with friends through collaborative and competitive coding experiences.

## 🛠️ Tech Stack

### Backend

- **NestJS** — Backend framework
- **TypeScript** — Programming language
- **MongoDB** — Database
- **Mongoose** — MongoDB object modeling

### Authentication & Security

- **JWT** — Access and refresh token authentication
- **Google OAuth** — Social authentication
- **GitHub OAuth** — Social authentication
- **Rate Limiting** — API and AI usage protection

### AI

- **Google Gemini Flash-Lite** — AI-powered learning assistance and Daily Missions
- **Context-Aware AI** — Personalized responses based on learning context

### Real-Time

- **WebSocket / Socket.IO** — Real-time communication for the Coding Arena

### Code Execution

- **Pyodide** — Browser-based Python code execution
  
## 🏗️ Architecture

DevCopet Backend is built with a modular architecture using **NestJS**, where each major domain is organized into an independent module.

```text
src/
├── common/                  # Shared utilities, guards, decorators, etc.
│
├── database/                # Database configuration and seed data
│   └── seeds/
│       ├── content/
│       ├── python-dsa.seed.ts
│       └── run-seed.ts
│
├── modules/
│   ├── ai-chat/             # Context-aware AI Assistant
│   ├── arena/               # Real-time coding arena
│   ├── auth/                # Authentication & OAuth
│   ├── chapters/            # Course chapters
│   ├── courses/             # Programming courses
│   ├── learning-history/    # Learning activity history
│   ├── lessons/             # Lessons and learning content
│   ├── missions/            # AI-powered daily missions
│   ├── onboarding/          # Learner onboarding
│   ├── personality-engine/  # Learner personality analysis
│   ├── pets/                # Gamification system
│   ├── profile-learning/    # Learning profile
│   ├── progress/            # Learning progress tracking
│   ├── quizzes/             # Quizzes and assessments
│   ├── roadmap/             # Personalized learning roadmap
│   └── users/               # User management
│
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

## 👨‍💻 My Contributions

As a Backend Developer, I contributed to:

- Developed **RESTful APIs** and modular backend services with **NestJS**
- Designed **MongoDB/Mongoose** schemas and data models
- Integrated **Google Gemini API** for the **Context-Aware AI Assistant** and **AI-powered Daily Missions**
- Developed the **Real-Time Arena** using **WebSocket / Socket.IO**
- Implemented **JWT authentication, OAuth, authorization, and rate limiting**
- Built **database seed scripts** for structured learning content and collaborated through **Git/GitHub**

## 🚀 Getting Started

### Prerequisites

Before running the project, make sure you have:

- **Node.js** and **npm**
  - If you haven't installed them yet, download and install Node.js from the official website.
  - Check your installation:
    ```bash
    node -v
    npm -v
    ```

- **MongoDB Atlas**
  - Create a MongoDB Atlas cluster.
  - Get your MongoDB connection string.
  - Create a `.env` file in the project root and add your MongoDB connection string:

    ```env
    MONGODB_URI=your_mongodb_connection_string
    ```

  - Replace `your_mongodb_connection_string` with your actual MongoDB Atlas connection string.

### Installation

Clone the repository:

```bash
git clone https://github.com/HnhanBk415/devcopet-backend.git
cd devcopet-backend
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root based on `.env.example`.

Configure the required environment variables, including your **MongoDB Atlas connection URI**, authentication credentials, and **Gemini API key**.

> ⚠️ Never commit your `.env` file or expose API keys, OAuth credentials, database credentials, or JWT secrets.

### Build the Application

Build the project before running the server:

```bash
npm run build
```

### Run the Development Server

Start the development server:

```bash
npm run start:dev
```

The backend will be available at:

```text
http://localhost:3000
```

### 📬 Contact

For questions, feedback, or collaboration:
- **Nguyễn Hoàng Nhân** — [hoang.nhanbkag@gmail.com](mailto:hoang.nhanbkag@gmail.com)
