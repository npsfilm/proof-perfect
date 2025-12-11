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
      company_billing: {
        Row: {
          bank_name: string | null
          bic: string | null
          billing_city: string | null
          billing_country: string | null
          billing_email: string | null
          billing_name: string | null
          billing_street: string | null
          billing_zip: string | null
          company_id: string
          created_at: string
          iban: string | null
          id: string
          notes: string | null
          payment_terms_days: number | null
          tax_number: string | null
          updated_at: string
          vat_id: string | null
        }
        Insert: {
          bank_name?: string | null
          bic?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_email?: string | null
          billing_name?: string | null
          billing_street?: string | null
          billing_zip?: string | null
          company_id: string
          created_at?: string
          iban?: string | null
          id?: string
          notes?: string | null
          payment_terms_days?: number | null
          tax_number?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Update: {
          bank_name?: string | null
          bic?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_email?: string | null
          billing_name?: string | null
          billing_street?: string | null
          billing_zip?: string | null
          company_id?: string
          created_at?: string
          iban?: string | null
          id?: string
          notes?: string | null
          payment_terms_days?: number | null
          tax_number?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_billing_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_billing_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "v_company_gallery_stats"
            referencedColumns: ["company_id"]
          },
        ]
      }
      company_members: {
        Row: {
          can_manage_team: boolean
          can_view_invoices: boolean
          can_view_prices: boolean
          company_id: string
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          role: Database["public"]["Enums"]["company_role_t"]
          user_id: string
        }
        Insert: {
          can_manage_team?: boolean
          can_view_invoices?: boolean
          can_view_prices?: boolean
          company_id: string
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: Database["public"]["Enums"]["company_role_t"]
          user_id: string
        }
        Update: {
          can_manage_team?: boolean
          can_view_invoices?: boolean
          can_view_prices?: boolean
          company_id?: string
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: Database["public"]["Enums"]["company_role_t"]
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
            foreignKeyName: "company_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
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
      discounts: {
        Row: {
          buy_quantity: number | null
          created_at: string
          discount_type: Database["public"]["Enums"]["discount_type_t"]
          fixed_amount_cents: number | null
          free_quantity: number | null
          id: string
          is_active: boolean | null
          min_quantity: number | null
          name: string
          percentage: number | null
          service_id: string | null
          updated_at: string
        }
        Insert: {
          buy_quantity?: number | null
          created_at?: string
          discount_type?: Database["public"]["Enums"]["discount_type_t"]
          fixed_amount_cents?: number | null
          free_quantity?: number | null
          id?: string
          is_active?: boolean | null
          min_quantity?: number | null
          name: string
          percentage?: number | null
          service_id?: string | null
          updated_at?: string
        }
        Update: {
          buy_quantity?: number | null
          created_at?: string
          discount_type?: Database["public"]["Enums"]["discount_type_t"]
          fixed_amount_cents?: number | null
          free_quantity?: number | null
          id?: string
          is_active?: boolean | null
          min_quantity?: number | null
          name?: string
          percentage?: number | null
          service_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discounts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
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
      email_design_settings: {
        Row: {
          background_color: string
          body_font_size: number
          border_color: string
          button_bg_color: string
          button_border_radius: number
          button_padding_x: number
          button_padding_y: number
          button_text_color: string
          company_name: string
          container_bg_color: string
          container_border_radius: number
          container_max_width: number
          content_padding: number
          created_at: string
          font_family: string
          footer_text: string | null
          heading_font_size: number
          id: string
          line_height: number
          logo_url: string | null
          logo_width: number
          primary_color: string
          secondary_color: string
          show_social_links: boolean
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          text_color: string
          text_muted_color: string
          updated_at: string
          use_branding_logo: boolean | null
        }
        Insert: {
          background_color?: string
          body_font_size?: number
          border_color?: string
          button_bg_color?: string
          button_border_radius?: number
          button_padding_x?: number
          button_padding_y?: number
          button_text_color?: string
          company_name?: string
          container_bg_color?: string
          container_border_radius?: number
          container_max_width?: number
          content_padding?: number
          created_at?: string
          font_family?: string
          footer_text?: string | null
          heading_font_size?: number
          id?: string
          line_height?: number
          logo_url?: string | null
          logo_width?: number
          primary_color?: string
          secondary_color?: string
          show_social_links?: boolean
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          text_color?: string
          text_muted_color?: string
          updated_at?: string
          use_branding_logo?: boolean | null
        }
        Update: {
          background_color?: string
          body_font_size?: number
          border_color?: string
          button_bg_color?: string
          button_border_radius?: number
          button_padding_x?: number
          button_padding_y?: number
          button_text_color?: string
          company_name?: string
          container_bg_color?: string
          container_border_radius?: number
          container_max_width?: number
          content_padding?: number
          created_at?: string
          font_family?: string
          footer_text?: string | null
          heading_font_size?: number
          id?: string
          line_height?: number
          logo_url?: string | null
          logo_width?: number
          primary_color?: string
          secondary_color?: string
          show_social_links?: boolean
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          text_color?: string
          text_muted_color?: string
          updated_at?: string
          use_branding_logo?: boolean | null
        }
        Relationships: []
      }
      email_sections: {
        Row: {
          content_du: string | null
          content_sie: string | null
          created_at: string | null
          id: string
          is_preset: boolean | null
          name: string
          section_type: string
          settings: Json | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          content_du?: string | null
          content_sie?: string | null
          created_at?: string | null
          id?: string
          is_preset?: boolean | null
          name: string
          section_type: string
          settings?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          content_du?: string | null
          content_sie?: string | null
          created_at?: string | null
          id?: string
          is_preset?: boolean | null
          name?: string
          section_type?: string
          settings?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          available_placeholders: Json
          body_du: string
          body_sie: string
          category: string
          content_type: string | null
          created_at: string
          cta_text_du: string | null
          cta_text_sie: string | null
          cta_url_placeholder: string | null
          description: string | null
          from_email: string | null
          heading_du: string | null
          heading_sie: string | null
          html_content_du: string | null
          html_content_sie: string | null
          id: string
          is_active: boolean
          is_system_template: boolean
          name: string
          preheader_du: string | null
          preheader_sie: string | null
          sections: Json | null
          subject_du: string
          subject_sie: string
          template_key: string
          updated_at: string
        }
        Insert: {
          available_placeholders?: Json
          body_du: string
          body_sie: string
          category: string
          content_type?: string | null
          created_at?: string
          cta_text_du?: string | null
          cta_text_sie?: string | null
          cta_url_placeholder?: string | null
          description?: string | null
          from_email?: string | null
          heading_du?: string | null
          heading_sie?: string | null
          html_content_du?: string | null
          html_content_sie?: string | null
          id?: string
          is_active?: boolean
          is_system_template?: boolean
          name: string
          preheader_du?: string | null
          preheader_sie?: string | null
          sections?: Json | null
          subject_du: string
          subject_sie: string
          template_key: string
          updated_at?: string
        }
        Update: {
          available_placeholders?: Json
          body_du?: string
          body_sie?: string
          category?: string
          content_type?: string | null
          created_at?: string
          cta_text_du?: string | null
          cta_text_sie?: string | null
          cta_url_placeholder?: string | null
          description?: string | null
          from_email?: string | null
          heading_du?: string | null
          heading_sie?: string | null
          html_content_du?: string | null
          html_content_sie?: string | null
          id?: string
          is_active?: boolean
          is_system_template?: boolean
          name?: string
          preheader_du?: string | null
          preheader_sie?: string | null
          sections?: Json | null
          subject_du?: string
          subject_sie?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_verification_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      feature_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          priority: string
          status: string
          title: string
          updated_at: string
          user_email: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_email: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
          user_name?: string | null
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
      invoices: {
        Row: {
          amount_cents: number
          company_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          paid_at: string | null
          pdf_url: string | null
          status: string
          tax_amount_cents: number | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          amount_cents: number
          company_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_date: string
          invoice_number: string
          paid_at?: string | null
          pdf_url?: string | null
          status?: string
          tax_amount_cents?: number | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          amount_cents?: number
          company_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          paid_at?: string | null
          pdf_url?: string | null
          status?: string
          tax_amount_cents?: number | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_gallery_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "invoices_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
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
          email_verified: boolean | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_verified?: boolean | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_verified?: boolean | null
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
      room_types: {
        Row: {
          created_at: string
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_workflow_steps: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          node_id: string
          payload: Json | null
          processed_at: string | null
          scheduled_for: string
          status: string | null
          workflow_run_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          node_id: string
          payload?: Json | null
          processed_at?: string | null
          scheduled_for: string
          status?: string | null
          workflow_run_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          node_id?: string
          payload?: Json | null
          processed_at?: string | null
          scheduled_for?: string
          status?: string | null
          workflow_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_workflow_steps_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "workflow_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_workflow_steps_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_settings: {
        Row: {
          business_address_city: string | null
          business_address_country: string | null
          business_address_street: string | null
          business_address_zip: string | null
          business_description: string | null
          business_email: string | null
          business_geo_lat: number | null
          business_geo_lng: number | null
          business_name: string | null
          business_phone: string | null
          created_at: string
          cta_primary_text: string | null
          cta_secondary_text: string | null
          default_page_title: string | null
          facebook_pixel_id: string | null
          favicon_url: string | null
          footer_tagline: string | null
          google_analytics_id: string | null
          google_tag_manager_id: string | null
          hero_headline: string | null
          hero_image_url: string | null
          hero_subheadline: string | null
          id: string
          logo_dark_url: string | null
          logo_icon_url: string | null
          logo_url: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title_suffix: string | null
          og_image_url: string | null
          og_locale: string | null
          og_type: string | null
          page_title_admin_dashboard: string | null
          page_title_admin_galleries: string | null
          page_title_admin_settings: string | null
          page_title_dashboard: string | null
          page_title_gallery: string | null
          page_title_settings: string | null
          page_title_staging: string | null
          page_title_virtual_editing: string | null
          schema_org_type: string | null
          site_name: string
          support_email: string | null
          twitter_card_type: string | null
          twitter_handle: string | null
          updated_at: string
          watermark_url: string | null
        }
        Insert: {
          business_address_city?: string | null
          business_address_country?: string | null
          business_address_street?: string | null
          business_address_zip?: string | null
          business_description?: string | null
          business_email?: string | null
          business_geo_lat?: number | null
          business_geo_lng?: number | null
          business_name?: string | null
          business_phone?: string | null
          created_at?: string
          cta_primary_text?: string | null
          cta_secondary_text?: string | null
          default_page_title?: string | null
          facebook_pixel_id?: string | null
          favicon_url?: string | null
          footer_tagline?: string | null
          google_analytics_id?: string | null
          google_tag_manager_id?: string | null
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_subheadline?: string | null
          id?: string
          logo_dark_url?: string | null
          logo_icon_url?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title_suffix?: string | null
          og_image_url?: string | null
          og_locale?: string | null
          og_type?: string | null
          page_title_admin_dashboard?: string | null
          page_title_admin_galleries?: string | null
          page_title_admin_settings?: string | null
          page_title_dashboard?: string | null
          page_title_gallery?: string | null
          page_title_settings?: string | null
          page_title_staging?: string | null
          page_title_virtual_editing?: string | null
          schema_org_type?: string | null
          site_name?: string
          support_email?: string | null
          twitter_card_type?: string | null
          twitter_handle?: string | null
          updated_at?: string
          watermark_url?: string | null
        }
        Update: {
          business_address_city?: string | null
          business_address_country?: string | null
          business_address_street?: string | null
          business_address_zip?: string | null
          business_description?: string | null
          business_email?: string | null
          business_geo_lat?: number | null
          business_geo_lng?: number | null
          business_name?: string | null
          business_phone?: string | null
          created_at?: string
          cta_primary_text?: string | null
          cta_secondary_text?: string | null
          default_page_title?: string | null
          facebook_pixel_id?: string | null
          favicon_url?: string | null
          footer_tagline?: string | null
          google_analytics_id?: string | null
          google_tag_manager_id?: string | null
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_subheadline?: string | null
          id?: string
          logo_dark_url?: string | null
          logo_icon_url?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title_suffix?: string | null
          og_image_url?: string | null
          og_locale?: string | null
          og_type?: string | null
          page_title_admin_dashboard?: string | null
          page_title_admin_galleries?: string | null
          page_title_admin_settings?: string | null
          page_title_dashboard?: string | null
          page_title_gallery?: string | null
          page_title_settings?: string | null
          page_title_staging?: string | null
          page_title_virtual_editing?: string | null
          schema_org_type?: string | null
          site_name?: string
          support_email?: string | null
          twitter_card_type?: string | null
          twitter_handle?: string | null
          updated_at?: string
          watermark_url?: string | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          features: Json | null
          gradient_class: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price_cents: number
          price_type: Database["public"]["Enums"]["price_type_t"]
          requires_photo_selection: boolean | null
          show_in_booking: boolean | null
          show_in_finalize: boolean | null
          show_in_virtual_editing: boolean | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          features?: Json | null
          gradient_class?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price_cents?: number
          price_type?: Database["public"]["Enums"]["price_type_t"]
          requires_photo_selection?: boolean | null
          show_in_booking?: boolean | null
          show_in_finalize?: boolean | null
          show_in_virtual_editing?: boolean | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          features?: Json | null
          gradient_class?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_cents?: number
          price_type?: Database["public"]["Enums"]["price_type_t"]
          requires_photo_selection?: boolean | null
          show_in_booking?: boolean | null
          show_in_finalize?: boolean | null
          show_in_virtual_editing?: boolean | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
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
      staging_styles: {
        Row: {
          color_class: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          color_class?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          color_class?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
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
      team_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["company_role_t"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["company_role_t"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["company_role_t"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_gallery_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "v_user_activity"
            referencedColumns: ["user_id"]
          },
        ]
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
      user_events: {
        Row: {
          created_at: string
          event_category: string | null
          event_type: string
          gallery_id: string | null
          id: string
          metadata: Json | null
          photo_id: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_category?: string | null
          event_type: string
          gallery_id?: string | null
          id?: string
          metadata?: Json | null
          photo_id?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_category?: string | null
          event_type?: string
          gallery_id?: string | null
          id?: string
          metadata?: Json | null
          photo_id?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_events_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_events_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "v_gallery_selection_stats"
            referencedColumns: ["gallery_id"]
          },
          {
            foreignKeyName: "user_events_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
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
      workflow_actions: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          workflow_id: string | null
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          workflow_id?: string | null
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_actions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_edges: {
        Row: {
          created_at: string | null
          edge_label: string | null
          id: string
          sort_order: number | null
          source_node_id: string
          target_node_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          edge_label?: string | null
          id?: string
          sort_order?: number | null
          source_node_id: string
          target_node_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          edge_label?: string | null
          id?: string
          sort_order?: number | null
          source_node_id?: string
          target_node_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "workflow_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "workflow_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_edges_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_nodes: {
        Row: {
          action_type: string | null
          created_at: string | null
          id: string
          node_config: Json | null
          node_type: string
          position_x: number | null
          position_y: number | null
          workflow_id: string
        }
        Insert: {
          action_type?: string | null
          created_at?: string | null
          id?: string
          node_config?: Json | null
          node_type: string
          position_x?: number | null
          position_y?: number | null
          workflow_id: string
        }
        Update: {
          action_type?: string | null
          created_at?: string | null
          id?: string
          node_config?: Json | null
          node_type?: string
          position_x?: number | null
          position_y?: number | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_nodes_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          completed_at: string | null
          current_node_id: string | null
          error_message: string | null
          execution_path: Json | null
          id: string
          started_at: string | null
          status: string | null
          trigger_event: string
          trigger_payload: Json | null
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          current_node_id?: string | null
          error_message?: string | null
          execution_path?: Json | null
          id?: string
          started_at?: string | null
          status?: string | null
          trigger_event: string
          trigger_payload?: Json | null
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          current_node_id?: string | null
          error_message?: string | null
          execution_path?: Json | null
          id?: string
          started_at?: string | null
          status?: string | null
          trigger_event?: string
          trigger_payload?: Json | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_current_node_id_fkey"
            columns: ["current_node_id"]
            isOneToOne: false
            referencedRelation: "workflow_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          conditions: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_event: string
          updated_at?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: []
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
      can_view_company_invoices: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      generate_company_slug: { Args: { p_name: string }; Returns: string }
      generate_unique_slug: { Args: { p_name: string }; Returns: string }
      get_my_role: { Args: never; Returns: string }
      has_company_role: {
        Args: {
          _company_id: string
          _roles: Database["public"]["Enums"]["company_role_t"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["role_t"]; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      company_role_t: "owner" | "company_admin" | "employee"
      discount_type_t: "percentage" | "fixed" | "buy_x_get_y"
      gallery_status_t:
        | "Planning"
        | "Open"
        | "Closed"
        | "Processing"
        | "Delivered"
      price_type_t: "fixed" | "per_image" | "per_room"
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
      company_role_t: ["owner", "company_admin", "employee"],
      discount_type_t: ["percentage", "fixed", "buy_x_get_y"],
      gallery_status_t: [
        "Planning",
        "Open",
        "Closed",
        "Processing",
        "Delivered",
      ],
      price_type_t: ["fixed", "per_image", "per_room"],
      role_t: ["admin", "client"],
      salutation_t: ["Du", "Sie"],
    },
  },
} as const
