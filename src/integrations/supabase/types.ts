export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      dream_buys: {
        Row: {
          created_at: string | null
          id: string
          item_name: string
          match_price: number | null
          match_url: string | null
          status: string | null
          target_price: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_name: string
          match_price?: number | null
          match_url?: string | null
          status?: string | null
          target_price?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_name?: string
          match_price?: number | null
          match_url?: string | null
          status?: string | null
          target_price?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_buys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      giving_settings: {
        Row: {
          active_cause: string | null
          id: string
          roundup_enabled: boolean | null
          roundup_pct: number | null
          total_given: number | null
          updated_at: string | null
        }
        Insert: {
          active_cause?: string | null
          id: string
          roundup_enabled?: boolean | null
          roundup_pct?: number | null
          total_given?: number | null
          updated_at?: string | null
        }
        Update: {
          active_cause?: string | null
          id?: string
          roundup_enabled?: boolean | null
          roundup_pct?: number | null
          total_given?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "giving_settings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_log: {
        Row: {
          action_label: string | null
          body: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_emoji: string | null
          brand_affinities: string[] | null
          buy_speed: string | null
          created_at: string | null
          display_name: string | null
          id: string
          onboarding_complete: boolean | null
          spending_style: string | null
          taste_tags: string[] | null
          travel_vibes: string[] | null
        }
        Insert: {
          avatar_emoji?: string | null
          brand_affinities?: string[] | null
          buy_speed?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          onboarding_complete?: boolean | null
          spending_style?: string | null
          taste_tags?: string[] | null
          travel_vibes?: string[] | null
        }
        Update: {
          avatar_emoji?: string | null
          brand_affinities?: string[] | null
          buy_speed?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          onboarding_complete?: boolean | null
          spending_style?: string | null
          taste_tags?: string[] | null
          travel_vibes?: string[] | null
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          image_emoji: string | null
          item_name: string
          price: number | null
          retailer: string | null
          tag: string | null
          user_id: string
          was_price: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          image_emoji?: string | null
          item_name: string
          price?: number | null
          retailer?: string | null
          tag?: string | null
          user_id: string
          was_price?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          image_emoji?: string | null
          item_name?: string
          price?: number | null
          retailer?: string | null
          tag?: string | null
          user_id?: string
          was_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_memberships: {
        Row: {
          id: string
          joined_at: string | null
          tribe_emoji: string | null
          tribe_name: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          tribe_emoji?: string | null
          tribe_name: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          tribe_emoji?: string | null
          tribe_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribe_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
