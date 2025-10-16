import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AnalyzeRequest {
  plotId: string;
  imageUrl?: string;
  useCoordinates?: boolean;
}

interface NDVIResult {
  ndvi: number;
  evi: number;
  soilQuality: number;
  waterStress: number;
  degradationRisk: 'low' | 'medium' | 'high' | 'critical';
}

// Calculate NDVI from RGB values (simplified for demo)
function calculateNDVI(red: number, nir: number): number {
  if (red + nir === 0) return 0;
  return (nir - red) / (nir + red);
}

// Calculate EVI (Enhanced Vegetation Index)
function calculateEVI(red: number, nir: number, blue: number): number {
  const G = 2.5;
  const C1 = 6;
  const C2 = 7.5;
  const L = 1;
  const denominator = nir + C1 * red - C2 * blue + L;
  if (denominator === 0) return 0;
  return G * ((nir - red) / denominator);
}

// Simulate vegetation analysis from image or coordinates
function analyzeVegetation(latitude: number, longitude: number): NDVIResult {
  // In production, this would:
  // 1. Fetch satellite imagery from SentinelHub
  // 2. Process bands (Red, NIR, Blue) using OpenCV/NumPy equivalent
  // 3. Calculate actual NDVI/EVI values
  
  // Simulated values based on location (for demo)
  const latFactor = Math.abs(latitude) / 90;
  const lonFactor = (longitude + 180) / 360;
  
  // Simulate NDVI (-1 to 1, but typically 0.2-0.8 for vegetation)
  const ndvi = 0.3 + (Math.random() * 0.4) + (latFactor * 0.2);
  
  // Simulate EVI
  const evi = ndvi * 0.8 + (Math.random() * 0.1);
  
  // Soil quality (0-100)
  const soilQuality = 40 + (Math.random() * 40) + (ndvi * 20);
  
  // Water stress (0-100, lower is better)
  const waterStress = Math.max(0, 60 - (ndvi * 50) + (Math.random() * 20));
  
  // Determine degradation risk
  let degradationRisk: 'low' | 'medium' | 'high' | 'critical';
  if (ndvi > 0.6 && soilQuality > 70) {
    degradationRisk = 'low';
  } else if (ndvi > 0.4 && soilQuality > 50) {
    degradationRisk = 'medium';
  } else if (ndvi > 0.2) {
    degradationRisk = 'high';
  } else {
    degradationRisk = 'critical';
  }
  
  return {
    ndvi: Math.round(ndvi * 10000) / 10000,
    evi: Math.round(evi * 10000) / 10000,
    soilQuality: Math.round(soilQuality * 100) / 100,
    waterStress: Math.round(waterStress * 100) / 100,
    degradationRisk,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { plotId, imageUrl, useCoordinates }: AnalyzeRequest = await req.json();

    if (!plotId) {
      throw new Error('plotId is required');
    }

    // Fetch plot details
    const { data: plot, error: plotError } = await supabase
      .from('land_plots')
      .select('*')
      .eq('id', plotId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (plotError || !plot) {
      throw new Error('Plot not found or access denied');
    }

    // Perform analysis
    const analysis = analyzeVegetation(plot.latitude, plot.longitude);

    // Store analysis results
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('land_analytics')
      .insert({
        plot_id: plotId,
        ndvi_value: analysis.ndvi,
        evi_value: analysis.evi,
        soil_quality_score: analysis.soilQuality,
        water_stress_level: analysis.waterStress,
        degradation_risk: analysis.degradationRisk,
        image_url: imageUrl || null,
        metadata: {
          analysis_method: useCoordinates ? 'coordinates' : 'image',
          timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (analyticsError) {
      throw analyticsError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analyticsData,
        insights: {
          vegetationHealth: analysis.ndvi > 0.6 ? 'Excellent' : analysis.ndvi > 0.4 ? 'Good' : analysis.ndvi > 0.2 ? 'Fair' : 'Poor',
          soilCondition: analysis.soilQuality > 70 ? 'Excellent' : analysis.soilQuality > 50 ? 'Good' : 'Needs improvement',
          waterStatus: analysis.waterStress < 30 ? 'Adequate' : analysis.waterStress < 60 ? 'Moderate stress' : 'High stress',
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});