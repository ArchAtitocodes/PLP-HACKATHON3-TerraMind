import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# This is a mock/placeholder model. In a real application,
# you would load a pre-trained model file (e.g., a .pkl file).

# Mock data for training a placeholder model
mock_data = {
    'ndvi': [0.2, 0.8, 0.5, 0.3, 0.9],
    'soil_ph': [6.5, 7.0, 5.5, 6.8, 7.2],
    'rainfall': [500, 1200, 800, 600, 1500],
    'crop': ['Sorghum', 'Rice', 'Maize', 'Sorghum', 'Rice']
}
df = pd.DataFrame(mock_data)
X = df[['ndvi', 'soil_ph', 'rainfall']]
y = df['crop']

# Train a simple classifier
model = RandomForestClassifier(n_estimators=10, random_state=42)
model.fit(X, y)

def recommend_crops_for_profile(ndvi: float, soil_data: dict, climate_data: dict):
    """
    Recommends crops using a pre-trained model.
    This is a simplified placeholder.
    """
    # Create a feature vector from the input data
    # This needs to match the features the model was trained on
    input_features = pd.DataFrame([[ndvi, soil_data.get('ph', 6.5), climate_data.get('rainfall', 800)]],
                                  columns=['ndvi', 'soil_ph', 'rainfall'])
    
    prediction = model.predict(input_features)
    
    return [{"name": prediction[0], "reason": "Good match for soil and climate.", "score": 0.85}]