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
      bookmarks: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      emotion_tags: {
        Row: {
          created_at: string | null
          id: string
          is_predefined: boolean | null
          name: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_predefined?: boolean | null
          name: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_predefined?: boolean | null
          name?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      log_emotions: {
        Row: {
          created_at: string | null
          emotion_tag_id: string
          id: string
          log_id: string
        }
        Insert: {
          created_at?: string | null
          emotion_tag_id: string
          id?: string
          log_id: string
        }
        Update: {
          created_at?: string | null
          emotion_tag_id?: string
          id?: string
          log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "log_emotions_emotion_tag_id_fkey"
            columns: ["emotion_tag_id"]
            isOneToOne: false
            referencedRelation: "emotion_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_emotions_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "reading_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      music_tracks: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          error_message: string | null
          file_size: number | null
          file_url: string
          genre: string | null
          id: string
          mood: string | null
          mureka_task_id: string | null
          prompt: string
          status: string | null
          tempo: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          error_message?: string | null
          file_size?: number | null
          file_url: string
          genre?: string | null
          id?: string
          mood?: string | null
          mureka_task_id?: string | null
          prompt: string
          status?: string | null
          tempo?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          error_message?: string | null
          file_size?: number | null
          file_url?: string
          genre?: string | null
          id?: string
          mood?: string | null
          mureka_task_id?: string | null
          prompt?: string
          status?: string | null
          tempo?: number | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          album_cover_thumbnail_url: string | null
          album_cover_url: string | null
          bookmarks_count: number | null
          comments_count: number | null
          created_at: string | null
          id: string
          is_published: boolean | null
          journey_id: string
          likes_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          album_cover_thumbnail_url?: string | null
          album_cover_url?: string | null
          bookmarks_count?: number | null
          comments_count?: number | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          journey_id: string
          likes_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          album_cover_thumbnail_url?: string | null
          album_cover_url?: string | null
          bookmarks_count?: number | null
          comments_count?: number | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          journey_id?: string
          likes_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "reading_journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_journeys: {
        Row: {
          book_author: string | null
          book_category: string | null
          book_cover_url: string | null
          book_description: string | null
          book_isbn: string | null
          book_published_date: string | null
          book_publisher: string | null
          book_title: string
          completed_at: string | null
          created_at: string | null
          id: string
          one_liner: string | null
          rating: number | null
          review: string | null
          review_is_public: boolean | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_author?: string | null
          book_category?: string | null
          book_cover_url?: string | null
          book_description?: string | null
          book_isbn?: string | null
          book_published_date?: string | null
          book_publisher?: string | null
          book_title: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          one_liner?: string | null
          rating?: number | null
          review?: string | null
          review_is_public?: boolean | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_author?: string | null
          book_category?: string | null
          book_cover_url?: string | null
          book_description?: string | null
          book_isbn?: string | null
          book_published_date?: string | null
          book_publisher?: string | null
          book_title?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          one_liner?: string | null
          rating?: number | null
          review?: string | null
          review_is_public?: boolean | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_journeys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_logs: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          journey_id: string
          log_type: string
          memo: string | null
          music_prompt: string | null
          music_track_id: string | null
          quote: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          journey_id: string
          log_type: string
          memo?: string | null
          music_prompt?: string | null
          music_track_id?: string | null
          quote?: string | null
          version: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          journey_id?: string
          log_type?: string
          memo?: string | null
          music_prompt?: string | null
          music_track_id?: string | null
          quote?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "reading_logs_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "reading_journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_logs_music_track_id_fkey"
            columns: ["music_track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_provider: string
          created_at: string | null
          email: string
          id: string
          nickname: string
          updated_at: string | null
        }
        Insert: {
          auth_provider: string
          created_at?: string | null
          email: string
          id: string
          nickname: string
          updated_at?: string | null
        }
        Update: {
          auth_provider?: string
          created_at?: string | null
          email?: string
          id?: string
          nickname?: string
          updated_at?: string | null
        }
        Relationships: []
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
