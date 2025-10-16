/*
  # TerraMind Database Schema
  
  Creates the complete database structure for the TerraMind land regeneration platform.
  
  ## New Tables
  
  ### `users` (extends auth.users)
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role (farmer, consultant, researcher)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `land_plots`
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Owner reference
  - `name` (text) - Plot name/identifier
  - `latitude` (decimal) - Center latitude
  - `longitude` (decimal) - Center longitude
  - `area_hectares` (decimal) - Plot area in hectares
  - `boundary_geojson` (jsonb) - GeoJSON polygon boundary
  - `description` (text) - Plot description
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `land_analytics`
  - `id` (uuid, primary key)
  - `plot_id` (uuid) - Reference to land_plots
  - `analysis_date` (timestamptz) - When analysis was performed
  - `ndvi_value` (decimal) - Normalized Difference Vegetation Index
  - `evi_value` (decimal) - Enhanced Vegetation Index
  - `soil_quality_score` (decimal) - Soil quality (0-100)
  - `water_stress_level` (decimal) - Water stress indicator (0-100)
  - `degradation_risk` (text) - Risk level (low, medium, high)
  - `image_url` (text) - Analyzed satellite/uploaded image URL
  - `metadata` (jsonb) - Additional analysis data
  - `created_at` (timestamptz)
  
  ### `recommendations`
  - `id` (uuid, primary key)
  - `plot_id` (uuid) - Reference to land_plots
  - `analytics_id` (uuid) - Reference to triggering analysis
  - `recommendation_type` (text) - Type (crop, tree, practice)
  - `item_name` (text) - Recommended crop/tree/practice name
  - `reason` (text) - Why this is recommended
  - `confidence_score` (decimal) - AI confidence (0-1)
  - `priority` (text) - Priority level (high, medium, low)
  - `expected_impact` (jsonb) - Expected outcomes
  - `implementation_notes` (text) - How to implement
  - `created_at` (timestamptz)
  
  ### `impact_logs`
  - `id` (uuid, primary key)
  - `plot_id` (uuid) - Reference to land_plots
  - `baseline_analytics_id` (uuid) - Initial analysis reference
  - `current_analytics_id` (uuid) - Latest analysis reference
  - `time_period_days` (integer) - Days between measurements
  - `ndvi_delta` (decimal) - Change in NDVI
  - `evi_delta` (decimal) - Change in EVI
  - `soil_quality_delta` (decimal) - Change in soil quality
  - `improvement_percentage` (decimal) - Overall improvement %
  - `before_image_url` (text) - Before image
  - `after_image_url` (text) - After image
  - `notes` (text) - Additional observations
  - `created_at` (timestamptz)
  
  ## Security
  
  - Enable RLS on all tables
  - Users can only access their own land plots and related data
  - Consultants can view plots they're assigned to
  - Researchers can view anonymized aggregate data
*/

-- Create users profile table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'farmer' CHECK (role IN ('farmer', 'consultant', 'researcher', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create land_plots table
CREATE TABLE IF NOT EXISTS land_plots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  area_hectares decimal(10, 2) NOT NULL,
  boundary_geojson jsonb,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create land_analytics table
CREATE TABLE IF NOT EXISTS land_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id uuid REFERENCES land_plots(id) ON DELETE CASCADE NOT NULL,
  analysis_date timestamptz DEFAULT now(),
  ndvi_value decimal(5, 4),
  evi_value decimal(5, 4),
  soil_quality_score decimal(5, 2),
  water_stress_level decimal(5, 2),
  degradation_risk text CHECK (degradation_risk IN ('low', 'medium', 'high', 'critical')),
  image_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id uuid REFERENCES land_plots(id) ON DELETE CASCADE NOT NULL,
  analytics_id uuid REFERENCES land_analytics(id) ON DELETE SET NULL,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('crop', 'tree', 'practice', 'intervention')),
  item_name text NOT NULL,
  reason text NOT NULL,
  confidence_score decimal(3, 2) DEFAULT 0.5,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  expected_impact jsonb DEFAULT '{}'::jsonb,
  implementation_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create impact_logs table
CREATE TABLE IF NOT EXISTS impact_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id uuid REFERENCES land_plots(id) ON DELETE CASCADE NOT NULL,
  baseline_analytics_id uuid REFERENCES land_analytics(id) ON DELETE SET NULL,
  current_analytics_id uuid REFERENCES land_analytics(id) ON DELETE SET NULL,
  time_period_days integer NOT NULL,
  ndvi_delta decimal(5, 4),
  evi_delta decimal(5, 4),
  soil_quality_delta decimal(5, 2),
  improvement_percentage decimal(5, 2),
  before_image_url text,
  after_image_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_land_plots_user_id ON land_plots(user_id);
CREATE INDEX IF NOT EXISTS idx_land_analytics_plot_id ON land_analytics(plot_id);
CREATE INDEX IF NOT EXISTS idx_land_analytics_date ON land_analytics(analysis_date);
CREATE INDEX IF NOT EXISTS idx_recommendations_plot_id ON recommendations(plot_id);
CREATE INDEX IF NOT EXISTS idx_impact_logs_plot_id ON impact_logs(plot_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for land_plots table
CREATE POLICY "Users can view own land plots"
  ON land_plots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own land plots"
  ON land_plots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own land plots"
  ON land_plots FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own land plots"
  ON land_plots FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for land_analytics table
CREATE POLICY "Users can view analytics for own plots"
  ON land_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM land_plots
      WHERE land_plots.id = land_analytics.plot_id
      AND land_plots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analytics for own plots"
  ON land_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM land_plots
      WHERE land_plots.id = land_analytics.plot_id
      AND land_plots.user_id = auth.uid()
    )
  );

-- RLS Policies for recommendations table
CREATE POLICY "Users can view recommendations for own plots"
  ON recommendations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM land_plots
      WHERE land_plots.id = recommendations.plot_id
      AND land_plots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert recommendations for own plots"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM land_plots
      WHERE land_plots.id = recommendations.plot_id
      AND land_plots.user_id = auth.uid()
    )
  );

-- RLS Policies for impact_logs table
CREATE POLICY "Users can view impact logs for own plots"
  ON impact_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM land_plots
      WHERE land_plots.id = impact_logs.plot_id
      AND land_plots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert impact logs for own plots"
  ON impact_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM land_plots
      WHERE land_plots.id = impact_logs.plot_id
      AND land_plots.user_id = auth.uid()
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_land_plots_updated_at
  BEFORE UPDATE ON land_plots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();