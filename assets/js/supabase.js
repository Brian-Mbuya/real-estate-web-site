/* ============================================================
   Reality Kisumu Hub — Supabase client
   ------------------------------------------------------------
   Wrapped in an IIFE so SUPABASE_URL / SUPABASE_ANON_KEY do not
   sit in the global scope where a page script could redeclare
   them and throw a parse-time SyntaxError.

   The key below is the *publishable* (anon) key. It is safe in
   client code only because Row Level Security is enabled on
   every table — see supabase-schema.sql.
   ============================================================ */
(function (window) {
    'use strict';

    var SUPABASE_URL = window.SUPABASE_URL || 'https://stuhxibojfgxuqtiiuus.supabase.co';
    var SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'sb_publishable_g7tv_Ip8rBa8-UOddOjreg_jhdn9E6e';

    var client = null;
    var channels = {};

    if (window.supabase && typeof window.supabase.createClient === 'function' && SUPABASE_URL.indexOf('.supabase.co') > -1) {
        try {
            client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: { persistSession: false },
                realtime: { params: { eventsPerSecond: 2 } }
            });
        } catch (err) {
            console.warn('Supabase init failed:', err.message);
        }
    } else {
        console.warn('Supabase SDK unavailable — the app will show an offline state.');
    }

    /* Subscribing twice to the same table used to create a second
       duplicate channel, so every change fired the callback twice
       and the list re-fetched twice. Channels are now reused. */
    function subscribeToTableChanges(tableName, onChange) {
        if (!client) return null;
        if (channels[tableName]) return channels[tableName];

        var channel = client
            .channel('public:' + tableName)
            .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, function (payload) {
                if (typeof onChange === 'function') onChange(payload);
            })
            .subscribe();

        channels[tableName] = channel;
        return channel;
    }

    function unsubscribeAll() {
        Object.keys(channels).forEach(function (name) {
            try { client.removeChannel(channels[name]); } catch (e) {}
            delete channels[name];
        });
    }

    window.addEventListener('beforeunload', unsubscribeAll);

    window.SupabaseHub = {
        client: client,
        subscribeToTableChanges: subscribeToTableChanges,
        unsubscribeAll: unsubscribeAll,
        isConnected: function () { return client !== null; }
    };
})(window);
