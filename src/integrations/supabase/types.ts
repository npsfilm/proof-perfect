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
      galleries: {
        Row: {
          created_at: string
          delivered_at: string | null
          final_delivery_link: string | null
          id: string
          is_locked: boolean
          name: string
          package_target_count: number
          reviewed_at: string | null
          reviewed_by: string | null
          salutation_type: Database["public"]["Enums"]["salutation_t"]
          slug: string
          status: Database["public"]["Enums"]["gallery_status_t"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          final_delivery_link?: string | null
          id?: string
          is_locked?: boolean
          name: string
          package_target_count: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          salutation_type: Database["public"]["Enums"]["salutation_t"]
          slug: string
          status?: Database["public"]["Enums"]["gallery_status_t"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          final_delivery_link?: string | null
          id?: string
          is_locked?: boolean
          name?: string
          package_target_count?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          salutation_type?: Database["public"]["Enums"]["salutation_t"]
          slug?: string
          status?: Database["public"]["Enums"]["gallery_status_t"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "galleries_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_access: {
        Row: {
          created_at: string
          gallery_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gallery_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gallery_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_access_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_feedback: {
        Row: {
          author_user_id: string
          created_at: string
          gallery_id: string
          id: string
          message: string
        }
        Insert: {
          author_user_id: string
          created_at?: string
          gallery_id: string
          id?: string
          message: string
        }
        Update: {
          author_user_id?: string
          created_at?: string
          gallery_id?: string
          id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_feedback_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_feedback_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          client_comment: string | null
          created_at: string
          filename: string
          gallery_id: string
          id: string
          is_selected: boolean
          staging_requested: boolean
          staging_style: string | null
          storage_url: string
          updated_at: string
          upload_order: number
        }
        Insert: {
          client_comment?: string | null
          created_at?: string
          filename: string
          gallery_id: string
          id?: string
          is_selected?: boolean
          staging_requested?: boolean
          staging_style?: string | null
          storage_url: string
          updated_at?: string
          upload_order: number
        }
        Update: {
          client_comment?: string | null
          created_at?: string
          filename?: string
          gallery_id?: string
          id?: string
          is_selected?: boolean
          staging_requested?: boolean
          staging_style?: string | null
          storage_url?: string
          updated_at?: string
          upload_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "photos_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      staging_references: {
        Row: {
          created_at: string
          file_url: string
          id: string
          notes: string | null
          photo_id: string
          uploader_user_id: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          notes?: string | null
          photo_id: string
          uploader_user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          notes?: string | null
          photo_id?: string
          uploader_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staging_references_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staging_references_uploader_user_id_fkey"
            columns: ["uploader_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          zapier_webhook_deliver: string | null
          zapier_webhook_send: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          zapier_webhook_deliver?: string | null
          zapier_webhook_send?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          zapier_webhook_deliver?: string | null
          zapier_webhook_send?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["role_t"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["role_t"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["role_t"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string
          gallery_id: string | null
          id: string
          response_body: Json | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          gallery_id?: string | null
          id?: string
          response_body?: Json | null
          status: string
          type: string
        }
        Update: {
          created_at?: string
          gallery_id?: string | null
          id?: string
          response_body?: Json | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_clients_to_gallery: {
        Args: { p_emails: string[]; p_gallery_id: string }
        Returns: Json
      }
      generate_unique_slug: { Args: { p_name: string }; Returns: string }
      get_my_role: { Args: never; Returns: string }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["role_t"]; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      gallery_status_t: "Draft" | "Sent" | "Reviewed" | "Delivered"
      role_t: "admin" | "client"
      salutation_t: "Du" | "Sie"
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
      gallery_status_t: ["Draft", "Sent", "Reviewed", "Delivered"],
      role_t: ["admin", "client"],
      salutation_t: ["Du", "Sie"],
    },
  },
} as const
