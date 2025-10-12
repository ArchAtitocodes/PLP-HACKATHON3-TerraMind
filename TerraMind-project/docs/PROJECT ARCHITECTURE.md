# 🧠 **Project Architecture Plan: “TerraMind – AI-Powered Land Regeneration Assistant (Gemini Version)”**

---

## 🏗️ **1. System Overview**

**Goal:**
An AI-driven web app that analyzes satellite and soil data to detect land degradation, suggest regenerative actions, and track progress over time — all stored and visualized via Supabase.

---

### 🔹 **Core Components**

| Component             | Description                                                                                                  | Tools                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| **Frontend (Web UI)** | Interactive map and dashboard for users to upload land data, view AI results, and chat with Gemini assistant | Next.js + Mapbox GL + Tailwind                               |
| **Backend API**       | Handles AI analysis requests, model inference, and database interaction                                      | FastAPI or Supabase Edge Functions                           |
| **Database**          | Stores land data, analysis results, user submissions, and impact history                                     | Supabase (Postgres + Auth + Storage)                         |
| **AI Engine**         | Performs satellite/soil analysis, classification, and crop recommendations                                   | Python ML models (Hugging Face, PyTorch, TensorFlow, OpenCV) |
| **GIS Layer**         | Provides real-time satellite imagery and NDVI/EVI vegetation indices                                         | SentinelHub / Google Earth Engine                            |
| **Assistant Layer**   | Gemini AI integration for chat-based explanations and insights                                               | Gemini API                                                   |

---

## 🧩 **2. Backend Architecture (FastAPI + Supabase)**

```
/api
│
├── /analyze_land
│   ├─ Accepts location or image
│   ├─ Calls AI model → vegetation/soil analysis
│   └─ Stores results in Supabase (table: land_analytics)
│
├── /recommend_crop
│   ├─ Fetches soil/climate data
│   ├─ AI predicts best crops/trees
│   └─ Returns ranked list with justifications
│
├── /track_progress
│   ├─ Pulls historical NDVI data
│   ├─ Calculates change % over time
│   └─ Updates Supabase record
│
└── /chat_regen
    ├─ Sends user query to Gemini AI
    └─ Returns context-aware sustainability advice
```

---

### 🧱 **Database Schema (Supabase)**

| Table               | Columns                                           | Purpose                         |
| ------------------- | ------------------------------------------------- | ------------------------------- |
| **users**           | id, name, email, role                             | Authentication & profiles       |
| **land_plots**      | id, user_id, lat, lon, name, area                 | Track each user’s land area     |
| **land_analytics**  | id, plot_id, ndvi, soil_score, erosion_risk, date | AI analysis results             |
| **recommendations** | id, plot_id, crop, score, reason                  | Suggested crops or trees        |
| **impact_logs**     | id, plot_id, before_img, after_img, delta_score   | Track regeneration improvements |

---

## 🧠 **3. AI Workflow**

### Step 1 — Image Ingestion

* User uploads satellite image OR selects location on map.
* API fetches corresponding Sentinel-2 or MODIS tile.

### Step 2 — Preprocessing

* Convert image to NDVI (Normalized Difference Vegetation Index).
* Optionally calculate EVI (Enhanced Vegetation Index).
* Use OpenCV to normalize contrast & remove clouds.

### Step 3 — Degradation Detection

* Pre-trained CNN model (e.g. U-Net, ResNet50) detects:

  * Bare soil
  * Vegetation
  * Water stress
  * Erosion channels
* Output: classification mask + degradation score (0–1).

### Step 4 — Soil & Climate Enrichment

* Pull external soil and climate data:

  * SoilGrids API (NPK levels, moisture, organic carbon)
  * NASA POWER (rainfall, evapotranspiration, temperature)
* Combine features for AI inference.

### Step 5 — Crop Recommendation

* Lightweight ML model predicts best species:

  * Inputs: NDVI + soil + climate features
  * Output: Ranked top 3 crops or reforestation species.
* Example output:

```json
[
  {"species": "Acacia tortilis", "score": 0.91, "reason": "Drought resistant"},
  {"species": "Sesbania sesban", "score": 0.84, "reason": "Improves soil nitrogen"},
  {"species": "Sorghum", "score": 0.77, "reason": "Tolerates low rainfall"}
]
```

### Step 6 — Regeneration Tracking

* Schedule weekly NDVI checks via API.
* Compute trend (ΔNDVI / ΔTime).
* Visualize progress in the dashboard.

---

## 💬 **4. Gemini AI Integration**

| Purpose           | Example Query                        |
| ----------------- | ------------------------------------ |
| Explain analysis  | “Why is my soil score only 60%?”     |
| Recommend actions | “What should I plant on sandy soil?” |
| Educational help  | “Explain NDVI in simple terms.”      |

* FastAPI route `/chat_regen` → calls Gemini API with context from Supabase data.
* Gemini replies with context-aware suggestions, sustainability insights, and explanations.
* Gemini can also analyze images or data tables for visual reasoning where supported.

---

## 🗺️ **5. Frontend Flow**

### User Journey

1. **Login / Register** → Supabase Auth.
2. **Map Interface:** Select area or upload satellite image.
3. **Analyze:** Calls `/analyze_land` → returns score + heatmap.
4. **Recommendations Tab:** AI-suggested crops.
5. **Progress Tab:** Graph showing NDVI improvements over time.
6. **Ask ReGen (Chat):** Gemini-powered Q&A on sustainable actions.
7. **Leaderboard:** Shows users with top regeneration scores.

---

## ⚙️ **6. APIs & Tools Integration**

| API / Tool                     | Purpose                                    |
| ------------------------------ | ------------------------------------------ |
| **SentinelHub / Earth Engine** | Satellite image retrieval                  |
| **SoilGrids API**              | Soil property data                         |
| **NASA POWER**                 | Climate parameters                         |
| **Supabase**                   | Database, authentication, and file storage |
| **Gemini API**                 | Natural language assistant                 |
| **Mapbox GL / Leaflet**        | Interactive mapping                        |
| **Hugging Face Models**        | Image segmentation & classification        |

---

## 🚀 **7. Demo-Ready MVP (within 5 days)**

| Day       | Task                                                 | Output                    |
| --------- | ---------------------------------------------------- | ------------------------- |
| **Day 1** | Setup Supabase, FastAPI, and UI skeleton             | Working login + dashboard |
| **Day 2** | Integrate satellite image upload + basic NDVI script | Heatmap output            |
| **Day 3** | Add crop recommendation model + Gemini chat          | AI insights tab           |
| **Day 4** | Add Supabase storage + visualization dashboard       | Persistent results        |
| **Day 5** | Polish UI + prepare demo video                       | Pitch-ready MVP 🎥        |

---

## 🌍 **8. Scalability Vision**

* Integrate drone data for precision soil scanning.
* Partner with government or NGO reforestation programs.
* Add SMS or WhatsApp chatbot for rural access.
* Monetize via “Green Land Score” API for insurers or agri-firms.

---


