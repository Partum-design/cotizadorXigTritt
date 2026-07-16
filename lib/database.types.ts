export type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected";

export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  kind: "mezcladora" | "trituradora" | "otro";
  description: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  slug: string;
  name: string;
  model_code: string | null;
  short_description: string | null;
  description: string | null;
  specs: string | null;
  icon: string;
  capacity_min: number;
  capacity_max: number;
  capacity_unit: string;
  capacity_step: number;
  material_options: string[];
  power_options: string[];
  allows_engraving: boolean;
  base_cost: number;
  base_price: number;
  price_per_capacity_unit: number;
  engraving_price: number;
  active: boolean;
  sort_order: number;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  company: string | null;
  email: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  lead_id: string;
  public_token: string;
  status: QuoteStatus;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  valid_hours: number;
  sent_at: string | null;
  valid_until: string | null;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  view_count: number;
  opened_at: string | null;
  open_count: number;
  accepted_at: string | null;
  rejected_at: string | null;
  reject_reason: string | null;
  invoiced: boolean;
  invoiced_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string | null;
  product_name: string;
  product_model: string | null;
  category_name: string | null;
  capacity_value: number | null;
  capacity_unit: string | null;
  material: string | null;
  power: string | null;
  engraving: boolean;
  engraving_text: string | null;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  subtotal: number;
  created_at: string;
}

export interface QuoteEvent {
  id: string;
  quote_id: string;
  event_type:
    | "created"
    | "sent"
    | "email_opened"
    | "link_clicked"
    | "viewed"
    | "accepted"
    | "rejected"
    | "invoiced"
    | "resent"
    | "note";
  metadata: Record<string, unknown>;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin";
  created_at: string;
}

export type LeadTemperature = "nuevo" | "tibio" | "caliente" | "frio";

export interface LeadOverview extends Lead {
  quote_id: string | null;
  quote_number: string | null;
  quote_status: QuoteStatus | null;
  total: number | null;
  currency: string | null;
  valid_until: string | null;
  sent_at: string | null;
  last_viewed_at: string | null;
  view_count: number | null;
  accepted_at: string | null;
  invoiced: boolean | null;
  temperature: LeadTemperature;
  quote_expired: boolean;
}

// Minimal Database shape sufficient for the typed Supabase client used in this project.
export interface Database {
  public: {
    Tables: {
      product_categories: { Row: ProductCategory; Insert: Partial<ProductCategory>; Update: Partial<ProductCategory> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      leads: { Row: Lead; Insert: Partial<Lead>; Update: Partial<Lead> };
      quotes: { Row: Quote; Insert: Partial<Quote>; Update: Partial<Quote> };
      quote_items: { Row: QuoteItem; Insert: Partial<QuoteItem>; Update: Partial<QuoteItem> };
      quote_events: { Row: QuoteEvent; Insert: Partial<QuoteEvent>; Update: Partial<QuoteEvent> };
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
    };
    Views: {
      leads_overview: { Row: LeadOverview };
    };
    Functions: {
      submit_quote: {
        Args: { p_lead: Record<string, unknown>; p_items: Record<string, unknown>[] };
        Returns: { quote_id: string; token: string; quote_number: string; total: number };
      };
      mark_quote_sent: { Args: { p_token: string }; Returns: void };
      get_quote_public: { Args: { p_token: string }; Returns: Record<string, unknown> | null };
      track_open: { Args: { p_token: string; p_ip?: string | null; p_ua?: string | null }; Returns: void };
      track_view: { Args: { p_token: string; p_ip?: string | null; p_ua?: string | null }; Returns: void };
      track_click: { Args: { p_token: string; p_ip?: string | null; p_ua?: string | null }; Returns: void };
      accept_quote: { Args: { p_token: string }; Returns: { ok: boolean; reason?: string } };
      reject_quote: { Args: { p_token: string; p_reason?: string | null }; Returns: { ok: boolean; reason?: string } };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
}
