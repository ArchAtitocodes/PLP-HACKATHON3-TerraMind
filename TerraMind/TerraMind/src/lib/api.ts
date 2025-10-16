import { supabase } from './supabase';

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export async function analyzeLand(plotId: string, imageUrl?: string, useCoordinates: boolean = true) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/analyze-land`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ plotId, imageUrl, useCoordinates }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze land');
  }

  return response.json();
}

export async function recommendCrop(plotId: string, analyticsId?: string) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/recommend-crop`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ plotId, analyticsId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get recommendations');
  }

  return response.json();
}

export async function trackProgress(plotId: string) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/track-progress`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ plotId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to track progress');
  }

  return response.json();
}

export async function chatWithAssistant(
  message: string,
  plotId?: string,
  conversationHistory?: Array<{ role: string; content: string }>
) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/chat-regen`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, plotId, conversationHistory }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to chat with assistant');
  }

  return response.json();
}
