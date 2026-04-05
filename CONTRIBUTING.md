<div align="center">

# <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=800&size=40&pause=1000&color=FF0055&center=true&vCenter=true&width=800&height=80&lines=Contribute+to+NEXUS;Join+the+Network;Enhance+the+Core" alt="Typing SVG - Contribute" style="max-width: 100%;" />

**First off, thank you for considering contributing to the ultimate uptime monitor! Establish your connection and begin building.**

<img src="https://raw.githubusercontent.com/7wq/7wq/main/imgs/line_multi.gif" width="100%" />

</div>

---

## 🛠️ The Mission

Nexus is open-source and built for everyone. Whether you're fixing bugs, adding new integrations, or optimizing the API, your code keeps the network alive.

<div align="center">
  <img src="https://raw.githubusercontent.com/7wq/7wq/main/imgs/line_multi.gif" width="100%" />
</div>

## 📡 Where do I go from here?

If you've noticed a vulnerability, glitch, or have a feature blueprint:
1. **Check the Radar:** Look at our [Issues](../../issues) page to see if a ticket is already active.
2. **Open a Channel:** If not, create an issue to describe the problem or feature before you begin coding!

## ⚙️ How to Establish a Sync (Fork & Branch)

If you're ready to deploy a fix:
1. **Fork the Core:** Click the `Fork` button at the top of the Nexus repository.
2. **Create a Feature Branch:** Always isolate your code. Use a descriptive name:
   ```bash
   git checkout -b feature/dynamic-alerts
   ```

<div align="center">
  <img src="https://raw.githubusercontent.com/7wq/7wq/main/imgs/line_multi.gif" width="100%" />
</div>

## 💻 Local Developer Environment

To get your local instance of Nexus running, you must ignite the Backend and Frontend nodes.

<details>
  <summary><b>1. Ignite the Backend (Node/Postgres) -> Click to view</b></summary>
  
  ```bash
  cd backend
  npm install
  npm run dev
  ```
  *Make sure your `.env` contains your `DATABASE_URL`!*
</details>

<details>
  <summary><b>2. Ignite the Frontend (React) -> Click to view</b></summary>
  
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  *This will launch the dashboard UI at `http://localhost:5173`.*
</details>

<div align="center">
  <img src="https://raw.githubusercontent.com/7wq/7wq/main/imgs/line_multi.gif" width="100%" />
</div>

## 🚀 Pushing the Payload (Pull Request)

1. Make your proposed changes to your isolated branch.
2. Keep your Pull Requests as compact and feature-focused as possible. (Don't combine 5 different features in one PR!)
3. Push your branch to your remote fork:
   ```bash
   git push origin feature/dynamic-alerts
   ```
4. Transmit the Pull Request from your branch into the `main` branch of the official Nexus repository.

We will review your code as quickly as possible. Welcome to the Nexus Alliance! 🤝

<div align="center">
  <img src="https://raw.githubusercontent.com/7wq/7wq/main/imgs/line_multi.gif" width="100%" />
</div>
