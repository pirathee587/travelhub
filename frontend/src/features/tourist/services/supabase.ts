import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY?.trim();

const isValidSupabaseUrl = (value: string | undefined) => {
	if (!value) return false;
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:';
	} catch {
		return false;
	}
};

let supabase;
if (isValidSupabaseUrl(supabaseUrl) && supabaseKey && supabaseKey !== 'undefined' && supabaseKey !== 'null') {
	supabase = createClient(supabaseUrl, supabaseKey);
} else {
	console.warn('Supabase is disabled because VITE_SUPABASE_URL or VITE_SUPABASE_KEY is missing or invalid.');
	// Provide a minimal stub so the app keeps working while env vars are being configured.
	supabase = {
		from: () => ({
			select: () => ({
				eq: () => ({
					order: async () => ({ data: [], error: null })
				})
			})
		})
	};
}

export { supabase };
