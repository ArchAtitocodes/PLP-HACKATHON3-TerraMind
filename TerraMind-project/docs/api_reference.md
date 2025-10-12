# TerraMind API Reference

This document provides detailed information about the API endpoints for the TerraMind backend.

**Base URL**: `/api`

---

## 1. Analysis

### `POST /analyze_land_coords`

Analyzes land health from a given set of geographic coordinates by fetching and processing satellite imagery.

**Request Body:**
```json
{
  "lat": 34.0522,
  "lon": -118.2437
}
```

**Response (200 OK):**
```json
{
  "plot_id": 1,
  "ndvi": 0.65,
  "evi": 0.5,
  "soil_quality": 75.0,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## 2. Recommendations

### `POST /recommend_crop`

Recommends suitable crops based on land analysis data, soil properties, and climate information.

**Request Body:**
```json
{
  "lat": 34.0522,
  "lon": -118.2437,
  "ndvi": 0.65
}
```

**Response (200 OK):**
```json
[
  {
    "name": "Sorghum",
    "reason": "Good match for soil and climate.",
    "score": 0.85
  }
]
```

---

## 3. Gemini Chat

### `POST /chat_regen`

Provides access to the Gemini-powered conversational assistant for sustainability advice.

**Request Body:**
```json
{
  "query": "Explain NDVI in simple terms.",
  "context": "{\"ndvi\": 0.65, \"soil_ph\": 6.8}"
}
```

**Response (200 OK):**
```json
{
  "response": "NDVI, or Normalized Difference Vegetation Index, is a simple indicator that tells us how healthy vegetation is. It's calculated from satellite images. High NDVI values (closer to 1) mean dense, healthy plants, while low values (closer to 0) indicate sparse or stressed vegetation."
}
```