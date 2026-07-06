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
      aid_awards: {
        Row: {
          college_id: string | null
          college_name: string
          cost_of_attendance: number | null
          created_at: string
          family_contribution: number | null
          grants: number
          id: string
          loans: number
          notes: string | null
          scholarships_amt: number
          updated_at: string
          user_id: string
          work_study: number
        }
        Insert: {
          college_id?: string | null
          college_name: string
          cost_of_attendance?: number | null
          created_at?: string
          family_contribution?: number | null
          grants?: number
          id?: string
          loans?: number
          notes?: string | null
          scholarships_amt?: number
          updated_at?: string
          user_id: string
          work_study?: number
        }
        Update: {
          college_id?: string | null
          college_name?: string
          cost_of_attendance?: number | null
          created_at?: string
          family_contribution?: number | null
          grants?: number
          id?: string
          loans?: number
          notes?: string | null
          scholarships_amt?: number
          updated_at?: string
          user_id?: string
          work_study?: number
        }
        Relationships: [
          {
            foreignKeyName: "aid_awards_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "college_applications"
            referencedColumns: ["id"]
          },
        ]
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
          common_app_submitted: boolean
          created_at: string
          deadline_date: string | null
          deadline_type: string | null
          essay_draft: string | null
          id: string
          notes: string | null
          recs_submitted: boolean
          scores_sent: boolean
          submitted: boolean
          supplements_submitted: boolean
          transcript_sent: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted?: boolean | null
          college_name: string
          common_app_submitted?: boolean
          created_at?: string
          deadline_date?: string | null
          deadline_type?: string | null
          essay_draft?: string | null
          id?: string
          notes?: string | null
          recs_submitted?: boolean
          scores_sent?: boolean
          submitted?: boolean
          supplements_submitted?: boolean
          transcript_sent?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted?: boolean | null
          college_name?: string
          common_app_submitted?: boolean
          created_at?: string
          deadline_date?: string | null
          deadline_type?: string | null
          essay_draft?: string | null
          id?: string
          notes?: string | null
          recs_submitted?: boolean
          scores_sent?: boolean
          submitted?: boolean
          supplements_submitted?: boolean
          transcript_sent?: boolean
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
      essay_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          essay_id: string
          id: string
          student_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          essay_id: string
          id?: string
          student_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          essay_id?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "essay_comments_essay_id_fkey"
            columns: ["essay_id"]
            isOneToOne: false
            referencedRelation: "essays"
            referencedColumns: ["id"]
          },
        ]
      }
      essays: {
        Row: {
          college_id: string | null
          created_at: string
          draft_content: string
          id: string
          prompt: string | null
          prompt_type: string
          status: string
          title: string
          updated_at: string
          user_id: string
          version: number
          word_limit: number | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          draft_content?: string
          id?: string
          prompt?: string | null
          prompt_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id: string
          version?: number
          word_limit?: number | null
        }
        Update: {
          college_id?: string | null
          created_at?: string
          draft_content?: string
          id?: string
          prompt?: string | null
          prompt_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          version?: number
          word_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "essays_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "college_applications"
            referencedColumns: ["id"]
          },
        ]
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
      finaid_tasks: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          note: string | null
          task_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          note?: string | null
          task_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          note?: string | null
          task_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      key_dates: {
        Row: {
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          source: string | null
          state: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          source?: string | null
          state?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          source?: string | null
          state?: string | null
          title?: string
          updated_at?: string
          url?: string | null
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
      parent_saved_articles: {
        Row: {
          article_slug: string
          created_at: string
          id: string
          parent_id: string
        }
        Insert: {
          article_slug: string
          created_at?: string
          id?: string
          parent_id: string
        }
        Update: {
          article_slug?: string
          created_at?: string
          id?: string
          parent_id?: string
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
      parent_tasks: {
        Row: {
          category: string
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          notes: string | null
          parent_id: string
          student_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          notes?: string | null
          parent_id: string
          student_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          notes?: string | null
          parent_id?: string
          student_id?: string | null
          title?: string
          updated_at?: string
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
          email_reminders: boolean
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
          reminder_lead_days: number[]
          school: string | null
          state: string | null
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
          email_reminders?: boolean
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
          reminder_lead_days?: number[]
          school?: string | null
          state?: string | null
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
          email_reminders?: boolean
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
          reminder_lead_days?: number[]
          school?: string | null
          state?: string | null
          theme_mode?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      recommendation_requests: {
        Row: {
          college_id: string | null
          confirmed_at: string | null
          created_at: string
          deadline: string | null
          id: string
          notes: string | null
          recommender_id: string
          requested_at: string | null
          status: string
          submitted_at: string | null
          thank_you_sent: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          college_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          notes?: string | null
          recommender_id: string
          requested_at?: string | null
          status?: string
          submitted_at?: string | null
          thank_you_sent?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          college_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          notes?: string | null
          recommender_id?: string
          requested_at?: string | null
          status?: string
          submitted_at?: string | null
          thank_you_sent?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_requests_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "college_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_requests_recommender_id_fkey"
            columns: ["recommender_id"]
            isOneToOne: false
            referencedRelation: "recommenders"
            referencedColumns: ["id"]
          },
        ]
      }
      recommenders: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          relationship: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          relationship?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          relationship?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          body: string | null
          created_at: string
          days_out: number
          due_date: string
          emailed_at: string | null
          id: string
          key_date_id: string | null
          read_at: string | null
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          days_out: number
          due_date: string
          emailed_at?: string | null
          id?: string
          key_date_id?: string | null
          read_at?: string | null
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          days_out?: number
          due_date?: string
          emailed_at?: string | null
          id?: string
          key_date_id?: string | null
          read_at?: string | null
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_key_date_id_fkey"
            columns: ["key_date_id"]
            isOneToOne: false
            referencedRelation: "key_dates"
            referencedColumns: ["id"]
          },
        ]
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
      tutor_messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "tutor_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          subject: string | null
          thread_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          subject?: string | null
          thread_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          subject?: string | null
          thread_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_notes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "tutor_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_threads: {
        Row: {
          created_at: string
          id: string
          level: string
          subject: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string
          subject?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          subject?: string
          title?: string
          updated_at?: string
          user_id?: string
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
