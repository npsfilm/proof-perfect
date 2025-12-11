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
      availability_settings: {
        Row: {
          buffer_after: number
          buffer_before: number
          created_at: string
          friday_enabled: boolean
          friday_end: string
          friday_start: string
          id: string
          monday_enabled: boolean
          monday_end: string
          monday_start: string
          saturday_enabled: boolean
          saturday_end: string
          saturday_start: string
          slot_interval: number
          sunday_enabled: boolean
          sunday_end: string
          sunday_start: string
          thursday_enabled: boolean
          thursday_end: string
          thursday_start: string
          tuesday_enabled: boolean
          tuesday_end: string
          tuesday_start: string
          updated_at: string
          user_id: string
          wednesday_enabled: boolean
          wednesday_end: string
          wednesday_start: string
        }
        Insert: {
          buffer_after?: number
          buffer_before?: number
          created_at?: string
          friday_enabled?: boolean
          friday_end?: string
          friday_start?: string
          id?: string
          monday_enabled?: boolean
          monday_end?: string
          monday_start?: string
          saturday_enabled?: boolean
          saturday_end?: string
          saturday_start?: string
          slot_interval?: number
          sunday_enabled?: boolean
          sunday_end?: string
          sunday_start?: string
          thursday_enabled?: boolean
          thursday_end?: string
          thursday_start?: string
          tuesday_enabled?: boolean
          tuesday_end?: string
          tuesday_start?: string
          updated_at?: string
          user_id: string
          wednesday_enabled?: boolean
          wednesday_end?: string
          wednesday_start?: string
        }
        Update: {
          buffer_after?: number
          buffer_before?: number
          created_at?: string
          friday_enabled?: boolean
          friday_end?: string
          friday_start?: string
          id?: string
          monday_enabled?: boolean
          monday_end?: string
          monday_start?: string
          saturday_enabled?: boolean
          saturday_end?: string
          saturday_start?: string
          slot_interval?: number
          sunday_enabled?: boolean
          sunday_end?: string
          sunday_start?: string
          thursday_enabled?: boolean
          thursday_end?: string
          thursday_start?: string
          tuesday_enabled?: boolean
          tuesday_end?: string
          tuesday_start?: string
          updated_at?: string
          user_id?: string
          wednesday_enabled?: boolean
          wednesday_end?: string
          wednesday_start?: string
        }
        Relationships: []
      }
      blocked_dates: {
        Row: {
          created_at: string
          end_date: string
          google_event_id: string | null
          id: string
          reason: string | null
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          google_event_id?: string | null
          id?: string
          reason?: string | null
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          google_event_id?: string | null
          id?: string
          reason?: string | null
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      booking_packages: {
        Row: {
          created_at: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          package_type: string
          photo_count: number
          price_cents: number
          requires_additional_info: boolean | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          package_type: string
          photo_count: number
          price_cents: number
          requires_additional_info?: boolean | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          package_type?: string
          photo_count?: number
          price_cents?: number
          requires_additional_info?: boolean | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address: string
          batch_id: string
          company_name: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          drive_distance_km: number | null
          drive_time_from_previous_minutes: number | null
          estimated_duration_minutes: number
          id: string
          is_weekend_request: boolean | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          package_type: string
          photo_count: number
          property_index: number
          property_type: string | null
          scheduled_date: string
          scheduled_end: string
          scheduled_start: string
          source: string | null
          square_meters: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          address: string
          batch_id: string
          company_name?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          drive_distance_km?: number | null
          drive_time_from_previous_minutes?: number | null
          estimated_duration_minutes: number
          id?: string
          is_weekend_request?: boolean | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          package_type: string
          photo_count: number
          property_index?: number
          property_type?: string | null
          scheduled_date: string
          scheduled_end: string
          scheduled_start: string
          source?: string | null
          square_meters?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          batch_id?: string
          company_name?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          drive_distance_km?: number | null
          drive_time_from_previous_minutes?: number | null
          estimated_duration_minutes?: number
          id?: string
          is_weekend_request?: boolean | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          package_type?: string
          photo_count?: number
          property_index?: number
          property_type?: string | null
          scheduled_date?: string
          scheduled_end?: string
          scheduled_start?: string
          source?: string | null
          square_meters?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      client_watermarks: {
        Row: {
          created_at: string
          id: string
          opacity: number
          position_x: number
          position_y: number
          size_percent: number
          storage_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opacity?: number
          position_x?: number
          position_y?: number
          size_percent?: number
          storage_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opacity?: number
          position_x?: number
          position_y?: number
          size_percent?: number
          storage_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          anrede: string | null
          ansprache: string
          company_id: string | null
          created_at: string
          email: string
          id: string
          nachname: string
          updated_at: string
          vorname: string
        }
        Insert: {
          anrede?: string | null
          ansprache: string
          company_id?: string | null
          created_at?: string
          email: string
          id?: string
          nachname: string
          updated_at?: string
          vorname: string
        }
        Update: {
          anrede?: string | null
          ansprache?: string
          company_id?: string | null
          created_at?: string
          email?: string
          id?: string
          nachname?: string
          updated_at?: string
          vorname?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_gallery_stats"
            referencedColumns: ["company_id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_gallery_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
          },
        ]
      }
      delivery_files: {
        Row: {
          created_at: string
          file_size: number | null
          filename: string
          folder_type: string
          gallery_id: string
          id: string
          storage_url: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          filename: string
          folder_type: string
          gallery_id: string
          id?: string
          storage_url: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          filename?: string
          folder_type?: string
          gallery_id?: string
          id?: string
          storage_url?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_files_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_files_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "v_gallery_selection_stats"
            referencedColumns: ["gallery_id"]
          },
          {
            foreignKeyName: "delivery_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
          },
        ]
      }
      download_logs: {
        Row: {
          created_at: string
          download_type: string
          file_count: number
          file_id: string | null
          folder_type: string | null
          gallery_id: string
          id: string
          total_size_bytes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          download_type: string
          file_count?: number
          file_id?: string | null
          folder_type?: string | null
          gallery_id: string
          id?: string
          total_size_bytes?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          download_type?: string
          file_count?: number
          file_id?: string | null
          folder_type?: string | null
          gallery_id?: string
          id?: string
          total_size_bytes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "download_logs_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "delivery_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "download_logs_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "download_logs_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "v_gallery_selection_stats"
            referencedColumns: ["gallery_id"]
          },
          {
            foreignKeyName: "download_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "download_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
          },
        ]
      }
      events: {
        Row: {
          calendar_source: string | null
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string
          google_event_id: string | null
          id: string
          last_synced_at: string | null
          location: string | null
          start_time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calendar_source?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          google_event_id?: string | null
          id?: string
          last_synced_at?: string | null
          location?: string | null
          start_time: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calendar_source?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          google_event_id?: string | null
          id?: string
          last_synced_at?: string | null
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      galleries: {
        Row: {
          address: string | null
          company_id: string | null
          created_at: string
          delivered_at: string | null
          express_delivery_requested: boolean
          final_delivery_link: string | null
          id: string
          is_locked: boolean
          name: string
          package_target_count: number
          reviewed_at: string | null
          reviewed_by: string | null
          salutation_type: Database["public"]["Enums"]["salutation_t"]
          show_onboarding: boolean
          slug: string
          status: Database["public"]["Enums"]["gallery_status_t"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id?: string | null
          created_at?: string
          delivered_at?: string | null
          express_delivery_requested?: boolean
          final_delivery_link?: string | null
          id?: string
          is_locked?: boolean
          name: string
          package_target_count: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          salutation_type: Database["public"]["Enums"]["salutation_t"]
          show_onboarding?: boolean
          slug: string
          status?: Database["public"]["Enums"]["gallery_status_t"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string | null
          created_at?: string
          delivered_at?: string | null
          express_delivery_requested?: boolean
          final_delivery_link?: string | null
          id?: string
          is_locked?: boolean
          name?: string
          package_target_count?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          salutation_type?: Database["public"]["Enums"]["salutation_t"]
          show_onboarding?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["gallery_status_t"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "galleries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "galleries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_gallery_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "galleries_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "galleries_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
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
            foreignKeyName: "gallery_access_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "v_gallery_selection_stats"
            referencedColumns: ["gallery_id"]
          },
          {
            foreignKeyName: "gallery_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
          },
        ]
      }
      gallery_clients: {
        Row: {
          client_id: string
          created_at: string
          gallery_id: string
          id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          gallery_id: string
          id?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          gallery_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_clients_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_clients_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "v_gallery_selection_stats"
            referencedColumns: ["gallery_id"]
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
            foreignKeyName: "gallery_feedback_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "gallery_feedback_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_feedback_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "v_gallery_selection_stats"
            referencedColumns: ["gallery_id"]
          },
        ]
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      photo_annotations: {
        Row: {
          author_user_id: string
          comment: string
          created_at: string
          id: string
          photo_id: string
          updated_at: string
          x_position: number
          y_position: number
        }
        Insert: {
          author_user_id: string
          comment: string
          created_at?: string
          id?: string
          photo_id: string
          updated_at?: string
          x_position: number
          y_position: number
        }
        Update: {
          author_user_id?: string
          comment?: string
          created_at?: string
          id?: string
          photo_id?: string
          updated_at?: string
          x_position?: number
          y_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "photo_annotations_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          blue_hour_requested: boolean
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
          blue_hour_requested?: boolean
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
          blue_hour_requested?: boolean
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
          {
            foreignKeyName: "photos_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "v_gallery_selection_stats"
            referencedColumns: ["gallery_id"]
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
      reopen_requests: {
        Row: {
          created_at: string
          gallery_id: string
          id: string
          message: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gallery_id: string
          id?: string
          message?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gallery_id?: string
          id?: string
          message?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reopen_requests_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reopen_requests_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "v_gallery_selection_stats"
            referencedColumns: ["gallery_id"]
          },
          {
            foreignKeyName: "reopen_requests_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reopen_requests_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reopen_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reopen_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
          },
        ]
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
          {
            foreignKeyName: "staging_references_uploader_user_id_fkey"
            columns: ["uploader_user_id"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
          },
        ]
      }
      staging_request_photos: {
        Row: {
          created_at: string
          id: string
          photo_id: string
          staging_request_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_id: string
          staging_request_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_id?: string
          staging_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staging_request_photos_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staging_request_photos_staging_request_id_fkey"
            columns: ["staging_request_id"]
            isOneToOne: false
            referencedRelation: "staging_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      staging_requests: {
        Row: {
          created_at: string
          gallery_id: string
          id: string
          notes: string | null
          reference_image_urls: string[] | null
          staging_style: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gallery_id: string
          id?: string
          notes?: string | null
          reference_image_urls?: string[] | null
          staging_style: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gallery_id?: string
          id?: string
          notes?: string | null
          reference_image_urls?: string[] | null
          staging_style?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staging_requests_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staging_requests_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "v_gallery_selection_stats"
            referencedColumns: ["gallery_id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          email_deliver_body_du: string | null
          email_deliver_body_sie: string | null
          email_deliver_subject_du: string | null
          email_deliver_subject_sie: string | null
          email_review_body_du: string | null
          email_review_body_sie: string | null
          email_review_subject_du: string | null
          email_review_subject_sie: string | null
          email_send_body_du: string | null
          email_send_body_sie: string | null
          email_send_subject_du: string | null
          email_send_subject_sie: string | null
          id: string
          updated_at: string
          zapier_webhook_deliver: string | null
          zapier_webhook_send: string | null
        }
        Insert: {
          created_at?: string
          email_deliver_body_du?: string | null
          email_deliver_body_sie?: string | null
          email_deliver_subject_du?: string | null
          email_deliver_subject_sie?: string | null
          email_review_body_du?: string | null
          email_review_body_sie?: string | null
          email_review_subject_du?: string | null
          email_review_subject_sie?: string | null
          email_send_body_du?: string | null
          email_send_body_sie?: string | null
          email_send_subject_du?: string | null
          email_send_subject_sie?: string | null
          id?: string
          updated_at?: string
          zapier_webhook_deliver?: string | null
          zapier_webhook_send?: string | null
        }
        Update: {
          created_at?: string
          email_deliver_body_du?: string | null
          email_deliver_body_sie?: string | null
          email_deliver_subject_du?: string | null
          email_deliver_subject_sie?: string | null
          email_review_body_du?: string | null
          email_review_body_sie?: string | null
          email_review_subject_du?: string | null
          email_review_subject_sie?: string | null
          email_send_body_du?: string | null
          email_send_body_sie?: string | null
          email_send_subject_du?: string | null
          email_send_subject_sie?: string | null
          id?: string
          updated_at?: string
          zapier_webhook_deliver?: string | null
          zapier_webhook_send?: string | null
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          category: string
          color_key: string
          color_value_dark: string | null
          color_value_light: string
          created_at: string | null
          id: string
          label: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          color_key: string
          color_value_dark?: string | null
          color_value_light: string
          created_at?: string | null
          id?: string
          label: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          color_key?: string
          color_value_dark?: string | null
          color_value_light?: string
          created_at?: string | null
          id?: string
          label?: string
          sort_order?: number | null
          updated_at?: string | null
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
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
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
          {
            foreignKeyName: "webhook_logs_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "v_gallery_selection_stats"
            referencedColumns: ["gallery_id"]
          },
        ]
      }
      zip_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          expires_at: string | null
          file_count: number | null
          folder_type: string | null
          gallery_id: string
          id: string
          status: string
          storage_path: string | null
          total_size_bytes: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          file_count?: number | null
          folder_type?: string | null
          gallery_id: string
          id?: string
          status?: string
          storage_path?: string | null
          total_size_bytes?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          file_count?: number | null
          folder_type?: string | null
          gallery_id?: string
          id?: string
          status?: string
          storage_path?: string | null
          total_size_bytes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zip_jobs_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zip_jobs_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "v_gallery_selection_stats"
            referencedColumns: ["gallery_id"]
          },
          {
            foreignKeyName: "zip_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zip_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      v_company_gallery_stats: {
        Row: {
          company_id: string | null
          company_name: string | null
          delivered_count: number | null
          domain: string | null
          galleries_count: number | null
          photos_count: number | null
          reviewed_count: number | null
          selected_count: number | null
          slug: string | null
          staging_count: number | null
        }
        Relationships: []
      }
      v_gallery_selection_stats: {
        Row: {
          company_id: string | null
          created_at: string | null
          gallery_id: string | null
          name: string | null
          photos_count: number | null
          selected_count: number | null
          slug: string | null
          staging_count: number | null
          status: Database["public"]["Enums"]["gallery_status_t"] | null
        }
        Relationships: [
          {
            foreignKeyName: "galleries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "galleries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_gallery_stats"
            referencedColumns: ["company_id"]
          },
        ]
      }
      v_user_activity: {
        Row: {
          email: string | null
          galleries_assigned: number | null
          last_activity: string | null
          role: Database["public"]["Enums"]["role_t"] | null
          selections_made: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_clients_to_gallery: {
        Args: { p_emails: string[]; p_gallery_id: string }
        Returns: Json
      }
      assign_gallery_to_company: {
        Args: { p_company_id: string; p_gallery_id: string }
        Returns: undefined
      }
      generate_company_slug: { Args: { p_name: string }; Returns: string }
      generate_unique_slug: { Args: { p_name: string }; Returns: string }
      get_my_role: { Args: never; Returns: string }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["role_t"]; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      gallery_status_t:
        | "Planning"
        | "Open"
        | "Closed"
        | "Processing"
        | "Delivered"
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
      gallery_status_t: [
        "Planning",
        "Open",
        "Closed",
        "Processing",
        "Delivered",
      ],
      role_t: ["admin", "client"],
      salutation_t: ["Du", "Sie"],
    },
  },
} as const
