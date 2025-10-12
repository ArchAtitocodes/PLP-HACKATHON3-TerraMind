interface AnalysisData {
  ndvi: number;
  evi: number;
  soil_quality: number;
}

export default function AnalysisCard({ data }: { data: AnalysisData }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Land Analysis</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="font-medium">NDVI Score:</span>
          <span className="font-bold text-green-600">{data.ndvi.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Soil Quality:</span>
          <span className="font-bold text-blue-600">{data.soil_quality.toFixed(0)}/100</span>
        </div>
        {/* Add more metrics as needed */}
      </div>
    </div>
  );
}