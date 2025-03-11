import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

/**
 * Options for configuring the Supabase table subscription
 */
export interface SupabaseTableOptions<T> {
  /** Function to filter or modify the initial query */
  filter?: (
    query: PostgrestFilterBuilder<any, any, T[]>,
  ) => PostgrestFilterBuilder<any, any, any>;
  /** Comma-separated list of events to listen for (INSERT, UPDATE, DELETE) */
  eventTypes?: string;
  /** Schema name (defaults to 'public') */
  schema?: string;
  /**
   * Function to compare records to determine if they are the same
   * Used to identify records for updates/deletes
   * Defaults to comparing the 'id' property if not provided
   */
  compareRecords?: (a: T, b: T) => boolean;
  /**
   * Function to extract a unique key from a record for use in maps/sets
   * Needs to consistently generate the same string for the same logical record
   * Defaults to JSON.stringify(record.id) if not provided
   */
  getRecordKey?: (record: T) => string;
}

/**
 * Return type of the useSupabaseTable hook
 */
export interface SupabaseTableResult<T> {
  /** Reactive array of table rows */
  rows: T[];
  /** Function to manually refresh data */
  refresh: () => Promise<void>;
  /** Function to manually unsubscribe from realtime updates */
  unsubscribe: () => void;
}

/**
 * Creates a reactive Svelte $state object that stays in sync with a Supabase table via Realtime
 *
 * @param supabase Initialized Supabase client
 * @param tableName Name of the table to subscribe to
 * @param options Configuration options
 * @returns A reactive $state object containing table rows and utility functions
 */
export function useSupabaseTable<T extends { id: string | number }>(
  supabase: SupabaseClient,
  tableName: string,
  options: SupabaseTableOptions<T> = {},
): SupabaseTableResult<T> {
  // Create the $state object to hold the rows
  const rows = $state<T[]>([]);

  // Track the subscription for cleanup
  let subscription: RealtimeChannel | null = null;

  // Default compareRecords function using 'id' property
  const defaultCompareRecords = (a: T, b: T): boolean => {
    return a.id !== undefined && b.id !== undefined && a.id === b.id;
  };

  // Default getRecordKey function using 'id' property
  const defaultGetRecordKey = (record: T): string => {
    return record.id !== undefined ? `${record.id}` : JSON.stringify(record);
  };

  // Use provided functions or defaults
  const compareRecords = options.compareRecords || defaultCompareRecords;
  const getRecordKey = options.getRecordKey || defaultGetRecordKey;

  // Function to load initial data
  const loadInitialData = async (): Promise<void> => {
    try {
      let query = supabase
        .from(tableName)
        .select('*') as PostgrestFilterBuilder<any, any, T[]>;

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
      if (data) {
        rows.push(...data);
      }
    } catch (error) {
      console.error('Error in initial data fetch:', error);
    }
  };

  // Function to set up the realtime subscription
  const setupRealtimeSubscription = (): void => {
    const eventTypes = options.eventTypes || '*';
    const schema = options.schema || 'public';

    subscription = supabase
      .channel(`table-changes-${tableName}`)
      .on(
        'postgres_changes',
        {
          event: eventTypes,
          schema,
          table: tableName,
        },
        (payload) => {
          // Handle different event types
          if (payload.eventType === 'INSERT') {
            rows.push(payload.new as T);
          } else if (payload.eventType === 'UPDATE') {
            const index = rows.findIndex((row) =>
              compareRecords(row, payload.old as T),
            );
            if (index !== -1) {
              rows[index] = payload.new as T;
            }
          } else if (payload.eventType === 'DELETE') {
            const index = rows.findIndex((row) =>
              compareRecords(row, payload.old as T),
            );
            if (index !== -1) {
              rows.splice(index, 1);
            }
          }
        },
      )
      .subscribe();
  };

  // Function to clean up the subscription
  const unsubscribe = (): void => {
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
