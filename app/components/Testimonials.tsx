// Testimonials wall — a self-contained social-proof section for the very
// end of the landing page (right before the footer). Deliberately has no
// title/subtitle/avatars/badges per spec: just an infinite two-row
// marquee of name + 5-star rating + short quote cards.
//
// The scroll animation is pure CSS (two @keyframes + two classes below),
// not JS/state — that's what keeps it GPU-accelerated and buttery at 60fps,
// and lets "pause on hover, resume smoothly" fall out for free from the
// browser's native animation-play-state behavior (a paused CSS animation
// resumes from exactly where it left off, no jump).

type Testimonial = {
  name: string;
  text: string;
};

const ROW_1: Testimonial[] = [
  { name: "Emily Carter", text: "Echo completely changed the way I study. Instead of memorizing information, I finally understand it." },
  { name: "Sophia Bennett", text: "I used to cram before every exam. Now I explain concepts out loud and actually retain them." },
  { name: "Olivia Nguyen", text: "My exam prep used to be pure panic. With Echo I walk in knowing exactly what I actually understand." },
  { name: "Grace Kim", text: "Studying finally feels less like memorizing and more like actually learning something." },
  { name: "Ava Mitchell", text: "The personalized feedback feels like it was written for me specifically, not some generic template." },
  { name: "Isabella Reed", text: "Echo found gaps in my calculus understanding that three tutors missed." },
  { name: "Chloe Whitfield", text: "It's oddly satisfying watching my understanding score climb every week." },
  { name: "Mia Alvarez", text: "I finally stopped confusing 'I recognize this' with 'I understand this.'" },
  { name: "Harper Sinclair", text: "I feel so much more confident walking into exams now that I actually know where I stand." },
  { name: "Amelia Doyle", text: "Echo doesn't just check if my answer sounds right — it catches when my reasoning is shaky underneath." },
  { name: "Zoe Callahan", text: "Studying with Echo is genuinely the first time revision hasn't felt like a chore." },
  { name: "Natalie Osei", text: "I explained mitochondria to my little brother the same way I explain it to Echo now. Both understood me." },
  { name: "Ella Marchetti", text: "Echo caught that I was memorizing formulas without understanding what they actually meant. Huge wake-up call." },
  { name: "Sarah Lindqvist", text: "Every explanation gets specific feedback — no generic 'good job' filler." },
  { name: "Ruby Anderson", text: "Uploading a photo of my messy notes and getting instant feedback on them saved me so much time." },
  { name: "Vivian Choi", text: "The recommendations after each attempt actually target my specific weak spots, not generic study tips." },
  { name: "Hannah Whitaker", text: "I used to just hope I understood the material. Now I actually know." },
  { name: "Aria Fontaine", text: "Ten minutes explaining a topic out loud teaches me more than an hour of rereading ever did." },
];

const ROW_2: Testimonial[] = [
  { name: "Daniel Reyes", text: "The AI feedback is scary accurate. It pointed out a gap in my understanding I didn't even know I had." },
  { name: "Marcus Turner", text: "Explaining a topic out loud forces you to notice exactly where your logic breaks down. Echo catches every one of those moments." },
  { name: "Ethan Walsh", text: "I've tried a dozen study apps. This is the first one that tells me what I got wrong and why, not just a score." },
  { name: "Liam Foster", text: "I explain a topic, Echo tells me the exact concept I skipped. It's like having a tutor who never gets tired." },
  { name: "Noah Bianchi", text: "I learned more explaining photosynthesis out loud for five minutes than an hour of rereading my notes." },
  { name: "Jacob Sorensen", text: "I'm not a confident public speaker, but explaining to Echo made me way more comfortable talking through ideas." },
  { name: "Ryan Delgado", text: "Ten minutes with Echo before a test beats an hour of passive rereading." },
  { name: "Benjamin Cross", text: "The follow-up questions are the best part — they push you to fill the gap yourself instead of handing you the answer." },
  { name: "Lucas Hartman", text: "Explaining things out loud used to feel pointless. Now it's basically my main study method." },
  { name: "Tyler Brooks", text: "I used to over-study everything equally. Now I know exactly which topics actually need more work." },
  { name: "Nathan Pierce", text: "The gap between 'I read the chapter' and 'I understand the chapter' used to be invisible to me. Not anymore." },
  { name: "Caleb Whitmore", text: "It's like the Feynman technique but with an AI checking your reasoning in real time." },
  { name: "Owen Fitzgerald", text: "Voice mode is perfect for me — I talk through the topic on my walk to class and get feedback minutes later." },
  { name: "Dominic Reeves", text: "I stopped dreading exam week once I started using Echo two weeks out instead of two days out." },
  { name: "Adrian Voss", text: "I learn faster now because I know immediately what to fix instead of waiting for a graded test to find out." },
  { name: "Elijah Marsh", text: "Echo made me realize half of what I thought I 'knew' was actually just familiar-sounding vocabulary." },
  { name: "Julian Ferreira", text: "Explaining a concept badly the first time, then well the second time — that's when it actually clicks." },
  { name: "Connor Blackwood", text: "Best study habit I've picked up in years, and it barely takes ten minutes a day." },
];

function Card({ name, text }: Testimonial) {
  return (
    <div
      className="w-[260px] shrink-0 rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_0_40px_-14px_rgba(99,102,241,0.4)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-white/25 hover:shadow-[0_0_60px_-10px_rgba(129,140,248,0.6)] sm:w-[290px] md:w-[310px]"
    >
      <p className="font-semibold text-white">{name}</p>
      <p className="mt-1 text-sm tracking-wide text-yellow-400" aria-label="5 out of 5 stars">
        ⭐⭐⭐⭐⭐
      </p>
      <p className="mt-3 text-sm leading-relaxed text-gray-300">&ldquo;{text}&rdquo;</p>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 to-black py-20">
      <div className="space-y-6">
        <div className="overflow-hidden">
          <div className="marquee-left flex w-max gap-6 will-change-transform">
            {[...ROW_1, ...ROW_1].map((item, i) => (
              <Card key={`r1-${i}`} {...item} />
            ))}
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="marquee-right flex w-max gap-6 will-change-transform">
            {[...ROW_2, ...ROW_2].map((item, i) => (
              <Card key={`r2-${i}`} {...item} />
            ))}
          </div>
        </div>
      </div>

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
