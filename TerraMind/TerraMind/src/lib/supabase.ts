import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: 'farmer' | 'consultant' | 'researcher' | 'admin';
}

export interface LandPlot {
  id: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  area_hectares: number;
  boundary_geojson?: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LandAnalytics {
  id: string;
  plot_id: string;
  analysis_date: string;
  ndvi_value: number;
  evi_value: number;
  soil_quality_score: number;
  water_stress_level: number;
  degradation_risk: 'low' | 'medium' | 'high' | 'critical';
  image_url?: string;
  metadata?: any;
  created_at: string;
}

export interface Recommendation {
  id: string;
  plot_id: string;
  analytics_id?: string;
  recommendation_type: 'crop' | 'tree' | 'practice' | 'intervention';
  item_name: string;
  reason: string;
  confidence_score: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expected_impact?: {
    ndviIncrease: number;
    soilImprovement: number;
    timeframe: string;
  };
  implementation_notes?: string;
  created_at: string;
}

export interface ImpactLog {
  id: string;
  plot_id: string;
  baseline_analytics_id?: string;
  current_analytics_id?: string;
  time_period_days: number;
  ndvi_delta: number;
  evi_delta: number;
  soil_quality_delta: number;
  improvement_percentage: number;
  before_image_url?: string;
  after_image_url?: string;
  notes?: string;
  created_at: string;
}
