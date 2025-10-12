interface Crop {
  name: string;
  reason: string;
  score: number;
}

export default function CropRecommendation({ recommendations }: { recommendations: Crop[] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Crop Recommendations</h3>
      <ul className="space-y-4">
        {recommendations.map((crop) => (
          <li key={crop.name} className="border-b pb-2 last:border-b-0">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">{crop.name}</span>
              <span className="text-sm font-bold text-green-600">
                Score: {(crop.score * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-sm text-gray-600">{crop.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}