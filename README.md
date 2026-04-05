<div align="center">

# <a href="https://github.com/yogender-ai/Site-Monitoring"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=800&size=45&pause=1000&color=00F0FF&center=true&vCenter=true&width=900&height=100&lines=NEXUS;Continuous+Uptime+Tracking;Real-Time+Analytics;Zero+Downtime;Next-Gen+Monitoring" alt="Typing SVG - Nexus" style="max-width: 100%;" /></a>

**The ultimate, full-stack monitoring nexus designed to continuously track website uptime, prevent server hibernation, and display real-time analytics through a futuristic dashboard.**

<p align="center">
  <a href="https://opensource.org/licenses/ISC"><img src="https://img.shields.io/badge/License-ISC-00F0FF?style=for-the-badge&logo=open-source-initiative&logoColor=white" alt="License"/></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=00F0FF" alt="React"/></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node"/></a>
  <a href="https://postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres"/></a>
  <a href="https://render.com/"><img src="https://img.shields.io/badge/Render-%46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render"/></a>
</p>

<br />

<!-- Interactive Tech Stack Icons (Clickable) -->
<a href="https://skillicons.dev">
  <img src="https://skillicons.dev/icons?i=react,tailwind,vite,nodejs,express,postgres,js,html,css&theme=dark" alt="Tech Stack" />
</a>

<br><br>

<img src="./assets/dashboard.png" alt="Nexus Dashboard Preview" width="100%" style="border-radius: 10px; box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);" />
> 💡 *Note: Save your actual dashboard screenshot as `dashboard.png` in an `assets` folder!*

<br><br>

<img src="https://raw.githubusercontent.com/7wq/7wq/main/imgs/line_multi.gif" width="100%" />

</div>

---

## ⚡ Why Nexus?

Take control of your infrastructure. Instead of relying on costly third-party services, **Nexus** allows you to host your own cutting-edge monitoring core:

<details>
  <summary><b>🔥 Real-Time Uptime Tracking (Click to expand)</b></summary>
  <p>Automatically pings specified URLs at customizable intervals (e.g. 60s, 5m). The system catches outages the second they happen so you can respond instantly.</p>
</details>

<details>
  <summary><b>📊 Interactive Visualizations (Click to expand)</b></summary>
  <p>View historical uptime data and latency trends on dynamic charts powered by Recharts. Complete with hover tooltips and rich data visualizations.</p>
</details>

<details>
  <summary><b>💫 Next-Gen UI/UX (Click to expand)</b></summary>
  <p>A sleek, fully responsive and futuristic dashboard built with Tailwind CSS and Framer Motion for smooth, buttery micro-animations that respond to your cursor.</p>
</details>

<details>
  <summary><b>🛡️ Anti-Sleep Engine (Click to expand)</b></summary>
  <p>Built-in keep-alive polling ensures your servers never go to sleep on platforms like Render or Vercel. Nexus keeps itself awake, automatically.</p>
</details>

<br />

<div align="center">
  <img src="https://raw.githubusercontent.com/7wq/7wq/main/imgs/line_multi.gif" width="100%" />
</div>

## 🛠️ The Nexus Core (Tech Stack)

| Component Layer | Weapons of Choice | Operational Purpose |
| :--- | :--- | :--- |
| **🟢 Frontend Client** | `React 19 (Vite)`, `Tailwind CSS`, `Framer Motion` | High-performance, animated UI styling and seamless interactive rendering. |
| **🔵 Data & Intel** | `Lucide-React`, `Recharts` | Dynamic, scalable SVG components and interactive real-time data analytics. |
| **🟣 Backend API** | `Node.js`, `Express.js`, `Axios` | Non-blocking API for handling concurrent URL pinging and heavy-duty polling. |
| **🟠 Core Database** | `PostgreSQL (pg)` | Secure, persistent storage vault for all uptime logs and system configurations. |

<div align="center">
  <img src="https://raw.githubusercontent.com/7wq/7wq/main/imgs/line_multi.gif" width="100%" />
</div>

## 🚀 Initializing Nexus

Follow these protocols to deploy your own instance of the Nexus site monitor.

### System Requirements
* Node.js (v18+ Engine)
* PostgreSQL Database (Local Relational or Cloud DB like Neon/Supabase)

### 1. ⚙️ Ignite the Backend

```bash
# Navigate to the backend core
cd backend

# Install operational dependencies
npm install
```

Establish a `.env` configuration file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/nexus
RENDER_EXTERNAL_URL=https://your-nexus-url.onrender.com # (Optional for auto self-ping engine)
```

Launch the intelligence relay:
```bash
npm run dev
```

### 2. 🎨 Ignite the Frontend
Open a secondary terminal:
```bash
# Navigate to the frontend UI
cd frontend

# Install UI dependencies
npm install

# Launch visual development server
npm run dev
```

> **SUCCESS:** Your Nexus dashboard will run on `http://localhost:5173` while the API responds on `http://localhost:5000`! 🎉

<div align="center">
  <img src="https://raw.githubusercontent.com/7wq/7wq/main/imgs/line_multi.gif" width="100%" />
</div>

## 📂 Architecture Topology

```text
📦 Nexus-Core/
 ┣ 📂 backend/               # ⚙️ Intelligence Node (Express API)
 ┃ ┣ 📜 db.js                # Database connection/schema definition
 ┃ ┣ 📜 pinger.js            # Background concurrent site poller
 ┃ ┗ 📜 server.js            # API routing & Keep-alive cron
 ┗ 📂 frontend/              # 🎨 Visual Node (React Application)
   ┣ 📂 src/
   ┃ ┣ 📜 api.js             # API communications link (Axios)
   ┃ ┣ 📜 App.jsx            # Dynamic Layouts & State
   ┃ ┗ 📜 index.css          # Tailwind Style System
   ┗ 📜 tailwind.config.js
```

<div align="center">
  <img src="https://raw.githubusercontent.com/7wq/7wq/main/imgs/line_multi.gif" width="100%" />
</div>

## 🤝 Alliance & Contributions
Do you want to enhance the Nexus? Contributions, issues, and feature requests are highly welcome! Establish a link on the issues page if you want to contribute to the core.

## 📄 Operational License
This project is officially licensed under the **ISC License**. Build, deploy, and monitor everything.

<br />

<div align="center">

**Developed with ⚡ for maximum uptime.**

<img src="https://komarev.com/ghpvc/?username=yogender-ai&label=Nexus+Views&color=00F0FF&style=flat-square" alt="Nexus Profile Views" />

</div>
