import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isMockMode = !supabaseUrl || !supabaseAnonKey;

if (isMockMode) {
  console.warn(
    '⚠️ Bootcamp Portal: Supabase keys are missing. Running in MOCK MODE. Submissions will be logged and saved to local storage.'
  );
}

// Real Supabase client instance (will be configured if keys exist)
export const supabase = !isMockMode ? createClient(supabaseUrl, supabaseAnonKey) : null;

export interface RegistrationData {
  project_name: string;
  first_name: string;
  surname: string;
  phone_number: string;
  interest_reason: string;
}

/**
 * Saves a registration to the database (or localStorage if in mock mode)
 */
export async function submitRegistration(data: RegistrationData): Promise<{ success: boolean; error?: string }> {
  if (isMockMode) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    try {
      // Retrieve existing mock registrations
      const existing = localStorage.getItem('bootcamp_mock_registrations');
      const registrations = existing ? JSON.parse(existing) : [];
      
      const newRecord = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...data,
      };
      
      registrations.push(newRecord);
      localStorage.setItem('bootcamp_mock_registrations', JSON.stringify(registrations));
      console.log('✅ Bootcamp Portal: Mock submission saved successfully:', newRecord);
      return { success: true };
    } catch (e) {
      console.error('❌ Bootcamp Portal: Error saving mock submission:', e);
      return { success: false, error: 'Failed to write mock submission' };
    }
  } else {
    try {
      const { error } = await supabase!
        .from('bootcamp_registrations')
        .insert([data]);
        
      if (error) {
        console.error('❌ Bootcamp Portal: Supabase insertion error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Bootcamp Portal: Submission successfully saved to Supabase!');
      return { success: true };
    } catch (e: any) {
      console.error('❌ Bootcamp Portal: Unexpected submission error:', e);
      return { success: false, error: e.message || 'An unexpected error occurred' };
    }
  }
}

/**
 * Helper to fetch mock registrations for debugging/review in development
 */
export function getMockRegistrations(): any[] {
  if (typeof window === 'undefined') return [];
  const existing = localStorage.getItem('bootcamp_mock_registrations');
  return existing ? JSON.parse(existing) : [];
}
