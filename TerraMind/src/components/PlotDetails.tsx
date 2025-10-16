import { useState, useEffect } from 'react';
import { LandPlot, LandAnalytics, Recommendation, supabase } from '../lib/supabase';
import { ArrowLeft, Activity, Leaf, TrendingUp, Sparkles, MessageCircle, Loader } from 'lucide-react';
import { analyzeLand, recommendCrop } from '../lib/api';
import { ChatInterface } from './ChatInterface';

interface PlotDetailsProps {
  plot: LandPlot;
  onBack: () => void;
}

export function PlotDetails({ plot, onBack }: PlotDetailsProps) {
  const [analytics, setAnalytics] = useState<LandAnalytics[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadData();
  }, [plot.id]);

  const loadData = async () => {
    setLoading(true);

    const [analyticsRes, recsRes] = await Promise.all([
      supabase
        .from('land_analytics')
        .select('*')
        .eq('plot_id', plot.id)
        .order('analysis_date', { ascending: false }),
      supabase
        .from('recommendations')
        .select('*')
        .eq('plot_id', plot.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (analyticsRes.data) setAnalytics(analyticsRes.data);
    if (recsRes.data) setRecommendations(recsRes.data);

    setLoading(false);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzeLand(plot.id, undefined, true);
      await recommendCrop(plot.id);
      await loadData();
    } catch (error: any) {
      console.error('Analysis failed:', error);
      alert(error.message || 'Failed to analyze land');
    } finally {
      setAnalyzing(false);
    }
  };

  const latestAnalytics = analytics[0];

  if (showChat) {
    return <ChatInterface plotId={plot.id} onClose={() => setShowChat(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{plot.name}</h1>
              <p className="text-gray-600 mt-1">
                {plot.latitude.toFixed(6)}, {plot.longitude.toFixed(6)} • {plot.area_hectares} hectares
              </p>
              {plot.description && (
                <p className="text-gray-500 mt-2">{plot.description}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowChat(true)}
                className="px-4 py-2.5 border border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Ask AI
              </button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    Analyze Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {latestAnalytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-600">NDVI</h3>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {latestAnalytics.ndvi_value.toFixed(3)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Vegetation Index</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-600">Soil Quality</h3>
                    <Leaf className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {latestAnalytics.soil_quality_score.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Out of 100</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-600">Water Stress</h3>
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {latestAnalytics.water_stress_level.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Lower is better</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-600">Risk Level</h3>
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {latestAnalytics.degradation_risk}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Degradation Risk</p>
                </div>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-green-600" />
                  AI Recommendations
                </h2>
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{rec.item_name}</h3>
                          <span className="text-xs text-gray-500 capitalize">
                            {rec.recommendation_type} • {rec.priority} priority
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          {(rec.confidence_score * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{rec.reason}</p>
                      {rec.implementation_notes && (
                        <p className="text-gray-600 text-xs bg-gray-50 p-3 rounded-lg">
                          {rec.implementation_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analytics.length === 0 && !analyzing && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Analysis Data Yet</h3>
                <p className="text-gray-600 mb-6">
                  Click "Analyze Now" to start monitoring this land plot
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
