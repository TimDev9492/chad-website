export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accomodations: {
        Row: {
          created_at: string
          discount: number
          name: string
        }
        Insert: {
          created_at?: string
          discount?: number
          name: string
        }
        Update: {
          created_at?: string
          discount?: number
          name?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          country_code: string
          created_at: string
          currency_iso_code: string
          currency_symbol: string
          flag_emoji: string
          is_placeholder: boolean
          iso_code: string
          name: string
          price_base: number
        }
        Insert: {
          country_code: string
          created_at?: string
          currency_iso_code?: string
          currency_symbol?: string
          flag_emoji: string
          is_placeholder?: boolean
          iso_code: string
          name: string
          price_base?: number
        }
        Update: {
          country_code?: string
          created_at?: string
          currency_iso_code?: string
          currency_symbol?: string
          flag_emoji?: string
          is_placeholder?: boolean
          iso_code?: string
          name?: string
          price_base?: number
        }
        Relationships: []
      }
      food_preferences: {
        Row: {
          created_at: string
          description: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["user_id"]
          },
        ]
      }
      genders: {
        Row: {
          created_at: string
          name: string
        }
        Insert: {
          created_at?: string
          name: string
        }
        Update: {
          created_at?: string
          name?: string
        }
        Relationships: []
      }
      means_of_transport: {
        Row: {
          created_at: string
          name: string
        }
        Insert: {
          created_at?: string
          name: string
        }
        Update: {
          created_at?: string
          name?: string
        }
        Relationships: []
      }
      mock_public_infos: {
        Row: {
          avatar_url: string | null
          first_name: string | null
          last_name: string | null
          public_id: string
          ward_id: number | null
        }
        Insert: {
          avatar_url?: string | null
          first_name?: string | null
          last_name?: string | null
          public_id?: string
          ward_id?: number | null
        }
        Update: {
          avatar_url?: string | null
          first_name?: string | null
          last_name?: string | null
          public_id?: string
          ward_id?: number | null
        }
        Relationships: []
      }
      payment_infos: {
        Row: {
          created_at: string
          payment_reference: number
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          payment_reference?: number
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          payment_reference?: number
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_infos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_infos"
            referencedColumns: ["user_id"]
          },
        ]
      }
      public_infos: {
        Row: {
          avatar_url: string
          created_at: string
          first_name: string | null
          last_name: string | null
          public_id: string
          ward_id: number | null
        }
        Insert: {
          avatar_url?: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          public_id: string
          ward_id?: number | null
        }
        Update: {
          avatar_url?: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          public_id?: string
          ward_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "public_infos_public_id_fkey"
            columns: ["public_id"]
            isOneToOne: true
            referencedRelation: "user_infos"
            referencedColumns: ["public_id"]
          },
        ]
      }
      residency_addresses: {
        Row: {
          additional_info: string | null
          city: string | null
          country: string | null
          created_at: string
          postal_code: number | null
          street_name_and_number: string | null
          user_id: string
        }
        Insert: {
          additional_info?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          postal_code?: number | null
          street_name_and_number?: string | null
          user_id: string
        }
        Update: {
          additional_info?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          postal_code?: number | null
          street_name_and_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "residency_addresses_country_fkey"
            columns: ["country"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["iso_code"]
          },
          {
            foreignKeyName: "residency_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_infos"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ride_sharing: {
        Row: {
          contact_details: string
          created_at: string
          from: string | null
          from_seat_amount: number | null
          is_providing: boolean
          public_id: string
          to: string | null
          to_seat_amount: number | null
        }
        Insert: {
          contact_details: string
          created_at?: string
          from?: string | null
          from_seat_amount?: number | null
          is_providing?: boolean
          public_id: string
          to?: string | null
          to_seat_amount?: number | null
        }
        Update: {
          contact_details?: string
          created_at?: string
          from?: string | null
          from_seat_amount?: number | null
          is_providing?: boolean
          public_id?: string
          to?: string | null
          to_seat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_sharing_public_id_fkey"
            columns: ["public_id"]
            isOneToOne: true
            referencedRelation: "public_infos"
            referencedColumns: ["public_id"]
          },
          {
            foreignKeyName: "ride_sharing_public_id_fkey"
            columns: ["public_id"]
            isOneToOne: true
            referencedRelation: "public_participants"
            referencedColumns: ["public_id"]
          },
        ]
      }
      roles: {
        Row: {
          role: Database["public"]["Enums"]["role"]
          user_id: string
        }
        Insert: {
          role?: Database["public"]["Enums"]["role"]
          user_id: string
        }
        Update: {
          role?: Database["public"]["Enums"]["role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_infos"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_infos: {
        Row: {
          accomodation: string | null
          agrees_to_recordings: boolean
          breakfast_friday: boolean
          breakfast_thursday: boolean
          breakfast_tuesday: boolean
          breakfast_wednesday: boolean
          created_at: string
          date_of_birth: string | null
          email: string
          gender: string | null
          has_deutschland_ticket: boolean
          has_endowment: boolean
          is_temple_staff: boolean
          mode_of_transport: string | null
          other_remarks: string | null
          phone_number: string | null
          public_id: string
          room_mate_preferences: string | null
          user_id: string
          wants_to_attend_baptism: boolean
          wants_to_provide_temple_staff: boolean
          wants_to_visit_temple: boolean
        }
        Insert: {
          accomodation?: string | null
          agrees_to_recordings?: boolean
          breakfast_friday?: boolean
          breakfast_thursday?: boolean
          breakfast_tuesday?: boolean
          breakfast_wednesday?: boolean
          created_at?: string
          date_of_birth?: string | null
          email?: string
          gender?: string | null
          has_deutschland_ticket?: boolean
          has_endowment?: boolean
          is_temple_staff?: boolean
          mode_of_transport?: string | null
          other_remarks?: string | null
          phone_number?: string | null
          public_id?: string
          room_mate_preferences?: string | null
          user_id?: string
          wants_to_attend_baptism?: boolean
          wants_to_provide_temple_staff?: boolean
          wants_to_visit_temple?: boolean
        }
        Update: {
          accomodation?: string | null
          agrees_to_recordings?: boolean
          breakfast_friday?: boolean
          breakfast_thursday?: boolean
          breakfast_tuesday?: boolean
          breakfast_wednesday?: boolean
          created_at?: string
          date_of_birth?: string | null
          email?: string
          gender?: string | null
          has_deutschland_ticket?: boolean
          has_endowment?: boolean
          is_temple_staff?: boolean
          mode_of_transport?: string | null
          other_remarks?: string | null
          phone_number?: string | null
          public_id?: string
          room_mate_preferences?: string | null
          user_id?: string
          wants_to_attend_baptism?: boolean
          wants_to_provide_temple_staff?: boolean
          wants_to_visit_temple?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_infos_accomodation_fkey"
            columns: ["accomodation"]
            isOneToOne: false
            referencedRelation: "accomodations"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "user_infos_gender_fkey"
            columns: ["gender"]
            isOneToOne: false
            referencedRelation: "genders"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "user_infos_mode_of_transport_fkey"
            columns: ["mode_of_transport"]
            isOneToOne: false
            referencedRelation: "means_of_transport"
            referencedColumns: ["name"]
          },
        ]
      }
      workshop_participants: {
        Row: {
          public_id: string
          workshop_id: string
        }
        Insert: {
          public_id: string
          workshop_id: string
        }
        Update: {
          public_id?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_participants_public_id_fkey"
            columns: ["public_id"]
            isOneToOne: false
            referencedRelation: "public_infos"
            referencedColumns: ["public_id"]
          },
          {
            foreignKeyName: "workshop_participants_public_id_fkey"
            columns: ["public_id"]
            isOneToOne: false
            referencedRelation: "public_participants"
            referencedColumns: ["public_id"]
          },
          {
            foreignKeyName: "workshop_participants_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          capacity: number
          created_at: string
          description: string
          event_duration: number
          event_start: string
          id: string
          metadata: Json
          thumbnail_url: string
          title: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          description: string
          event_duration?: number
          event_start: string
          id?: string
          metadata?: Json
          thumbnail_url?: string
          title: string
        }
        Update: {
          capacity?: number
          created_at?: string
          description?: string
          event_duration?: number
          event_start?: string
          id?: string
          metadata?: Json
          thumbnail_url?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      participants: {
        Row: {
          accomodation: string | null
          agrees_to_recordings: boolean | null
          breakfast_friday: boolean | null
          breakfast_thursday: boolean | null
          breakfast_tuesday: boolean | null
          breakfast_wednesday: boolean | null
          city: string | null
          country_of_residency: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          food_preferences: string | null
          gender: string | null
          has_deutschland_ticket: boolean | null
          has_endowment: boolean | null
          is_temple_staff: boolean | null
          last_name: string | null
          mode_of_transport: string | null
          other_remarks: string | null
          payment_reference: number | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          phone_number: string | null
          postal_code: number | null
          room_mate_preferences: string | null
          stake_name: string | null
          street_name_and_number: string | null
          wants_to_attend_baptism: boolean | null
          wants_to_provide_temple_staff: boolean | null
          wants_to_visit_temple: boolean | null
          ward_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_infos_accomodation_fkey"
            columns: ["accomodation"]
            isOneToOne: false
            referencedRelation: "accomodations"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "user_infos_gender_fkey"
            columns: ["gender"]
            isOneToOne: false
            referencedRelation: "genders"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "user_infos_mode_of_transport_fkey"
            columns: ["mode_of_transport"]
            isOneToOne: false
            referencedRelation: "means_of_transport"
            referencedColumns: ["name"]
          },
        ]
      }
      public_participants: {
        Row: {
          avatar_url: string | null
          first_name: string | null
          last_name: string | null
          public_id: string | null
          stake_name: string | null
          ward_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_infos_public_id_fkey"
            columns: ["public_id"]
            isOneToOne: true
            referencedRelation: "user_infos"
            referencedColumns: ["public_id"]
          },
        ]
      }
    }
    Functions: {
      generate_hmac: {
        Args: { secret_key: string; message: string }
        Returns: string
      }
      generate_payment_reference: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_conflicting_workshops: {
        Args: { user_public_id: string; new_workshop_id: string }
        Returns: {
          capacity: number
          created_at: string
          description: string
          event_duration: number
          event_start: string
          id: string
          metadata: Json
          thumbnail_url: string
          title: string
        }[]
      }
      get_payment_status_count: {
        Args: {
          requested_status: Database["public"]["Enums"]["payment_status"]
        }
        Returns: number
      }
      get_registered_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          public_id: string
          first_name: string
          last_name: string
          ward_name: string
          stake_name: string
          avatar_url: string
        }[]
      }
      get_user_price: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      notify_payment_approval: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          payment_reference: number
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }[]
      }
    }
    Enums: {
      payment_status: "UNPAID" | "PENDING_APPROVAL" | "CONFIRMED"
      role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_status: ["UNPAID", "PENDING_APPROVAL", "CONFIRMED"],
      role: ["user", "admin"],
    },
  },
} as const
