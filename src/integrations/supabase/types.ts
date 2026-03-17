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
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      auctions: {
        Row: {
          auto_extend: boolean | null
          bid_count: number
          bid_increment: number
          created_at: string | null
          current_price: number
          ends_at: string
          highest_bidder_id: string | null
          id: string
          listing_id: string
          reserve_price: number | null
          starts_at: string
          status: string
          watchers: number
        }
        Insert: {
          auto_extend?: boolean | null
          bid_count?: number
          bid_increment?: number
          created_at?: string | null
          current_price?: number
          ends_at: string
          highest_bidder_id?: string | null
          id?: string
          listing_id: string
          reserve_price?: number | null
          starts_at?: string
          status?: string
          watchers?: number
        }
        Update: {
          auto_extend?: boolean | null
          bid_count?: number
          bid_increment?: number
          created_at?: string | null
          current_price?: number
          ends_at?: string
          highest_bidder_id?: string | null
          id?: string
          listing_id?: string
          reserve_price?: number | null
          starts_at?: string
          status?: string
          watchers?: number
        }
        Relationships: [
          {
            foreignKeyName: "auctions_highest_bidder_id_fkey"
            columns: ["highest_bidder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auctions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          auction_id: string
          bid_type: string
          bidder_id: string
          created_at: string | null
          id: string
          max_proxy_amount: number | null
        }
        Insert: {
          amount: number
          auction_id: string
          bid_type?: string
          bidder_id: string
          created_at?: string | null
          id?: string
          max_proxy_amount?: number | null
        }
        Update: {
          amount?: number
          auction_id?: string
          bid_type?: string
          bidder_id?: string
          created_at?: string | null
          id?: string
          max_proxy_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      break_slots: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          id: string
          listing_id: string
          price: number
          slot_emoji: string | null
          slot_label: string
          taken: boolean
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          listing_id: string
          price?: number
          slot_emoji?: string | null
          slot_label: string
          taken?: boolean
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string
          price?: number
          slot_emoji?: string | null
          slot_label?: string
          taken?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "break_slots_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_slots_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          message_type: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          message_type?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          message_type?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crews: {
        Row: {
          category: string
          created_at: string
          description: string | null
          emoji: string
          id: string
          is_active: boolean
          member_count: number
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          emoji?: string
          id?: string
          is_active?: boolean
          member_count?: number
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          emoji?: string
          id?: string
          is_active?: boolean
          member_count?: number
          name?: string
        }
        Relationships: []
      }
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
      group_deal_participants: {
        Row: {
          deal_id: string
          id: string
          joined_at: string | null
          price_paid: number | null
          tier_name: string | null
          user_id: string
        }
        Insert: {
          deal_id: string
          id?: string
          joined_at?: string | null
          price_paid?: number | null
          tier_name?: string | null
          user_id: string
        }
        Update: {
          deal_id?: string
          id?: string
          joined_at?: string | null
          price_paid?: number | null
          tier_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_deal_participants_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "group_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_deal_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_deals: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          current_participants: number
          deal_price: number
          description: string | null
          discount_pct: number
          emoji: string | null
          ends_at: string
          giveaway_enabled: boolean | null
          giveaway_prize: string | null
          giveaway_winner_id: string | null
          id: string
          price_tiers: Json | null
          retail_price: number
          reward_tier: string | null
          source_status: string | null
          status: string
          target_participants: number
          title: string
          total_savings: number | null
          tribe_name: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number
          deal_price: number
          description?: string | null
          discount_pct?: number
          emoji?: string | null
          ends_at: string
          giveaway_enabled?: boolean | null
          giveaway_prize?: string | null
          giveaway_winner_id?: string | null
          id?: string
          price_tiers?: Json | null
          retail_price: number
          reward_tier?: string | null
          source_status?: string | null
          status?: string
          target_participants?: number
          title: string
          total_savings?: number | null
          tribe_name?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number
          deal_price?: number
          description?: string | null
          discount_pct?: number
          emoji?: string | null
          ends_at?: string
          giveaway_enabled?: boolean | null
          giveaway_prize?: string | null
          giveaway_winner_id?: string | null
          id?: string
          price_tiers?: Json | null
          retail_price?: number
          reward_tier?: string | null
          source_status?: string | null
          status?: string
          target_participants?: number
          title?: string
          total_savings?: number | null
          tribe_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_deals_giveaway_winner_id_fkey"
            columns: ["giveaway_winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          buy_now_price: number | null
          category: string
          condition: string | null
          created_at: string | null
          description: string | null
          ends_at: string | null
          id: string
          images: string[] | null
          listing_type: string
          metadata: Json | null
          quantity: number
          search_vector: unknown
          seller_id: string
          starting_price: number
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          buy_now_price?: number | null
          category?: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          images?: string[] | null
          listing_type?: string
          metadata?: Json | null
          quantity?: number
          search_vector?: unknown
          seller_id: string
          starting_price: number
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          buy_now_price?: number | null
          category?: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          images?: string[] | null
          listing_type?: string
          metadata?: Json | null
          quantity?: number
          search_vector?: unknown
          seller_id?: string
          starting_price?: number
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
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
      orders: {
        Row: {
          amount: number
          auction_id: string | null
          buyer_id: string
          created_at: string | null
          id: string
          listing_id: string
          platform_fee: number
          seller_id: string
          shipping_address: Json | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          auction_id?: string | null
          buyer_id: string
          created_at?: string | null
          id?: string
          listing_id: string
          platform_fee?: number
          seller_id: string
          shipping_address?: Json | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          auction_id?: string | null
          buyer_id?: string
          created_at?: string | null
          id?: string
          listing_id?: string
          platform_fee?: number
          seller_id?: string
          shipping_address?: Json | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
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
          last_active_date: string | null
          onboarding_complete: boolean | null
          spending_style: string | null
          streak_days: number
          taste_tags: string[] | null
          total_xp: number
          travel_vibes: string[] | null
        }
        Insert: {
          avatar_emoji?: string | null
          brand_affinities?: string[] | null
          buy_speed?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          last_active_date?: string | null
          onboarding_complete?: boolean | null
          spending_style?: string | null
          streak_days?: number
          taste_tags?: string[] | null
          total_xp?: number
          travel_vibes?: string[] | null
        }
        Update: {
          avatar_emoji?: string | null
          brand_affinities?: string[] | null
          buy_speed?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_active_date?: string | null
          onboarding_complete?: boolean | null
          spending_style?: string | null
          streak_days?: number
          taste_tags?: string[] | null
          total_xp?: number
          travel_vibes?: string[] | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          order_id: string
          rating: number
          reviewer_id: string
          seller_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          rating: number
          reviewer_id: string
          seller_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          rating?: number
          reviewer_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      seller_profiles: {
        Row: {
          created_at: string | null
          id: string
          rating: number | null
          review_count: number | null
          shop_avatar: string | null
          shop_description: string | null
          shop_name: string | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          total_revenue: number | null
          total_sales: number | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          id: string
          rating?: number | null
          review_count?: number | null
          shop_avatar?: string | null
          shop_description?: string | null
          shop_name?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          total_revenue?: number | null
          total_sales?: number | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: number | null
          review_count?: number | null
          shop_avatar?: string | null
          shop_description?: string | null
          shop_name?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          total_revenue?: number | null
          total_sales?: number | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
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
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_seller_sales: {
        Args: { p_amount: number; p_seller_id: string }
        Returns: undefined
      }
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
