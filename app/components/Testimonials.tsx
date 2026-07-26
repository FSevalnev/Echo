"use client";

// Real testimonials wall — signed-in users leave a rating + short text,
// stored in Supabase (`reviews` table), and it's shown here at the very
// end of the landing page as an infinite two-row marquee (top row left,
// bottom row right). Replaces the earlier hardcoded placeholder copy.
//
// The scroll animation is pure CSS (two @keyframes + two classes below),
// not JS/state — that's what keeps it GPU-accelerated and buttery at
// 60fps, and lets "pause on hover, resume smoothly" fall out for free
// from the browser's native animation-play-state behavior (a paused CSS
// animation resumes from exactly where it left off, no jump).

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth, isSupabaseConfigured } from "../auth/AuthContext";
import { createClient } from "../../lib/supabase/client";
import { useLanguage } from "../i18n/LanguageContext";
import type { Review } from "../../lib/reviews";
import Reveal from "./Reveal";

const STAR_VALUES = [1, 2, 3, 4, 5];

function splitRows(reviews: Review[]): [Review[], Review[]] {
  const row1: Review[] = [];
  const row2: Review[] = [];
  reviews.forEach((r, i) => (i % 2 === 0 ? row1 : row2).push(r));
  return [row1, row2];
}

function Card({ display_name, rating, body }: Review) {
  return (
    <div className="w-[260px] shrink-0 rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_0_40px_-14px_rgba(99,102,241,0.4)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-white/25 hover:shadow-[0_0_60px_-10px_rgba(129,140,248,0.6)] sm:w-[290px] md:w-[310px]">
      <p className="font-semibold text-white">{display_name}</p>
      <p className="mt-1 text-sm tracking-wide text-yellow-400" aria-label={`${rating} out of 5 stars`}>
        {"⭐".repeat(Math.max(1, Math.min(5, rating)))}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-gray-300">&ldquo;{body}&rdquo;</p>
    </div>
  );
}

// The seamless-loop marquee works by rendering each row's cards twice back
// to back ([...items, ...items]) so the CSS animation can scroll from 0% to
// -50% and loop invisibly. That trick only reads as "infinite" once there
// are enough distinct cards in the row — with just 1-2 reviews, doubling
// makes the exact same card(s) appear twice, side by side, which looks like
// a duplicate-data bug rather than an intentional loop. Below this
// threshold, fall back to a plain static (non-looping, non-duplicated) row.
const MIN_MARQUEE_ITEMS = 4;

function Row({ items, direction }: { items: Review[]; direction: "left" | "right" }) {
  if (items.length === 0) return null;

  if (items.length < MIN_MARQUEE_ITEMS) {
    return (
      <div className="flex flex-wrap justify-center gap-6 px-6">
        {items.map((item) => (
          <Card key={item.id} {...item} />
        ))}
      </div>
    );
  }

  const animationClass = direction === "left" ? "marquee-left" : "marquee-right";
  return (
    <div className="overflow-hidden">
      <div className={`${animationClass} flex w-max gap-6 will-change-transform`}>
        {[...items, ...items].map((item, i) => (
          <Card key={`${direction}-${item.id}-${i}`} {...item} />
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const myReview = reviews.find((r) => r.user_id === user?.id) ?? null;

  async function loadReviews() {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(80);
    setReviews((data as Review[]) ?? []);
    setLoadingReviews(false);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoadingReviews(false);
      return;
    }
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-fill the form with the user's existing review, if they have one,
  // so re-opening the form to edit doesn't start from a blank slate.
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setBody(myReview.body);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myReview?.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!body.trim()) {
      setFormError(t.reviews.textError);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setPosted(false);

    const supabase = createClient();
    const displayName =
      (user.user_metadata?.full_name as string | undefined)?.trim() || user.email || "Echo user";

    const { error } = await supabase.from("reviews").upsert(
      {
        user_id: user.id,
        display_name: displayName,
        rating,
        body: body.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      setFormError(t.reviews.genericError);
      setSubmitting(false);
      return;
    }

    setPosted(true);
    setSubmitting(false);
    await loadReviews();
  }

  if (!isSupabaseConfigured) return null;

  const [row1, row2] = splitRows(reviews);
  const displayRating = hoverRating || rating;

  return (
    <section id="reviews" className="relative overflow-hidden bg-gradient-to-b from-gray-950 to-black py-20 scroll-mt-24">
      <div className="mx-auto mb-14 max-w-lg px-6">
        <Reveal>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition-shadow duration-500 hover:shadow-[0_0_50px_-12px_rgba(99,102,241,0.35)]">
          <h3 className="text-lg font-semibold text-white">{t.reviews.leaveReviewTitle}</h3>

          {!authLoading && !user && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">{t.reviews.signInPrompt}</p>
              <Link
                href="/login"
                className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition duration-300 ease-out hover:scale-105"
              >
                {t.auth.signInTitle}
              </Link>
            </div>
          )}

          {user && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-gray-400">{t.reviews.ratingLabel}</label>
                <div className="mt-1 flex gap-1 text-2xl">
                  {STAR_VALUES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      className="leading-none"
                    >
                      <span className={displayRating >= n ? "text-yellow-400" : "text-gray-600"}>★</span>
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setFormError(null);
                  setPosted(false);
                }}
                placeholder={t.reviews.textPlaceholder}
                rows={3}
                maxLength={500}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {formError && <p className="text-sm text-red-400">{formError}</p>}
              {posted && <p className="text-sm text-green-400">{t.reviews.posted}</p>}
              {myReview && !posted && !formError && (
                <p className="text-xs text-gray-500">{t.reviews.editHint}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition duration-300 ease-out hover:scale-105 disabled:opacity-50"
              >
                {submitting ? t.reviews.submitting : t.reviews.submit}
              </button>
            </form>
          )}
        </div>
        </Reveal>
      </div>

      {!loadingReviews && reviews.length === 0 && (
        <p className="text-center text-sm text-gray-500">{t.reviews.empty}</p>
      )}

      {reviews.length > 0 && (
        <div className="space-y-6">
          <Row items={row1} direction="left" />
          <Row items={row2} direction="right" />
        </div>
      )}

      <style jsx global>{`
        @keyframes marquee-left {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-right {
          from { transform: translate3d(-50%, 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }
        .marquee-left {
          animation: marquee-left 75s linear infinite;
        }
        .marquee-right {
          animation: marquee-right 90s linear infinite;
        }
        .marquee-left:hover,
        .marquee-right:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-left,
          .marquee-right {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
