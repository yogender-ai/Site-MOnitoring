<div align="center">

# <a href="https://github.com/yogender-ai/Site-Monitoring"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=800&size=40&pause=1000&color=3B82F6&center=true&vCenter=true&width=600&height=80&lines=Premium+Site+Monitor;Continuous+Uptime+Tracking;Real-Time+Analytics;Zero+Downtime" alt="Typing SVG" /></a>

**A high-performance, full-stack site monitoring application designed to continuously track website uptime, prevent server hibernation, and display real-time analytics through a luxuriously modern dashboard.**

[![GitHub license](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Deployed on Render](https://img.shields.io/badge/Render-%46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

<br />

<img src="https://skillicons.dev/icons?i=react,tailwind,vite,nodejs,express,postgres,js,html,css&theme=dark" alt="Tech Stack" />

</div>

---

## ⚡ Why Premium Site Monitor?

Instead of relying on costly third-party services, host your own robust monitoring infrastructure! Check it out:

- 🚀 **Real-Time Uptime Tracking:** Automatically pings specified URLs at customizable intervals.
- 📊 **Interactive Visualizations:** View historical uptime data and latency trends on dynamic charts powered by **Recharts**.
- 💫 **High-End UI/UX:** A sleek, fully responsive dashboard built with **Tailwind CSS** and **Framer Motion** for smooth, buttery micro-animations.
- 🛡️ **Anti-Sleep Mechanism:** Built-in keep-alive polling ensures your servers never go to sleep on platforms like Render or Vercel.
- 🗄️ **Robust Local/Cloud Storage:** Relational data storage utilizing **PostgreSQL** to maintain monitor history securely.

<br />

<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</div>

## 🛠️ Technology Stack Breakdown

| Layer | Technologies Used | Purpose |
| ------ | ----------------- | ------- |
| **Frontend** | React 19 (Vite), Tailwind CSS, Framer Motion | High-performance, animated UI styling and seamless rendering. |
| **Icons & Charts** | Lucide-React, Recharts | Dynamic, scalable SVGs and interactive data analytics. |
| **Backend API** | Node.js, Express.js, Axios | Non-blocking API for handling concurrent URL pinging/polling. |
| **Database** | PostgreSQL (pg driver) | Secure, persistent storage for logs and configurations. |

<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</div>

## 🚀 Getting Started

Follow these instructions to quickly deploy your own site monitor instance.

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Local or Cloud like Neon/Supabase)

### 1. ⚙️ Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/sitemonitor
RENDER_EXTERNAL_URL=https://your-render-app-url.onrender.com # (Optional for auto self-ping logic)
```

Start the backend server:
```bash
npm run dev
```

### 2. 🎨 Frontend Setup
Open a new terminal window:
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Your app will be running at `http://localhost:5173` with the API responding on `http://localhost:5000`! 🎉

<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</div>

## 📂 Architecture & Directory Structure

```text
📦 Site-Monitoring/
 ┣ 📂 backend/               # ⚙️ Express API & Logic
 ┃ ┣ 📜 db.js                # Database connection/schema definition
 ┃ ┣ 📜 pinger.js            # Background concurrent site poller
 ┃ ┗ 📜 server.js            # API routing & Keep-alive cron
 ┗ 📂 frontend/              # 🎨 React Application
   ┣ 📂 src/
   ┃ ┣ 📜 api.js             # API caller (Axios)
   ┃ ┣ 📜 App.jsx            # Dynamic Layouts & State
   ┃ ┗ 📜 index.css          # Tailwind Directives
   ┗ 📜 tailwind.config.js
```

<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</div>

## 🤝 Contributing
Contributions, issues, and feature requests are highly welcome! Feel free to check the issues page if you want to contribute.

## 📄 License
This project is officially licensed under the **ISC License**. Build, deploy, and monitor away!

<br />

<div align="center">

**Made with ❤️ using React & Node.js**

</div>
