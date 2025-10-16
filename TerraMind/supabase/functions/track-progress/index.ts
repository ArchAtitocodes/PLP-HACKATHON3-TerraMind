import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

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

    const { plotId } = await req.json();

    if (!plotId) {
      throw new Error('plotId is required');
    }

    // Verify plot ownership
    const { data: plot, error: plotError } = await supabase
      .from('land_plots')
      .select('*')
      .eq('id', plotId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (plotError || !plot) {
      throw new Error('Plot not found or access denied');
    }

    // Get all analytics for this plot, ordered by date
    const { data: allAnalytics, error: analyticsError } = await supabase
      .from('land_analytics')
      .select('*')
      .eq('plot_id', plotId)
      .order('analysis_date', { ascending: true });

    if (analyticsError) throw analyticsError;

    if (!allAnalytics || allAnalytics.length < 2) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Insufficient data for progress tracking. Need at least 2 analyses.',
          dataPoints: allAnalytics?.length || 0,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Calculate progress metrics
    const baseline = allAnalytics[0];
    const latest = allAnalytics[allAnalytics.length - 1];
    const timeDiff = new Date(latest.analysis_date).getTime() - new Date(baseline.analysis_date).getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    const ndviDelta = latest.ndvi_value - baseline.ndvi_value;
    const eviDelta = latest.evi_value - baseline.evi_value;
    const soilDelta = latest.soil_quality_score - baseline.soil_quality_score;

    // Calculate improvement percentage (weighted average)
    const ndviImprovement = (ndviDelta / Math.abs(baseline.ndvi_value || 0.01)) * 100;
    const soilImprovement = (soilDelta / Math.abs(baseline.soil_quality_score || 0.01)) * 100;
    const overallImprovement = (ndviImprovement * 0.6 + soilImprovement * 0.4);

    // Create impact log
    const { data: impactLog, error: logError } = await supabase
      .from('impact_logs')
      .insert({
        plot_id: plotId,
        baseline_analytics_id: baseline.id,
        current_analytics_id: latest.id,
        time_period_days: daysDiff,
        ndvi_delta: ndviDelta,
        evi_delta: eviDelta,
        soil_quality_delta: soilDelta,
        improvement_percentage: Math.round(overallImprovement * 100) / 100,
        before_image_url: baseline.image_url,
        after_image_url: latest.image_url,
        notes: `Automated progress tracking: ${daysDiff} days of monitoring`,
      })
      .select()
      .single();

    if (logError) throw logError;

    // Prepare time series data
    const timeSeries = allAnalytics.map((a) => ({
      date: a.analysis_date,
      ndvi: a.ndvi_value,
      evi: a.evi_value,
      soilQuality: a.soil_quality_score,
      waterStress: a.water_stress_level,
    }));

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining';
    if (overallImprovement > 5) trend = 'improving';
    else if (overallImprovement < -5) trend = 'declining';
    else trend = 'stable';

    // Generate insights
    const insights = [];
    if (ndviDelta > 0.1) {
      insights.push('Significant vegetation improvement detected');
    } else if (ndviDelta < -0.1) {
      insights.push('Vegetation decline - immediate intervention needed');
    }

    if (soilDelta > 10) {
      insights.push('Soil health showing strong recovery');
    } else if (soilDelta < -10) {
      insights.push('Soil degradation accelerating');
    }

    if (latest.water_stress_level < baseline.water_stress_level) {
      insights.push('Water retention improving');
    }

    return new Response(
      JSON.stringify({
        success: true,
        impactLog,
        progress: {
          trend,
          overallImprovement: Math.round(overallImprovement * 100) / 100,
          ndviChange: Math.round(ndviDelta * 10000) / 10000,
          soilQualityChange: Math.round(soilDelta * 100) / 100,
          monitoringPeriodDays: daysDiff,
          dataPoints: allAnalytics.length,
        },
        timeSeries,
        insights,
        recommendations: trend === 'declining'
          ? ['Reassess current practices', 'Consider soil amendments', 'Increase monitoring frequency']
          : trend === 'improving'
          ? ['Continue current practices', 'Document successful interventions', 'Share learnings with community']
          : ['Monitor closely', 'Consider testing new regenerative practices', 'Maintain current care routine'],
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