"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { Images, LogOut, Menu, Trophy, Users, Vote, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient, useSession } from "@/lib/auth-client";

const LINKS = [
  { label: "Vote", href: "/vote", icon: Vote },
  { label: "Gallery", href: "/gallery", icon: Images },
  { label: "Team", href: "/team", icon: Users },
];

export default function Nav() {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { data: session, isPending } = useSession();

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 24);
    setHidden(latest > prev && latest > 240);
  });

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -96 : 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={[
          "relative flex w-full max-w-4xl items-center justify-between overflow-hidden",
          "border px-3 py-2 backdrop-blur-xl transition-colors duration-300",
          scrolled
            ? "border-white/15 bg-black/60"
            : "border-white/10 bg-white/[0.03]",
        ].join(" ")}
      >
        <Link href="/" className="group flex items-center gap-2 pl-1">
          <span className="grid size-8 place-items-center border border-white/20 bg-white/5 transition-colors group-hover:bg-white group-hover:text-black">
            <Trophy className="size-4" />
          </span>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-white">
            Finale<span className="text-emerald-300">/26</span>
          </span>
        </Link>

        <ul
          className="hidden items-center gap-1 md:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {LINKS.map(({ label, href }) => (
            <li key={label} className="relative">
              <Link
                href={href}
                onMouseEnter={() => setHovered(label)}
                className="relative z-10 block px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white"
              >
                {label}
              </Link>
              {hovered === label && (
                <motion.span
                  layoutId="nav-hover"
                  className="absolute inset-0 z-0 border border-white/15 bg-white/10"
                  transition={{ type: "spring", stiffness: 500, damping: 36 }}
                />
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {!isPending && session?.user ? (
            <>
              <Link
                href="/vote"
                className="hidden rounded-none bg-white px-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-emerald-300 md:inline-flex"
              >
                Cast your vote 
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hidden gap-1.5 rounded-none text-white/70 hover:bg-white hover:text-black md:inline-flex"
              >
                <LogOut className="size-3.5" />
                <span className="font-mono text-xs uppercase tracking-[0.2em]">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/vote"
                className="hidden rounded-none bg-white px-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-emerald-300 md:inline-flex"
              >
                Cast your vote
              </Link>
            </>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="rounded-none text-white hover:bg-white/10 hover:text-white md:hidden"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] max-w-sm border-white/10 bg-black/90 text-white backdrop-blur-xl">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="mt-10 flex flex-col gap-2 px-2">
                {LINKS.map(({ label, href, icon: Icon }, i) => (
                  <SheetClose
                    key={label}
                    render={
                      <Link
                        href={href}
                        className="group flex items-center justify-between border border-white/10 px-4 py-5 transition-colors hover:bg-white hover:text-black"
                      />
                    }
                  >
                    <span className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight">
                      <Icon className="size-5" />
                      {label}
                    </span>
                    <span className="font-mono text-xs opacity-50">
                      0{i + 1}
                    </span>
                  </SheetClose>
                ))}

                {!isPending && session?.user ? (
                  <>
                    <div className="border-t border-white/10 my-2 pt-2" />
                    <SheetClose
                      render={
                        <button
                          onClick={handleSignOut}
                          className="group w-full flex items-center justify-between border border-white/10 px-4 py-5 transition-colors hover:bg-white hover:text-black"
                        />
                      }
                    >
                      <span className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                        <LogOut className="size-5" />
                        Logout
                      </span>
                    </SheetClose>
                  </>
                ) : (
                  <SheetClose
                    render={
                      <Link
                        href="/signin"
                        className="group flex items-center justify-between border border-white/10 px-4 py-5 transition-colors hover:bg-white hover:text-black"
                      />
                    }
                  >
                    <span className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                      <User className="size-5" />
                      Sign In
                    </span>
                    <span className="font-mono text-xs opacity-50">
                      04
                    </span>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <motion.span
          style={{ scaleX: progress }}
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-emerald-300 via-cyan-300 to-fuchsia-400"
        />
      </nav>
    </motion.header>
  );
}