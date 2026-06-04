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

const projectTableMap: Record<string, string> = {
  "Yoshlar Tadbirkorligini rivojlantirish jamg'armasi": "reg_ytrj",
  "Yoshlar biznes maktabi": "reg_ybm",
  "Ko'mak": "reg_komak",
  "Yangi avlod tadbirkorlari": "reg_yangi_avlod_tadbirkorlari",
  "Yosh tadbirkorlar chempionati": "reg_yosh_tadbirkorlar_chempionati",
  "Qizlar biznes akademiyasi": "reg_qizlar_biznes_akademiyasi",
};

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
      // 1. Insert into unified table
      const { error: unifiedError } = await supabase!
        .from('bootcamp_registrations')
        .insert([data]);
        
      if (unifiedError) {
        console.error('❌ Bootcamp Portal: Unified insertion error:', unifiedError);
        return { success: false, error: `Unified table error: ${unifiedError.message}` };
      }
      
      // 2. Insert into project-specific table
      const specificTableName = projectTableMap[data.project_name];
      if (specificTableName) {
        const { error: specificError } = await supabase!
          .from(specificTableName)
          .insert([{
            first_name: data.first_name,
            surname: data.surname,
            phone_number: data.phone_number,
            interest_reason: data.interest_reason,
          }]);
          
        if (specificError) {
          console.error(`❌ Bootcamp Portal: Specific table (${specificTableName}) insertion error:`, specificError);
          return { 
            success: false, 
            error: `Saved to unified table, but failed to save to specific table ${specificTableName}: ${specificError.message}` 
          };
        }
      }
      
      console.log('✅ Bootcamp Portal: Submission successfully saved to both tables in Supabase!');
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

export interface BuxoroNavoiyRegistrationData {
  first_name: string;
  surname: string;
  phone_number: string;
  location: string; // 'Buxoro' or 'Navoiy'
  age: number;
  telegram_username?: string;
  is_entrepreneur: boolean;
  business_activity?: string;
  employee_count?: string;
  has_business_idea?: boolean;
  business_interest?: string;
  expectations?: string;
}

/**
 * Saves a Buxoro-Navoiy bootcamp registration to the database (or localStorage if in mock mode)
 */
export async function submitBuxoroNavoiyRegistration(
  data: BuxoroNavoiyRegistrationData
): Promise<{ success: boolean; error?: string }> {
  if (isMockMode) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    try {
      const existing = localStorage.getItem('bootcamp_buxoro_navoiy_registrations');
      const registrations = existing ? JSON.parse(existing) : [];
      
      const newRecord = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...data,
      };
      
      registrations.push(newRecord);
      localStorage.setItem('bootcamp_buxoro_navoiy_registrations', JSON.stringify(registrations));
      console.log('✅ Bootcamp Portal: Mock Buxoro-Navoiy submission saved successfully:', newRecord);
      return { success: true };
    } catch (e) {
      console.error('❌ Bootcamp Portal: Error saving mock Buxoro-Navoiy submission:', e);
      return { success: false, error: 'Failed to write mock submission' };
    }
  } else {
    try {
      const { error } = await supabase!
        .from('buxoro_navoiy_registrations')
        .insert([data]);
        
      if (error) {
        console.error('❌ Bootcamp Portal: Buxoro-Navoiy insertion error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Bootcamp Portal: Buxoro-Navoiy submission successfully saved to Supabase!');
      return { success: true };
    } catch (e: any) {
      console.error('❌ Bootcamp Portal: Unexpected Buxoro-Navoiy submission error:', e);
      return { success: false, error: e.message || 'An unexpected error occurred' };
    }
  }
}

/**
 * Helper to fetch mock Buxoro-Navoiy registrations for debugging/review in development
 */
export function getMockBuxoroNavoiyRegistrations(): any[] {
  if (typeof window === 'undefined') return [];
  const existing = localStorage.getItem('bootcamp_buxoro_navoiy_registrations');
  return existing ? JSON.parse(existing) : [];
}

