<div align="center">
  <h1>🚀 TYPERUNNER : CYBERPUNK</h1>
  <p><i>Type Fast. Stay Alive. Break Records.</i></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/PeerJS-FF3E00?style=for-the-badge&logo=webrtc&logoColor=white" alt="PeerJS" />
    <img src="https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white" alt="ThreeJs" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </p>
</div>

<br />

**TypeRunner** is an adrenaline-fueled, cyberpunk-themed typing survival game featuring both Solo and **Zero-Latency P2P Multiplayer**. Pilot a high-speed orbital fighter jet through a neon-grid tunnel and type incoming words to blast them out of the sky before they breach your shields. 

Built entirely as a modern web-app, it features a **procedurally generated 140 BPM WebAudio Techno engine**, high-fidelity particle effects, Three.js 3D rendering, and real-time WebRTC multiplayer—all cleanly deployable to Vercel with zero backend costs!

---

## 🌟 Key Features

🔥 **Adrenaline-Pumping Gameplay Loop**  
Words fly towards your screen on a 3D isometric pseudo-grid. Difficulty aggressively scales across 4 distinct visual tiers, increasing speed and word complexity!

⚡ **Vercel-Ready WebRTC P2P Multiplayer**  
Play directly against your friends with literally zero latency. Uses **PeerJS** to open UDP data-channels directly between browsers. No central servers, no polling delays, absolutely pure connection.

🎧 **Custom Generative Audio Engine (140 BPM)**  
No MP3s used. We built a scratch WebAudio engine that procedurally generates a consistent, high-energy techno bassline, punchy kicks, melodic square synth leads, and combo-escalating SFX to keep you in the zone.

🎛️ **Dynamic 3D UI & Next-Gen Particles**  
- Interactive **tsParticles** matrix networks in the background.
- A real-time **Vanilla Three.js Crystal** spinner integrated directly into your HUD, actively spinning faster and glowing red as your multiplier builds!
- 4 Upgradable Tiers of Fighter Jets and Projectiles (Unlock the Omega Lance!).

---
## 🛠 Tech Stack

### Frontend Core
- **Framework**: React 18 (Vite)
- **Multiplayer**: **PeerJS (WebRTC)** for direct P2P socket connections. Completely serverless.
- **Styling**: Tailwind CSS, Vanilla CSS (`perspective`, `transform` for pseudo-3D game track)
- **Animation**: Framer Motion

### Graphics & VFX
- **tsParticles**: Used for dynamic constellation tracking in the lobby.
- **Three.js**: Used for spinning 3D primitive geometry in the HUD that reacts to player performance arrays.

### Legacy Backend (Optional Docker Hook)
- **Engine**: Node.js + Express
- **Usage**: A dormant legacy folder kept purely structured for optional docker usage. The frontend runs completely disconnected and serverless!

---

## 🚀 Deployment & Quick Start

### 1. Vercel / Netlify Deployment (Recommended)
Because the entire multiplayer engine operates purely on P2P WebRTC, there is **NO backend required!**
1. Connect your Github repository to **Vercel**.
2. Set the Root Directory to `frontend`.
3. Build Command: `npm run build` | Output Directory: `dist`
4. **Deploy.** 

### 2. Local Docker Setup 
This repository includes a `docker-compose.yml` for testing the static delivery system locally.
```bash
docker-compose up --build
```
Open your browser to: `http://localhost:5173/`

---

## 🕹️ How to Play

1. **Enter your CallSign (Handle)** on the Main Menu.
2. Hit **ENGAGE** (or MULTIPLAYER to challenge a friend).
3. **Type the words** as they fly towards you.
4. **Build your Combo**: Successive correct words build a massive multiplier. Getting combos triggers streak fires, alters your jet visual, and makes the game completely intense!
5. **Survive!** The longer you survive, the harder it gets!

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
