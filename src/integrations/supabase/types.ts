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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_pings: {
        Row: {
          day: string
          user_id: string
        }
        Insert: {
          day?: string
          user_id: string
        }
        Update: {
          day?: string
          user_id?: string
        }
        Relationships: []
      }
      advice_posts: {
        Row: {
          audience: Database["public"]["Enums"]["advice_audience"]
          author_id: string | null
          body: string
          category: string | null
          created_at: string
          id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["advice_audience"]
          author_id?: string | null
          body: string
          category?: string | null
          created_at?: string
          id?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["advice_audience"]
          author_id?: string | null
          body?: string
          category?: string | null
          created_at?: string
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      buddy_profiles: {
        Row: {
          bio: string | null
          colleges: string | null
          contact: string | null
          created_at: string
          display_name: string
          grade_level: string | null
          scholarships: string | null
          updated_at: string
          user_id: string
          visible: boolean
        }
        Insert: {
          bio?: string | null
          colleges?: string | null
          contact?: string | null
          created_at?: string
          display_name: string
          grade_level?: string | null
          scholarships?: string | null
          updated_at?: string
          user_id: string
          visible?: boolean
        }
        Update: {
          bio?: string | null
          colleges?: string | null
          contact?: string | null
          created_at?: string
          display_name?: string
          grade_level?: string | null
          scholarships?: string | null
          updated_at?: string
          user_id?: string
          visible?: boolean
        }
        Relationships: []
      }
      college_applications: {
        Row: {
          accepted: boolean | null
          college_name: string
          created_at: string
          id: string
          notes: string | null
          submitted: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted?: boolean | null
          college_name: string
          created_at?: string
          id?: string
          notes?: string | null
          submitted?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted?: boolean | null
          college_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          submitted?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      discussion_replies: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          thread_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          thread_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_threads: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          title: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          title: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          title?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_threads_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "discussion_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_topics: {
        Row: {
          audience: Database["public"]["Enums"]["advice_audience"]
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          audience?: Database["public"]["Enums"]["advice_audience"]
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          audience?: Database["public"]["Enums"]["advice_audience"]
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          path: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          message: string
          path?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          path?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      nudges: {
        Row: {
          created_at: string
          id: string
          message: string
          parent_id: string
          read_at: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          parent_id: string
          read_at?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          parent_id?: string
          read_at?: string | null
          student_id?: string
        }
        Relationships: []
      }
      parent_invites: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          student_id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          student_id: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          student_id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      parent_student_links: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: []
      }
      personality_results: {
        Row: {
          answers: Json
          archetype: string
          axes: Json
          id: string
          taken_at: string
          user_id: string
        }
        Insert: {
          answers: Json
          archetype: string
          axes: Json
          id?: string
          taken_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          archetype?: string
          axes?: Json
          id?: string
          taken_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          grade_level: number | null
          id: string
          last_visited_at: string | null
          last_visited_module: string | null
          onboarded_at: string | null
          parent_focus: string[] | null
          parent_household_students: number | null
          parent_relationship: string | null
          parent_style: string | null
          parent_update_freq: string | null
          playlist_pref: string | null
          pronouns: string | null
          school: string | null
          theme_mode: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          accent?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          grade_level?: number | null
          id: string
          last_visited_at?: string | null
          last_visited_module?: string | null
          onboarded_at?: string | null
          parent_focus?: string[] | null
          parent_household_students?: number | null
          parent_relationship?: string | null
          parent_style?: string | null
          parent_update_freq?: string | null
          playlist_pref?: string | null
          pronouns?: string | null
          school?: string | null
          theme_mode?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          accent?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          grade_level?: number | null
          id?: string
          last_visited_at?: string | null
          last_visited_module?: string | null
          onboarded_at?: string | null
          parent_focus?: string[] | null
          parent_household_students?: number | null
          parent_relationship?: string | null
          parent_style?: string | null
          parent_update_freq?: string | null
          playlist_pref?: string | null
          pronouns?: string | null
          school?: string | null
          theme_mode?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      scholarship_applications: {
        Row: {
          amount: number | null
          created_at: string
          date_applied: string | null
          id: string
          name: string
          notes: string | null
          received: boolean
          scholarship_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          date_applied?: string | null
          id?: string
          name: string
          notes?: string | null
          received?: boolean
          scholarship_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          date_applied?: string | null
          id?: string
          name?: string
          notes?: string | null
          received?: boolean
          scholarship_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_applications_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: number | null
          apply_url: string | null
          category: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          eligibility: string | null
          id: string
          name: string
          provider: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          apply_url?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          name: string
          provider?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          apply_url?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          name?: string
          provider?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          career_paths: string[]
          created_at: string
          intended_majors: string[]
          interests: string[]
          target_colleges: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          career_paths?: string[]
          created_at?: string
          intended_majors?: string[]
          interests?: string[]
          target_colleges?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          career_paths?: string[]
          created_at?: string
          intended_majors?: string[]
          interests?: string[]
          target_colleges?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wins: {
        Row: {
          amount: number | null
          anonymous: boolean
          created_at: string
          display_name: string | null
          id: string
          note: string | null
          scholarship_name: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          anonymous?: boolean
          created_at?: string
          display_name?: string | null
          id?: string
          note?: string | null
          scholarship_name: string
          user_id: string
        }
        Update: {
          amount?: number | null
          anonymous?: boolean
          created_at?: string
          display_name?: string | null
          id?: string
          note?: string | null
          scholarship_name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_linked_parent: {
        Args: { _parent: string; _student: string }
        Returns: boolean
      }
      redeem_parent_invite: { Args: { _code: string }; Returns: string }
    }
    Enums: {
      advice_audience: "student" | "parent" | "both"
      app_role: "admin" | "user"
      user_type: "student" | "parent"
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
    Enums: {
      advice_audience: ["student", "parent", "both"],
      app_role: ["admin", "user"],
      user_type: ["student", "parent"],
    },
  },
} as const
