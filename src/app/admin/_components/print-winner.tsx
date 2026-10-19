"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Printer } from "lucide-react";
import Certificate from "@/components/certificate";
import { dangerButtonClass } from "./ui";

const emptySubscribe = () => () => {};

export function PrintWinnerButton({
  categoryTitle,
  winnerName,
  votingOpen,
  isTie,
  disabled,
}: {
  categoryTitle: string;
  winnerName: string;
  votingOpen: boolean;
  isTie: boolean;
  disabled: boolean;
}) {
  // createPortal needs the DOM; useSyncExternalStore renders `false` on the
  // server and `true` on the client after hydration without an effect.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [printing, setPrinting] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const canPrint = !votingOpen && !disabled;

  const label = !votingOpen
    ? "Voting is still open"
    : disabled
      ? "No votes recorded yet"
      : isTie
        ? `Tie — printing ${winnerName} (first of the leaders)`
        : `Print certificate for ${winnerName}`;

  const handlePrint = () => {
    if (!canPrint) return;

    const sheet = sheetRef.current;
    if (!sheet) return;

    // Toggle the print flag synchronously and wait a frame so the attribute is
    // committed to the DOM before the print dialog snapshots the page.
    setPrinting(true);

    const finish = () => {
      setPrinting(false);
      window.removeEventListener("afterprint", finish);
    };
    window.addEventListener("afterprint", finish);

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        window.print();
        // Safety net for browsers that never fire afterprint (e.g. some Safari).
        setTimeout(finish, 1500);
      });
    });

    void raf1;
    void raf2;
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePrint}
        disabled={!canPrint}
        title={label}
        aria-label={label}
        className={`${dangerButtonClass} shrink-0 disabled:cursor-not-allowed disabled:border-admin-border disabled:text-admin-muted disabled:hover:bg-transparent`}
      >
        <Printer className="size-3.5" />
        Print winner
      </button>

      {mounted &&
        canPrint &&
        createPortal(
          <div
            ref={sheetRef}
            key={pathname}
            data-certificate-print={printing ? "active" : undefined}
            className="certificate-print-sheet"
            aria-hidden
          >
            <Certificate recipient={winnerName || "{winner.name}"} category={categoryTitle} />
          </div>,
          document.body
        )}
    </>
  );
}
