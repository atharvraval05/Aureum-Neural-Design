# 𝗔𝘂𝗿𝗲𝘂𝗺 ─ Spatial Intelligence Design Suite 🏡✨

Aureum is a next-generation, AR/VR-inspired spatial interior designer web application. It bridges the gap between text-based neural models and physical spaces by digitizing real-world environments and generating photorealistic style transformations in real-time. Built during the **Google Ideathon** hackathon.

---

## 🌟 Key Features

### 🛠️ 1. Room Scan (LiDAR Simulation)
*   **Dynamic Space Mapping:** Simulates a LiDAR/spatial scanning camera overlay.
*   **Object Identification:** Automatically maps boundaries, walls, and active objects within your physical environment.
*   **Visual HUD:** A real-time analysis overlay showing bounding indicators and detection markers.

### 🎨 2. Aether Vision (Neural Prompt Synthesis)
*   **Prompt-to-Space Manifestation:** Powered by Google's **Gemini API**, describe any custom aesthetic (e.g., *"Modern Industrial study with warm accent lighting"*).
*   **Generative AI Pipeline:** Multimodal model parses the digitized context alongside the prompt to render high-fidelity, tailored design recommendations and tips.

### 🛋️ 3. Interactive Design Canvas (Spatial Sync)
*   **Precision Drag Physics:** Precision drag-and-drop system powered by Framer Motion to stage furniture seamlessly inside your room mockup.
*   **AI Spatial Insights:** Displays dynamic tips explaining how to place items to maximize lighting, spacing, and aesthetic balance.
*   **Asset Showcase Links:** Quick external links on selected library models for direct showcase.

### ✨ 4. Style Makeover
*   **Instant Aesthetics Swap:** Dynamically change design presets (Japandi, Brutalist, Scandinavian, Art Deco, Biophilic) and preview structural alterations instantly.

---

## ⚙️ Tech Stack & Architecture

*   **Frontend Framework:** React 19 + Vite + TypeScript (fully type-safe architecture)
*   **Styling:** Tailwind CSS (luxury, dark editorial aesthetic)
*   **Motion & Interactions:** Framer Motion (touch-optimized precision physics)
*   **AI Integration:** Google Gemini API (via Google AI Studio & `@google/genai` SDK)
*   **Database & Core Services:** Supabase & Firebase

---

## 🚀 Getting Started

### Prerequisites
*   **Node.js** (v18.0.0 or higher recommended)
*   **npm** (v9.0.0 or higher)

### 1. Clone & Install
```bash
# Navigate to project folder
cd Aureum-Neural-Design

# Install dependencies
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory (based on `.env.example`) and fill in your keys:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Locally
```bash
npm run dev
```
Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Project Structure

```
Aureum-Neural-Design/
├── src/
│   ├── components/       # Custom design assets & layout components
│   │   ├── Navbar.tsx            # Navigation and Auth trigger
│   │   ├── SpatialIntelligence.tsx # LiDAR scan & mapping simulator
│   │   └── StyleVisionary.tsx    # Neural style rendering pipeline
│   ├── pages/            # View pages
│   │   ├── Home.tsx              # Interactive Landing & Scan entry
│   │   ├── Makeover.tsx          # Real-time style makeover interface
│   │   ├── AetherVision.tsx      # Prompt-to-space design oracle
│   │   ├── Community.tsx         # Shared catalog and filtering
│   │   └── Profile.tsx           # User configuration & saved spaces
│   ├── lib/              # Core utilities, context, and SDK initializations
│   └── App.tsx           # Application router
├── index.html            # Entry markup
├── vite.config.ts        # Vite compiler configurations
└── tsconfig.json         # TypeScript configuration
```

---

## 🤝 Contributing
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
