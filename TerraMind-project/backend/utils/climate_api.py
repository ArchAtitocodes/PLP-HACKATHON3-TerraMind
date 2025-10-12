import requests

async def get_climate_data(lat: float, lon: float) -> dict:
    """
    Fetches climate data from the NASA POWER API.
    """
    base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "parameters": "T2M,PRECTOTCORR", # Temperature at 2m, Precipitation
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": "20230101",
        "end": "20231231",
        "format": "JSON",
    }
    response = requests.get(base_url, params=params)
    response.raise_for_status()
    data = response.json()
    # Simplified: return a mock value for now
    return {"rainfall": 800} # Placeholder