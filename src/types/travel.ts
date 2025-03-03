export interface TravelPreferences {
  id?: string;
  user_id?: string;
  
  // Travel Goals & Interests
  trip_purpose: string;
  activities: string[];
  
  // Timing & Duration
  travel_dates: {
    start?: string;
    end?: string;
    is_flexible: boolean;
  };
  trip_length: string;
  
  // Destinations & Geography
  preferred_regions: string[];
  environment_preference: string;
  
  // Budget & Accommodation
  total_budget: number;
  accommodation_type: string;
  accommodation_budget: number;
  
  // Food & Dining
  cuisine_preferences: string[];
  dining_budget: string;
  
  // Travel Companions
  travel_companions: string;
  special_considerations?: string;
  
  // Adventure & Special Interests
  adventure_level: string;
  bucket_list_items: string[];
  
  // Travel Style & Logistics
  travel_pace: string;
  transportation_preference: string;
  travel_experience_level: string;
  
  // Safety & Comfort
  comfort_level: string;
  health_safety_concerns?: string;
  
  // Personal Touches
  previous_experiences?: string;
  
  created_at?: string;
}