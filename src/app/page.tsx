"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowUpRight,
  Code2,
  Crown,
  Handshake,
  Images,
  Laugh,
  Lightbulb,
  Shirt,
  Sparkles,
  Users,
  Vote,
  type LucideIcon,
} from "lucide-react";

import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const CATEGORIES: { title: string; blurb: string; icon: LucideIcon }[] = [
  {
    title: "Most Likely to Succeed",
    blurb: "The one we'll all be saying 'I knew them back then' about.",
    icon: Crown,
  },
  {
    title: "Code Wizard",
    blurb: "Ships at 3 a.m., debugs by vibes, never pushes to main on Fridays.",
    icon: Code2,
  },
  {
    title: "Best Final-Year Project",
    blurb: "The build that made the panel sit up straight.",
    icon: Lightbulb,
  },
  {
    title: "Class Clown",
    blurb: "Lectures were longer before they showed up. Better, too.",
    icon: Laugh,
  },
  {
    title: "Best Dressed",
    blurb: "Fresh every single day, even on assignment deadlines.",
    icon: Shirt,
  },
  {
    title: "Most Helpful",
    blurb: "Shared the notes, explained the code, saved the group project.",
    icon: Handshake,
  },
  {
    title: "Finale Icon",
    blurb: "The face of BIS/BIT 2026. Period.",
    icon: Sparkles,
  },
];

const STEPS = [
  {
    n: "01",
    title: "Pick your winners",
    body: "Head to the voting page and choose one person per category. No overthinking, go with your gut.",
  },
  {
    n: "02",
    title: "Lock it in",
    body: "One class, one ballot each. Submit before voting closes and your picks are final.",
  },
  {
    n: "03",
    title: "Show up for the finale",
    body: "Winners are revealed on the night. Dress sharp, bring the energy, make it count.",
  },
];

const STATEMENT =
  "Four years of late nights, group projects, broken builds and brilliant ideas. One day to celebrate the people who made it unforgettable.";

/* -------------------------------------------------------------------------- */
/*  Aurora background                                                         */
/* -------------------------------------------------------------------------- */

function Aurora() {
  const { scrollYProgress } = useScroll();
  const hue = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const filter = useMotionTemplate`hue-rotate(${hue}deg) saturate(1.15)`;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05060a]"
    >
      <motion.div style={{ filter }} className="absolute inset-0">
        <motion.div
          className="absolute -left-1/4 -top-1/3 h-[75vh] w-[75vw] rounded-full bg-emerald-400/35 blur-[130px] mix-blend-screen"
          animate={{ x: [0, 160, -40, 0], y: [0, 80, -30, 0], scale: [1, 1.25, 0.9, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-1/4 top-0 h-[80vh] w-[65vw] rounded-full bg-violet-500/35 blur-[140px] mix-blend-screen"
          animate={{ x: [0, -140, 50, 0], y: [0, 120, 40, 0], scale: [1, 0.9, 1.2, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/4 top-1/3 h-[60vh] w-[60vw] rounded-full bg-cyan-400/25 blur-[130px] mix-blend-screen"
          animate={{ x: [0, 100, -120, 0], y: [0, -80, 60, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1/3 right-1/4 h-[60vh] w-[55vw] rounded-full bg-fuchsia-500/25 blur-[140px] mix-blend-screen"
          animate={{ x: [0, -90, 70, 0], y: [0, -60, 20, 0], scale: [1, 1.2, 1, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Sharp grid overlay, fades toward edges */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse at 50% 40%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 40%, black 20%, transparent 75%)",
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,6,10,0.85)_100%)]" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const blurPx = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const yearX = useTransform(scrollYProgress, [0, 1], [0, -320]);
  const yearOpacity = useTransform(scrollYProgress, [0, 0.9], [0.9, 0]);

  return (
    <section ref={ref} className="relative h-[140vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6">
        {/* Giant outlined year that slides sideways as you scroll.
            Mobile: vertical, centred, "20" on one line and "26" on the next.
            md+: upright, left-aligned, huge. */}
        <motion.span
          aria-hidden
          style={{ x: yearX, opacity: yearOpacity, WebkitTextStroke: "1px rgba(255,255,255,0.18)" }}
          className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 select-none flex-col items-center text-[25vh] font-black leading-none tracking-tighter text-transparent md:left-[6vw] md:translate-x-0 md:flex-row md:text-[34vw]"
        >
          <span className="[writing-mode:vertical-rl] md:[writing-mode:horizontal-tb]">20</span>
          <span className="[writing-mode:vertical-rl] md:[writing-mode:horizontal-tb]">26</span>
        </motion.span>

        <motion.div
          style={{ y, scale, opacity, filter }}
          className="relative z-10 flex max-w-5xl flex-col items-center text-center"
        >
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <Badge
              variant="outline"
              className="rounded-none border-white/20 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/80 backdrop-blur"
            >
              <span className="mr-2 inline-block size-1.5 animate-pulse bg-emerald-300" />
              BIS / BIT &middot; Class of 2026
            </Badge>
          </motion.div> */}

          <h1 className="mt-8 text-[clamp(4rem,13vw,10rem)] font-black uppercase leading-[0.85] tracking-tighter text-white md:text-[clamp(3rem,10vw,10rem)]">
            {["BIT/BIS","Finale", "Awards"].map((word, i) => (
              <span key={word} className="block overflow-hidden">
                <motion.span
                  className={
                    "block " +
                    (i === 1
                      ? "bg-gradient-to-r from-emerald-200 via-cyan-200 to-fuchsia-300 bg-clip-text text-transparent"
                      : "")
                  }
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    delay: 0.35 + i * 0.12,
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="mt-8 max-w-xl text-balance text-base text-white/60 md:text-lg"
          >
            The night the class crowns its own. Vote for the legends and relive the
            memories.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.7 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              size="lg"
              render={<Link href="/vote" />}
              className="group gap-2 rounded-none bg-white px-8 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-emerald-300"
            >
              <Vote className="size-4" />
              Vote now
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/gallery" />}
              className="gap-2 rounded-none border-white/25 bg-transparent px-8 font-mono text-xs uppercase tracking-[0.2em] text-white hover:bg-white/10 hover:text-white"
            >
              <Images className="size-4" />
              Gallery
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          style={{ opacity }}
          className="absolute bottom-8 right-6 flex flex-col items-end gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 md:right-10"
        >
          Scroll
          <span className="relative block h-10 w-px overflow-hidden bg-white/15">
            <motion.span
              className="absolute inset-x-0 top-0 h-4 bg-white"
              animate={{ y: [-16, 40] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Marquee                                                                   */
/* -------------------------------------------------------------------------- */

function Marquee() {
  const items = ["BIS", "BIT", "Class of 2026", "Finale Awards", "Vote", "Celebrate"];
  const row = [...items, ...items];
  return (
    <div className="relative -rotate-1 overflow-hidden border-y border-white/10 bg-black/40 py-4 backdrop-blur">
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {[...row, ...row].map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-10 text-2xl font-black uppercase tracking-tight text-white/80 md:text-4xl"
          >
            {t}
            <span className="size-2 rotate-45 bg-emerald-300" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Word-by-word scroll reveal                                                */
/* -------------------------------------------------------------------------- */

function RevealWord({
  children,
  range,
  progress,
}: {
  children: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [10, 0]);
  return (
    <motion.span style={{ opacity, y }} className="mr-[0.28em] inline-block">
      {children}
    </motion.span>
  );
}

function Statement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });
  const words = STATEMENT.split(" ");

  return (
    <section ref={ref} className="relative mx-auto max-w-6xl px-6 py-40 md:py-56">
      <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
        / The night
      </p>
      <p className="text-balance text-3xl font-bold leading-[1.15] tracking-tight text-white md:text-6xl">
        {words.map((w, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <RevealWord key={i} range={[start, end]} progress={scrollYProgress}>
              {w}
            </RevealWord>
          );
        })}
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Horizontal pinned categories                                              */
/* -------------------------------------------------------------------------- */

function Categories() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      setDistance(Math.max(0, trackRef.current.offsetWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 30 });
  const x = useTransform(smooth, [0, 1], [0, -distance]);
  const barScale = useTransform(smooth, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(CATEGORIES.length - 1, Math.floor(v * CATEGORIES.length)));
  });

  return (
    <section ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-7xl items-end justify-between px-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
              / Categories
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none tracking-tighter text-white md:text-7xl">
              Who takes it?
            </h2>
          </div>
          <p className="font-mono text-sm text-white/50">
            <span className="text-white">0{active + 1}</span> / 0{CATEGORIES.length}
          </p>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex w-max gap-5 pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pr-[10vw]"
        >
          {CATEGORIES.map(({ title, blurb, icon: Icon }, i) => (
            <article
              key={title}
              className="group relative flex h-[22rem] w-[78vw] shrink-0 flex-col justify-between overflow-hidden border border-white/10 bg-white/[0.03] p-7 backdrop-blur-md transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.07] sm:w-[26rem]"
            >
              <span
                aria-hidden
                className="absolute -right-4 -top-8 select-none text-[9rem] font-black leading-none text-white/[0.04] transition-colors group-hover:text-white/[0.08]"
              >
                0{i + 1}
              </span>
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center border border-white/15 bg-black/40 text-emerald-300 transition-colors group-hover:bg-emerald-300 group-hover:text-black">
                  <Icon className="size-5" />
                </span>
                <ArrowUpRight className="size-5 text-white/30 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase leading-[0.95] tracking-tight text-white">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{blurb}</p>
              </div>
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-emerald-300 to-fuchsia-400 transition-transform duration-500 group-hover:scale-x-100" />
            </article>
          ))}
        </motion.div>

        {/* Progress bar */}
        <div className="mx-auto mt-10 h-px w-full max-w-7xl bg-white/10 px-6">
          <motion.div
            style={{ scaleX: barScale }}
            className="h-px origin-left bg-gradient-to-r from-emerald-300 via-cyan-300 to-fuchsia-400"
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stacking steps                                                            */
/* -------------------------------------------------------------------------- */

function StepCard({
  step,
  i,
  progress,
}: {
  step: (typeof STEPS)[number];
  i: number;
  progress: MotionValue<number>;
}) {
  const target = 1 - (STEPS.length - 1 - i) * 0.06;
  const scale = useTransform(progress, [i / STEPS.length, 1], [1, target]);

  return (
    <div
      className="sticky flex items-center justify-center"
      style={{ top: `calc(18vh + ${i * 28}px)` }}
    >
      <motion.div
        style={{ scale }}
        className="relative grid w-full max-w-4xl origin-top gap-6 border border-white/15 bg-black/70 p-8 backdrop-blur-xl md:grid-cols-[auto_1fr] md:p-12"
      >
        <span className="text-7xl font-black leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.4)] md:text-9xl">
          {step.n}
        </span>
        <div className="self-center">
          <h3 className="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
            {step.title}
          </h3>
          <p className="mt-4 max-w-lg text-white/60 md:text-lg">{step.body}</p>
        </div>
        <span className="absolute left-0 top-0 h-px w-24 bg-emerald-300" />
        <span className="absolute left-0 top-0 h-24 w-px bg-emerald-300" />
      </motion.div>
    </div>
  );
}

function Steps() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} className="relative mx-auto max-w-6xl px-6 pb-[30vh] pt-24">
      <div className="mb-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
          / How it works
        </p>
        <h2 className="mt-3 text-4xl font-black uppercase leading-none tracking-tighter text-white md:text-7xl">
          Three moves.
        </h2>
      </div>
      <div className="flex flex-col gap-[40vh]">
        {STEPS.map((s, i) => (
          <StepCard key={s.n} step={s} i={i} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  CTA tiles                                                                 */
/* -------------------------------------------------------------------------- */

const TILES = [
  { label: "Vote", sub: "Pick your winners", href: "/vote", icon: Vote },
  { label: "Gallery", sub: "Four years in frames", href: "/gallery", icon: Images },
  { label: "Team", sub: "The crew behind it", href: "/team", icon: Users },
];

function Cta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const clip = useTransform(scrollYProgress, [0, 0.7], [18, 0]);
  const clipPath = useMotionTemplate`inset(${clip}% ${clip}% ${clip}% ${clip}%)`;

  return (
    <section ref={ref} className="relative px-4 pb-24 pt-10 md:px-6">
      <motion.div
        style={{ clipPath }}
        className="mx-auto max-w-6xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur-xl md:p-14"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
          / Your move
        </p>
        <h2 className="mt-3 max-w-3xl text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-8xl">
          Make it <span className="text-emerald-300">legendary.</span>
        </h2>

        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {TILES.map(({ label, sub, href, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={href}
                className="group relative flex h-48 flex-col justify-between overflow-hidden border border-white/15 bg-black/40 p-6 transition-colors duration-300 hover:bg-white hover:text-black"
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-6" />
                  <ArrowUpRight className="size-5 opacity-40 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100" />
                </div>
                <div>
                  <p className="text-4xl font-black uppercase tracking-tight">{label}</p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] opacity-60">
                    {sub}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40 md:flex-row">
        <span>Finale Awards &middot; BIS / BIT Class of 2026</span>
        <div className="flex gap-6">
          <Link href="/vote" className="transition-colors hover:text-white">Vote</Link>
          <Link href="/gallery" className="transition-colors hover:text-white">Gallery</Link>
          <Link href="/team" className="transition-colors hover:text-white">Team</Link>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-transparent text-white selection:bg-emerald-300 selection:text-black">
      <Aurora />
      <Nav />
      <Hero />
      <Marquee />
      <Statement />
      <Categories />
      <Steps />
      <Cta />
      <Footer />
    </main>
  );
}