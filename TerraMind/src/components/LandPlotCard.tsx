import { useState, useEffect } from 'react';
import { LandPlot, LandAnalytics, supabase } from '../lib/supabase';
import { MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface LandPlotCardProps {
  plot: LandPlot;
  onClick: () => void;
}

export function LandPlotCard({ plot, onClick }: LandPlotCardProps) {
  const [latestAnalytics, setLatestAnalytics] = useState<LandAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [plot.id]);

  const loadAnalytics = async () => {
    const { data } = await supabase
      .from('land_analytics')
      .select('*')
      .eq('plot_id', plot.id)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    setLatestAnalytics(data);
    setLoading(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (ndvi: number) => {
    if (ndvi > 0.6) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (ndvi > 0.3) return <Minus className="w-5 h-5 text-yellow-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 overflow-hidden group"
    >
      <div className="h-32 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDE0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHpNMCA0NGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTYwIDBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div>
            <h3 className="text-xl font-bold text-white drop-shadow-lg">{plot.name}</h3>
            <div className="flex items-center gap-1.5 text-white/90 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{plot.area_hectares} ha</span>
            </div>
          </div>
          {latestAnalytics && (
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              {getHealthIcon(latestAnalytics.ndvi_value)}
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent"></div>
          </div>
        ) : latestAnalytics ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vegetation Index</span>
              <span className="font-semibold text-gray-900">
                {latestAnalytics.ndvi_value.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Soil Quality</span>
              <span className="font-semibold text-gray-900">
                {latestAnalytics.soil_quality_score.toFixed(0)}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Risk Level</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${getRiskColor(latestAnalytics.degradation_risk)}`}>
                {latestAnalytics.degradation_risk}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No analysis yet</p>
            <p className="text-xs text-gray-500 mt-1">Click to analyze</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full py-2 text-green-600 font-medium text-sm hover:bg-green-50 rounded-lg transition-colors group-hover:bg-green-50">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
