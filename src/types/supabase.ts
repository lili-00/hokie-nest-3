export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'tenant' | 'landlord'
          full_name: string
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: 'tenant' | 'landlord'
          full_name: string
          phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'tenant' | 'landlord'
          full_name?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string
          address: string
          price: number
          bedrooms: number
          bathrooms: number
          square_feet: number
          location: string
          landlord_id: string
          status: 'available' | 'rented' | 'maintenance'
          amenities: string[]
          highlights: string[]
          images: string[]
          is_furnished: boolean
          transportation: Json
          landlord_name: string
          landlord_email: string
          landlord_phone: string
          reviews_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          address: string
          price: number
          bedrooms: number
          bathrooms: number
          square_feet: number
          location: string
          landlord_id: string
          status?: 'available' | 'rented' | 'maintenance'
          amenities: string[]
          highlights: string[]
          images: string[]
          is_furnished: boolean
          transportation: Json
          landlord_name: string
          landlord_email: string
          landlord_phone: string
          reviews_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          address?: string
          price?: number
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          location?: string
          landlord_id?: string
          status?: 'available' | 'rented' | 'maintenance'
          amenities?: string[]
          highlights?: string[]
          images?: string[]
          is_furnished?: boolean
          transportation?: Json
          landlord_name?: string
          landlord_email?: string
          landlord_phone?: string
          reviews_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          property_id: string
          user_id: string
          rating: number
          comment: string
          created_at: string
          updated_at: string
          reviewer_name: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          rating: number
          comment: string
          created_at?: string
          updated_at?: string
          reviewer_name: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          rating?: number
          comment?: string
          created_at?: string
          updated_at?: string
          reviewer_name?: string
        }
      }
    }
  }
}