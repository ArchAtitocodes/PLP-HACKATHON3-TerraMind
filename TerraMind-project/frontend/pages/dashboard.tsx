import MapView from '@/components/MapView';
import AnalysisCard from '@/components/AnalysisCard';
import CropRecommendation from '@/components/CropRecommendation';
import ProgressChart from '@/components/ProgressChart';
import ChatInterface from '@/components/ChatInterface';

export default function Dashboard() {
  // Mock data - in a real app, this would come from state or API calls
  const analysisData = { plot_id: 1, ndvi: 0.65, evi: 0.5, soil_quality: 75, timestamp: new Date().toISOString() };
  const cropData = [{ name: 'Sorghum', reason: 'Drought resistant', score: 0.9 }];
  const progressData = [
    { date: '2024-01-01', ndvi: 0.45 },
    { date: '2024-02-01', ndvi: 0.55 },
    { date: '2024-03-01', ndvi: 0.62 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">TerraMind Dashboard</h1>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MapView />
          <ProgressChart data={progressData} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <AnalysisCard data={analysisData} />
          <CropRecommendation recommendations={cropData} />
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}