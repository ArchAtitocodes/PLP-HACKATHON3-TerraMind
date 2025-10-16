import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ChatRequest {
  message: string;
  plotId?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

async function callGemini(
  message: string,
  context: string,
  history: Array<{ role: string; content: string }> = []
): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!apiKey) {
    return "I'm here to help with regenerative agriculture! However, the Gemini API key needs to be configured. For now, I can provide general guidance based on the data I have access to. What would you like to know about your land?";
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

    // Build conversation with context
    const systemPrompt = `You are TerraMind, an expert AI assistant specializing in regenerative agriculture, land restoration, and sustainable farming practices. Your role is to help farmers and land managers improve their land health using data-driven insights.

Current Context:
${context}

Provide practical, actionable advice. Be concise but thorough. Focus on regenerative practices, soil health, biodiversity, and sustainable agriculture.`;

    const messages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'I understand. I am TerraMind, ready to assist with regenerative agriculture guidance based on the land data provided.' }] },
      ...history.slice(-6).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Unexpected response format from Gemini');
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return `I encountered an issue connecting to the AI service. Here's what I can tell you based on your data: ${context.substring(0, 200)}... Please try asking your question again.`;
  }
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

    const { message, plotId, conversationHistory }: ChatRequest = await req.json();

    if (!message) {
      throw new Error('message is required');
    }

    // Build context from plot data if provided
    let context = 'General regenerative agriculture context.';
    
    if (plotId) {
      // Fetch plot details
      const { data: plot, error: plotError } = await supabase
        .from('land_plots')
        .select('*')
        .eq('id', plotId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!plotError && plot) {
        // Fetch latest analytics
        const { data: analytics, error: analyticsError } = await supabase
          .from('land_analytics')
          .select('*')
          .eq('plot_id', plotId)
          .order('analysis_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Fetch recent recommendations
        const { data: recommendations, error: recsError } = await supabase
          .from('recommendations')
          .select('*')
          .eq('plot_id', plotId)
          .order('created_at', { ascending: false })
          .limit(3);

        context = `Land Plot: ${plot.name}
Location: ${plot.latitude}, ${plot.longitude}
Area: ${plot.area_hectares} hectares
`;

        if (!analyticsError && analytics) {
          context += `\nLatest Analysis:
- NDVI: ${analytics.ndvi_value} (vegetation index)
- Soil Quality: ${analytics.soil_quality_score}/100
- Water Stress: ${analytics.water_stress_level}/100
- Degradation Risk: ${analytics.degradation_risk}
`;
        }

        if (!recsError && recommendations && recommendations.length > 0) {
          context += `\nRecent Recommendations:
`;
          recommendations.forEach((rec, i) => {
            context += `${i + 1}. ${rec.item_name} (${rec.recommendation_type}) - ${rec.reason}\n`;
          });
        }
      }
    } else {
      // Get user's plots summary
      const { data: plots, error: plotsError } = await supabase
        .from('land_plots')
        .select('id, name, area_hectares')
        .eq('user_id', user.id)
        .limit(5);

      if (!plotsError && plots && plots.length > 0) {
        context = `User's Land Plots:\n`;
        plots.forEach((plot, i) => {
          context += `${i + 1}. ${plot.name} (${plot.area_hectares} hectares)\n`;
        });
        context += `\nAsk me about any specific plot or general regenerative agriculture practices!`;
      }
    }

    // Call Gemini with context
    const aiResponse = await callGemini(message, context, conversationHistory || []);

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        context: plotId ? `Plot-specific advice for ${plotId}` : 'General advice',
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