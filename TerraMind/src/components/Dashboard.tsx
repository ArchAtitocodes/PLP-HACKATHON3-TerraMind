import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, LandPlot } from '../lib/supabase';
import { LogOut, Plus, TrendingUp, MessageCircle, Map } from 'lucide-react';
import { LandPlotCard } from './LandPlotCard';
import { AddPlotModal } from './AddPlotModal';
import { PlotDetails } from './PlotDetails';
import { ChatInterface } from './ChatInterface';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [plots, setPlots] = useState<LandPlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<LandPlot | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadPlots();
  }, [user]);

  const loadPlots = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('land_plots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPlots(data);
    }
    setLoading(false);
  };

  const handlePlotAdded = () => {
    loadPlots();
    setShowAddModal(false);
  };

  if (selectedPlot) {
    return (
      <PlotDetails
        plot={selectedPlot}
        onBack={() => setSelectedPlot(null)}
      />
    );
  }

  if (showChat) {
    return (
      <ChatInterface
        plotId={undefined}
        onClose={() => setShowChat(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TerraMind</h1>
                <p className="text-xs text-gray-500">Land Regeneration Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowChat(true)}
                className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Farmer'}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Land Plots</h2>
            <p className="text-gray-600 mt-1">Monitor and improve your land health</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Plot
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
          </div>
        ) : plots.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <Map className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No plots yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start your regenerative journey by adding your first land plot
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Plot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plots.map((plot) => (
              <LandPlotCard
                key={plot.id}
                plot={plot}
                onClick={() => setSelectedPlot(plot)}
              />
            ))}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddPlotModal
          onClose={() => setShowAddModal(false)}
          onPlotAdded={handlePlotAdded}
        />
      )}
    </div>
  );
}
