// Shared type for the public testimonials/reviews feature — real users
// leave a rating + short text, shown on the landing page marquee.

export type Review = {
  id: string;
  user_id: string;
  display_name: string;
  rating: number; // 1-5
  body: string;
  created_at: string;
  updated_at: string;
};
