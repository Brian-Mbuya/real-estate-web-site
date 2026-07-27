// Supabase Client & Realtime Subscription Engine
// Configured for Reality Kisumu Hub

const SUPABASE_URL = window.SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

let supabaseClient = null;

// Initialize Supabase if SDK is loaded and credentials are set
if (window.supabase && typeof window.supabase.createClient === 'function' && SUPABASE_URL.includes('.supabase.co')) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('⚡ Supabase client initialized successfully');
    } catch (e) {
        console.warn('Supabase init notice:', e.message);
    }
}

// Realtime Listener helper for auto-updating tables live
function subscribeToTableChanges(tableName, onUpdateCallback) {
    if (!supabaseClient) return null;
    
    const channel = supabaseClient
        .channel(`public:${tableName}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
            console.log(`⚡ Live Realtime Change on ${tableName}:`, payload);
            if (typeof onUpdateCallback === 'function') {
                onUpdateCallback(payload);
            }
        })
        .subscribe();
        
    return channel;
}

window.SupabaseHub = {
    client: supabaseClient,
    subscribeToTableChanges,
    supportPhone: '+254746632821'
};
