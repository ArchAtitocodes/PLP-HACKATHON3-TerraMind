import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CropRecommendation {
  type: 'crop' | 'tree' | 'practice';
  name: string;
  reason: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expectedImpact: {
    ndviIncrease: number;
    soilImprovement: number;
    timeframe: string;
  };
  implementationNotes: string;
}

// Crop database with suitability criteria
const cropDatabase = [
  {
    name: 'Legumes (Beans, Peas)',
    type: 'crop',
    minNDVI: 0,
    maxNDVI: 0.5,
    minSoil: 30,
    nitrogenFixing: true,
    waterTolerance: 'moderate',
    reason: 'Nitrogen-fixing properties improve soil health',
    impact: { ndviIncrease: 0.15, soilImprovement: 25, timeframe: '3-6 months' },
    notes: 'Plant in well-drained soil. Rotate with cereal crops.'
  },
  {
    name: 'Cover Crops (Clover, Vetch)',
    type: 'practice',
    minNDVI: 0,
    maxNDVI: 0.4,
    minSoil: 20,
    nitrogenFixing: true,
    waterTolerance: 'high',
    reason: 'Prevents erosion and adds organic matter',
    impact: { ndviIncrease: 0.2, soilImprovement: 30, timeframe: '6-12 months' },
    notes: 'Plant between main crop seasons. Incorporate into soil before flowering.'
  },
  {
    name: 'Moringa Trees',
    type: 'tree',
    minNDVI: 0.2,
    maxNDVI: 0.6,
    minSoil: 40,
    nitrogenFixing: false,
    waterTolerance: 'low',
    reason: 'Fast-growing, nutrient-rich, drought-resistant',
    impact: { ndviIncrease: 0.25, soilImprovement: 20, timeframe: '12-24 months' },
    notes: 'Space 2-3 meters apart. Prune regularly for optimal growth.'
  },
  {
    name: 'Agroforestry (Mixed System)',
    type: 'practice',
    minNDVI: 0.3,
    maxNDVI: 1,
    minSoil: 50,
    nitrogenFixing: false,
    waterTolerance: 'moderate',
    reason: 'Combines trees with crops for biodiversity',
    impact: { ndviIncrease: 0.3, soilImprovement: 40, timeframe: '24-36 months' },
    notes: 'Integrate nitrogen-fixing trees with annual crops. Plan for long-term benefits.'
  },
  {
    name: 'Sorghum',
    type: 'crop',
    minNDVI: 0.3,
    maxNDVI: 0.7,
    minSoil: 45,
    nitrogenFixing: false,
    waterTolerance: 'low',
    reason: 'Drought-tolerant cereal with deep roots',
    impact: { ndviIncrease: 0.1, soilImprovement: 15, timeframe: '4-6 months' },
    notes: 'Suitable for semi-arid regions. Requires minimal irrigation.'
  },
  {
    name: 'Bamboo Groves',
    type: 'tree',
    minNDVI: 0.4,
    maxNDVI: 1,
    minSoil: 60,
    nitrogenFixing: false,
    waterTolerance: 'high',
    reason: 'Rapid carbon sequestration and erosion control',
    impact: { ndviIncrease: 0.35, soilImprovement: 35, timeframe: '18-30 months' },
    notes: 'Excellent for riparian zones. Harvest sustainably for income.'
  },
];

function generateRecommendations(
  ndvi: number,
  soilQuality: number,
  waterStress: number,
  degradationRisk: string
): CropRecommendation[] {
  const recommendations: CropRecommendation[] = [];

  // Filter suitable options
  const suitableOptions = cropDatabase.filter(
    (crop) =>
      ndvi >= crop.minNDVI &&
      ndvi <= crop.maxNDVI &&
      soilQuality >= crop.minSoil
  );

  // Prioritize based on degradation risk
  let priorityBoost = 0;
  if (degradationRisk === 'critical') priorityBoost = 3;
  else if (degradationRisk === 'high') priorityBoost = 2;
  else if (degradationRisk === 'medium') priorityBoost = 1;

  // Score and select top recommendations
  const scored = suitableOptions.map((crop) => {
    let score = 0.5;

    // Boost score for nitrogen-fixing in poor soil
    if (crop.nitrogenFixing && soilQuality < 50) score += 0.2;

    // Boost score for drought-tolerant in water stress
    if (crop.waterTolerance === 'low' && waterStress > 50) score += 0.15;

    // Boost score for practices in degraded land
    if (crop.type === 'practice' && degradationRisk !== 'low') score += 0.15;

    // Determine priority
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    if (score > 0.8 || priorityBoost >= 2) priority = 'urgent';
    else if (score > 0.65 || priorityBoost >= 1) priority = 'high';
    else if (score < 0.4) priority = 'low';

    return {
      ...crop,
      confidence: Math.min(0.99, score),
      priority,
    };
  });

  // Sort by confidence and take top 5
  scored.sort((a, b) => b.confidence - a.confidence);
  const topRecommendations = scored.slice(0, 5);

  return topRecommendations.map((rec) => ({
    type: rec.type as 'crop' | 'tree' | 'practice',
    name: rec.name,
    reason: rec.reason,
    confidence: Math.round(rec.confidence * 100) / 100,
    priority: rec.priority,
    expectedImpact: rec.impact,
    implementationNotes: rec.notes,
  }));
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

    const { plotId, analyticsId } = await req.json();

    if (!plotId) {
      throw new Error('plotId is required');
    }

    // Fetch latest analytics if not provided
    let analytics;
    if (analyticsId) {
      const { data, error } = await supabase
        .from('land_analytics')
        .select('*')
        .eq('id', analyticsId)
        .single();
      if (error) throw error;
      analytics = data;
    } else {
      const { data, error } = await supabase
        .from('land_analytics')
        .select('*')
        .eq('plot_id', plotId)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('No analytics found for this plot');
      analytics = data;
    }

    // Generate recommendations
    const recommendations = generateRecommendations(
      analytics.ndvi_value,
      analytics.soil_quality_score,
      analytics.water_stress_level,
      analytics.degradation_risk
    );

    // Store recommendations in database
    const recommendationsToInsert = recommendations.map((rec) => ({
      plot_id: plotId,
      analytics_id: analytics.id,
      recommendation_type: rec.type,
      item_name: rec.name,
      reason: rec.reason,
      confidence_score: rec.confidence,
      priority: rec.priority,
      expected_impact: rec.expectedImpact,
      implementation_notes: rec.implementationNotes,
    }));

    const { data: savedRecs, error: insertError } = await supabase
      .from('recommendations')
      .insert(recommendationsToInsert)
      .select();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        success: true,
        recommendations: savedRecs,
        summary: {
          totalRecommendations: recommendations.length,
          urgentActions: recommendations.filter((r) => r.priority === 'urgent').length,
          focusArea: analytics.degradation_risk === 'critical' || analytics.degradation_risk === 'high'
            ? 'Soil regeneration'
            : 'Sustainable intensification',
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