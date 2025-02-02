export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      countries: {
        Row: {
          country_code: string;
          created_at: string;
          flag_emoji: string;
          iso_code: string;
          name: string;
        };
        Insert: {
          country_code: string;
          created_at?: string;
          flag_emoji: string;
          iso_code: string;
          name: string;
        };
        Update: {
          country_code?: string;
          created_at?: string;
          flag_emoji?: string;
          iso_code?: string;
          name?: string;
        };
        Relationships: [];
      };
      food_preferences: {
        Row: {
          created_at: string;
          description: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'food_preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['user_id'];
          },
        ];
      };
      genders: {
        Row: {
          created_at: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          name?: string;
        };
        Relationships: [];
      };
      residency_addresses: {
        Row: {
          additional_info: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          postal_code: number | null;
          street_name_and_number: string | null;
          user_id: string;
        };
        Insert: {
          additional_info?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          postal_code?: number | null;
          street_name_and_number?: string | null;
          user_id: string;
        };
        Update: {
          additional_info?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          postal_code?: number | null;
          street_name_and_number?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'residency_addresses_country_fkey';
            columns: ['country'];
            isOneToOne: false;
            referencedRelation: 'countries';
            referencedColumns: ['iso_code'];
          },
          {
            foreignKeyName: 'residency_addresses_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'user_infos';
            referencedColumns: ['user_id'];
          },
        ];
      };
      roles: {
        Row: {
          role: Database['public']['Enums']['role'];
          user_id: string;
        };
        Insert: {
          role?: Database['public']['Enums']['role'];
          user_id: string;
        };
        Update: {
          role?: Database['public']['Enums']['role'];
          user_id?: string;
        };
        Relationships: [];
      };
      user_infos: {
        Row: {
          avatar_url: string;
          created_at: string;
          date_of_birth: string | null;
          first_name: string | null;
          gender: string | null;
          last_name: string | null;
          needs_place_to_sleep: boolean;
          phone_number: string | null;
          user_id: string;
          wants_breakfast: boolean;
          ward_id: number | null;
        };
        Insert: {
          avatar_url?: string;
          created_at?: string;
          date_of_birth?: string | null;
          first_name?: string | null;
          gender?: string | null;
          last_name?: string | null;
          needs_place_to_sleep?: boolean;
          phone_number?: string | null;
          user_id?: string;
          wants_breakfast?: boolean;
          ward_id?: number | null;
        };
        Update: {
          avatar_url?: string;
          created_at?: string;
          date_of_birth?: string | null;
          first_name?: string | null;
          gender?: string | null;
          last_name?: string | null;
          needs_place_to_sleep?: boolean;
          phone_number?: string | null;
          user_id?: string;
          wants_breakfast?: boolean;
          ward_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_infos_gender_fkey';
            columns: ['gender'];
            isOneToOne: false;
            referencedRelation: 'genders';
            referencedColumns: ['name'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      role: 'user' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
