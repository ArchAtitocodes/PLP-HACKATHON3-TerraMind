from sentinelhub import (
    SHConfig,
    SentinelHubRequest,
    DataCollection,
    MimeType,
    bbox_to_dimensions,
    BBox,
    CRS
)
from ..config import settings

async def get_satellite_image(lat: float, lon: float):
    """
    Fetches a true-color satellite image from Sentinel Hub for a given coordinate.
    """
    config = SHConfig()
    config.sh_client_id = settings.SENTINELHUB_CLIENT_ID
    config.sh_client_secret = settings.SENTINELHUB_CLIENT_SECRET
    config.sh_instance_id = settings.SENTINELHUB_INSTANCE_ID

    # Define a small bounding box around the point
    bbox_size = 0.01
    bbox = BBox(bbox=(lon - bbox_size, lat - bbox_size, lon + bbox_size, lat + bbox_size), crs=CRS.WGS84)
    size = bbox_to_dimensions(bbox, resolution=10) # 10m resolution

    evalscript_true_color = """
        //VERSION=3
        function setup() { return { input: ["B04", "B03", "B02"], output: { bands: 3 } }; }
        function evaluatePixel(sample) { return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02]; }
    """

    request = SentinelHubRequest(
        evalscript=evalscript_true_color,
        input_data=[SentinelHubRequest.input_data(data_collection=DataCollection.SENTINEL2_L1C, time_interval=("2023-10-01", "2023-12-31"))],
        responses=[SentinelHubRequest.output_response("default", MimeType.PNG)],
        bbox=bbox,
        size=size,
        config=config,
    )
    
    image_data = request.get_data()[0]
    return image_data