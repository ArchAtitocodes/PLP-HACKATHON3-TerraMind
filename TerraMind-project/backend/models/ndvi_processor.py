import numpy as np

def calculate_ndvi(nir_band: np.ndarray, red_band: np.ndarray) -> float:
    """
    Calculates the average NDVI for an image using NIR and Red bands.
    
    Args:
        nir_band (np.ndarray): The Near-Infrared band of the image.
        red_band (np.ndarray): The Red band of the image.

    Returns:
        float: The average NDVI value for the image.
    """
    # Ensure bands are float to avoid division errors
    nir = nir_band.astype(float)
    red = red_band.astype(float)

    # Calculate NDVI: (NIR - Red) / (NIR + Red)
    # Add a small epsilon to avoid division by zero
    ndvi = np.divide((nir - red), (nir + red + 1e-8))
    
    return np.nanmean(ndvi)