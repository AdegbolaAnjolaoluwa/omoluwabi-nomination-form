export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_super_admin: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_super_admin?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_super_admin?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      candidates: {
        Row: {
          canonical_name: string
          created_at: string
          id: string
          position: string
          updated_at: string
          vote_count: number | null
        }
        Insert: {
          canonical_name: string
          created_at?: string
          id?: string
          position: string
          updated_at?: string
          vote_count?: number | null
        }
        Update: {
          canonical_name?: string
          created_at?: string
          id?: string
          position?: string
          updated_at?: string
          vote_count?: number | null
        }
        Relationships: []
      }
      eligible_voters_2025: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          member_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          member_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          member_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      name_variations: {
        Row: {
          candidate_id: string | null
          created_at: string
          id: string
          variation_name: string
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string
          id?: string
          variation_name: string
        }
        Update: {
          candidate_id?: string | null
          created_at?: string
          id?: string
          variation_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "name_variations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      nominations: {
        Row: {
          created_at: string
          id: string
          nominator_name: string
          nominee_name: string
          position: string
          statement_of_purpose: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nominator_name: string
          nominee_name: string
          position: string
          statement_of_purpose: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nominator_name?: string
          nominee_name?: string
          position?: string
          statement_of_purpose?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      nominations_2025: {
        Row: {
          hon_legal_adviser: string
          hon_social_secretary: string
          id: string
          president: string
          secretary: string
          submitted_at: string
          tournament_director: string
          voter_name: string
        }
        Insert: {
          hon_legal_adviser: string
          hon_social_secretary: string
          id?: string
          president: string
          secretary: string
          submitted_at?: string
          tournament_director: string
          voter_name: string
        }
        Update: {
          hon_legal_adviser?: string
          hon_social_secretary?: string
          id?: string
          president?: string
          secretary?: string
          submitted_at?: string
          tournament_director?: string
          voter_name?: string
        }
        Relationships: []
      }
      voter_submissions_2025: {
        Row: {
          id: string
          submitted_at: string
          voter_name: string
        }
        Insert: {
          id?: string
          submitted_at?: string
          voter_name: string
        }
        Update: {
          id?: string
          submitted_at?: string
          voter_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_similar_names: {
        Args: { input_name: string; position_name: string }
        Returns: {
          candidate_id: string
          canonical_name: string
          distance: number
        }[]
      }
      levenshtein_distance: {
        Args: { s1: string; s2: string }
        Returns: number
      }
      process_nomination: {
        Args: {
          nominee_name_input: string
          nominator_name_input: string
          position_input: string
          statement_input: string
        }
        Returns: Json
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
