/**
 * Creates a reactive Svelte $state object that stays in sync with a Supabase table via Realtime
 *
 * @param {SupabaseClient} supabase - Initialized Supabase client
 * @param {string} tableName - Name of the table to subscribe to
 * @param {Object} options - Configuration options
 * @param {function} options.filter - Optional filter function for the initial query
 * @param {string} options.eventTypes - Comma-separated list of events to listen for (default: "*")
 * @returns {Object} A reactive $state object containing table rows
 */
export function useSupabaseTable(supabase, tableName, options = {}) {
  // Create the $state object to hold the rows
  const rows = $state([]);

  // Track the subscription to clean up later
  let subscription = null;

  // Function to load initial data
  const loadInitialData = async () => {
    try {
      let query = supabase.from(tableName).select('*');

      // Apply filter if provided
      if (options.filter && typeof options.filter === 'function') {
        query = options.filter(query);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching initial data:', error);
        return;
      }

      // Update the $state object with initial data
      rows.length = 0;
      rows.push(...data);
    } catch (error) {
      console.error('Error in initial data fetch:', error);
    }
  };

  // Function to set up the realtime subscription
  const setupRealtimeSubscription = () => {
    const eventTypes = options.eventTypes || '*';

    subscription = supabase
      .channel(`table-changes-${tableName}`)
      .on(
        'postgres_changes',
        {
          event: eventTypes,
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          // Handle different event types
          if (payload.eventType === 'INSERT') {
            rows.push(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            const index = rows.findIndex((row) => row.id === payload.new.id);
            if (index !== -1) {
              rows[index] = payload.new;
            }
          } else if (payload.eventType === 'DELETE') {
            const index = rows.findIndex((row) => row.id === payload.old.id);
            if (index !== -1) {
              rows.splice(index, 1);
            }
          }
        },
      )
      .subscribe();
  };

  // Function to clean up the subscription
  const unsubscribe = () => {
    if (subscription) {
      supabase.removeChannel(subscription);
      subscription = null;
    }
  };

  // Initialize data and subscription
  loadInitialData().then(setupRealtimeSubscription);

  // Create lifecycle hooks for cleanup
  if (typeof window !== 'undefined') {
    // For SvelteKit, attach to onDestroy if available
    try {
      const { onDestroy } = require('svelte');
      if (onDestroy) {
        onDestroy(unsubscribe);
      }
    } catch (e) {
      // onDestroy not available, fallback to window event
      window.addEventListener('beforeunload', unsubscribe);
    }
  }

  return {
    rows,
    refresh: loadInitialData,
    unsubscribe,
  };
}
