import requests

async def get_soil_data(lat: float, lon: float) -> dict:
    """
    Fetches soil properties from the SoilGrids API.
    """
    url = f"https://rest.soilgrids.org/query?lon={lon}&lat={lat}&properties=phh2o,cec,soc,sand,silt,clay"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    
    # Simplified parsing
    properties = data.get("properties", {})
    ph_value = properties.get("phh2o", {}).get("mean", 0) / 10.0 # phh2o is pH * 10
    
    return {"ph": ph_value}