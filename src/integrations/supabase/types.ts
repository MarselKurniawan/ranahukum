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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      consultations: {
        Row: {
          client_id: string
          created_at: string
          ended_at: string | null
          id: string
          lawyer_id: string
          lawyer_notes: string | null
          price: number
          started_at: string | null
          status: string
          topic: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          lawyer_id: string
          lawyer_notes?: string | null
          price: number
          started_at?: string | null
          status?: string
          topic: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          lawyer_id?: string
          lawyer_notes?: string | null
          price?: number
          started_at?: string | null
          status?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          interview_id: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          interview_id: string
          sender_id: string
          sender_type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          interview_id?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_messages_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          admin_id: string
          created_at: string
          ended_at: string | null
          google_meet_link: string | null
          id: string
          lawyer_id: string
          notes: string | null
          scheduled_at: string | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          ended_at?: string | null
          google_meet_link?: string | null
          id?: string
          lawyer_id: string
          notes?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          ended_at?: string | null
          google_meet_link?: string | null
          id?: string
          lawyer_id?: string
          notes?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_documents: {
        Row: {
          document_type: string
          file_name: string
          file_url: string
          id: string
          lawyer_id: string
          notes: string | null
          reviewed_at: string | null
          status: string | null
          uploaded_at: string
        }
        Insert: {
          document_type: string
          file_name: string
          file_url: string
          id?: string
          lawyer_id: string
          notes?: string | null
          reviewed_at?: string | null
          status?: string | null
          uploaded_at?: string
        }
        Update: {
          document_type?: string
          file_name?: string
          file_url?: string
          id?: string
          lawyer_id?: string
          notes?: string | null
          reviewed_at?: string | null
          status?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_documents_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_price_requests: {
        Row: {
          created_at: string
          current_price: number
          id: string
          lawyer_id: string
          notes: string | null
          request_type: string
          requested_price: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          current_price: number
          id?: string
          lawyer_id: string
          notes?: string | null
          request_type: string
          requested_price: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          current_price?: number
          id?: string
          lawyer_id?: string
          notes?: string | null
          request_type?: string
          requested_price?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_price_requests_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_quiz_answers: {
        Row: {
          answer: string
          created_at: string
          id: string
          lawyer_id: string
          question_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          lawyer_id: string
          question_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          lawyer_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_quiz_answers_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "lawyer_quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_quiz_questions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          question: string
          question_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          question_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          question_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      lawyer_schedules: {
        Row: {
          created_at: string
          date: string
          id: string
          is_available: boolean
          lawyer_id: string
          time_slot: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_available?: boolean
          lawyer_id: string
          time_slot: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean
          lawyer_id?: string
          time_slot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_schedules_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyers: {
        Row: {
          approval_status: string
          consultation_count: number | null
          created_at: string
          education: string | null
          experience_years: number | null
          id: string
          image_url: string | null
          interview_consent: boolean | null
          is_available: boolean | null
          is_suspended: boolean | null
          is_verified: boolean | null
          location: string | null
          name: string
          pendampingan_price: number | null
          price: number | null
          quiz_completed: boolean | null
          rating: number | null
          review_count: number | null
          specialization: string[] | null
          submitted_at: string | null
          suspend_reason: string | null
          suspended_until: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string
          consultation_count?: number | null
          created_at?: string
          education?: string | null
          experience_years?: number | null
          id?: string
          image_url?: string | null
          interview_consent?: boolean | null
          is_available?: boolean | null
          is_suspended?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          name: string
          pendampingan_price?: number | null
          price?: number | null
          quiz_completed?: boolean | null
          rating?: number | null
          review_count?: number | null
          specialization?: string[] | null
          submitted_at?: string | null
          suspend_reason?: string | null
          suspended_until?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string
          consultation_count?: number | null
          created_at?: string
          education?: string | null
          experience_years?: number | null
          id?: string
          image_url?: string | null
          interview_consent?: boolean | null
          is_available?: boolean | null
          is_suspended?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          name?: string
          pendampingan_price?: number | null
          price?: number | null
          quiz_completed?: boolean | null
          rating?: number | null
          review_count?: number | null
          specialization?: string[] | null
          submitted_at?: string | null
          suspend_reason?: string | null
          suspended_until?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      legal_assistance_messages: {
        Row: {
          content: string
          created_at: string
          file_url: string | null
          id: string
          is_price_offer: boolean | null
          message_type: string
          offered_price: number | null
          request_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_price_offer?: boolean | null
          message_type?: string
          offered_price?: number | null
          request_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_price_offer?: boolean | null
          message_type?: string
          offered_price?: number | null
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_assistance_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_assistance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_assistance_requests: {
        Row: {
          agreed_price: number | null
          case_description: string
          client_id: string
          created_at: string
          current_stage: string | null
          id: string
          lawyer_id: string
          payment_status: string
          proposed_price: number | null
          stage_notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agreed_price?: number | null
          case_description: string
          client_id: string
          created_at?: string
          current_stage?: string | null
          id?: string
          lawyer_id: string
          payment_status?: string
          proposed_price?: number | null
          stage_notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agreed_price?: number | null
          case_description?: string
          client_id?: string
          created_at?: string
          current_stage?: string | null
          id?: string
          lawyer_id?: string
          payment_status?: string
          proposed_price?: number | null
          stage_notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_assistance_requests_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_assistance_status_history: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          request_id: string
          stage: string | null
          status: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          request_id: string
          stage?: string | null
          status: string
          updated_by: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          request_id?: string
          stage?: string | null
          status?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_assistance_status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_assistance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          consultation_id: string
          content: string
          created_at: string
          file_url: string | null
          id: string
          is_read: boolean | null
          message_type: string
          sender_id: string
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string
          sender_id: string
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          image_url: string | null
          is_active: boolean
          promo_code: string | null
          target_audience: string
          title: string
          type: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          promo_code?: string | null
          target_audience?: string
          title: string
          type?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          promo_code?: string | null
          target_audience?: string
          title?: string
          type?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_suspended: boolean | null
          phone: string | null
          suspend_reason: string | null
          suspended_until: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          phone?: string | null
          suspend_reason?: string | null
          suspended_until?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          phone?: string | null
          suspend_reason?: string | null
          suspended_until?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          consultation_topic: string | null
          created_at: string
          id: string
          lawyer_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          consultation_topic?: string | null
          created_at?: string
          id?: string
          lawyer_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          consultation_topic?: string | null
          created_at?: string
          id?: string
          lawyer_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      specialization_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      user_notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Enums: {
      app_role: "admin" | "lawyer" | "user" | "superadmin"
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
      app_role: ["admin", "lawyer", "user", "superadmin"],
    },
  },
} as const
