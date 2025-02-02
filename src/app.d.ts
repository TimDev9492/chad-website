import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient;
      safeGetSession: () => Promise<{
        session: Session | null;
        user: User | null;
        userInfo:
          | (Database['public']['Tables']['user_infos']['Row'] & {
              residency_addresses:
                | Database['public']['Tables']['residency_addresses']['Row']
                | null;
              food_preferences:
                | Database['public']['Tables']['food_preferences']['Row']
                | null;
              roles: {
                role: Database['public']['Tables']['roles']['Row']['role'];
              } | null;
            })
          | null;
      }>;
      session: Session | null;
      user: User | null;
      userInfo:
        | (Database['public']['Tables']['user_infos']['Row'] & {
            residency_addresses:
              | Database['public']['Tables']['residency_addresses']['Row']
              | null;
            food_preferences:
              | Database['public']['Tables']['food_preferences']['Row']
              | null;
            roles: {
              role: Database['public']['Tables']['roles']['Row']['role'];
            } | null;
          })
        | null;
    }
    interface PageData {
      session: Session | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
