"use client";

import { useRef, useState, useTransition, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Loader2, Printer } from "lucide-react";
import Certificate from "@/components/certificate";
import { createCertificate } from "../actions";
import { dangerButtonClass } from "./ui";

const emptySubscribe = () => () => {};

const PRINT_STYLES = `
@page {
  size: A4 landscape;
  margin: 0;
}
.certificate-print-sheet {
  display: none;
}
@media print {
  body:has(.certificate-print-sheet[data-certificate-print="active"]) > *:not(.certificate-print-sheet) {
    display: none !important;
  }
  .certificate-print-sheet[data-certificate-print="active"] {
    display: block !important;
    position: absolute;
    inset: 0;
    margin: 0;
    background: white;
  }
  .certificate-print-sheet[data-certificate-print="active"] .certificate {
    width: 297mm;
    height: 210mm;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .certificate-print-sheet[data-certificate-print="active"] .certificate svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}
`;

type Issued = { code: string; verifyUrl: string; qrMarkup: string };

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function PrintWinnerButton({
  categoryTitle,
  categoryId,
  nomineeId,
  winnerName,
  votingOpen,
  isTie,
  disabled,
}: {
  categoryTitle: string;
  categoryId: string;
  nomineeId: string;
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
  const [issued, setIssued] = useState<Issued | null>(null);
  const [overlay, setOverlay] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
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
    if (!canPrint || pending) return;

    setOverlay("Creating certificate id");

    startTransition(async () => {
      let result: Issued;
      try {
        result = await createCertificate({ nomineeId, categoryId, nomineeName: winnerName, categoryTitle });
      } catch {
        setOverlay(null);
        return;
      }

      setIssued(result);
      setOverlay("Printing document");

      // Let the certificate (with its QR) commit before the print snapshot.
      await nextFrame();
      setPrinting(true);
      await nextFrame();

      const finish = () => {
        setPrinting(false);
        setOverlay(null);
        window.removeEventListener("afterprint", finish);
      };
      window.addEventListener("afterprint", finish);

      window.print();
      // Safety net for browsers that never fire afterprint (e.g. some Safari).
      setTimeout(finish, 1500);
    });
  };

  return (
    <>
      <style>{PRINT_STYLES}</style>

      <button
        type="button"
        onClick={handlePrint}
        disabled={!canPrint || pending}
        title={label}
        aria-label={label}
        className={`${dangerButtonClass} shrink-0 disabled:cursor-not-allowed disabled:border-admin-border disabled:text-admin-muted disabled:hover:bg-transparent`}
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Printer className="size-3.5" />}
        Print winner
      </button>

      {overlay &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 border border-white/15 bg-black/80 px-10 py-8 text-center">
              <Loader2 className="size-8 animate-spin text-emerald-300" />
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-white">
                {overlay}
              </p>
            </div>
          </div>,
          document.body
        )}

      {mounted &&
        canPrint &&
        issued &&
        createPortal(
          <div
            ref={sheetRef}
            key={pathname}
            data-certificate-print={printing ? "active" : undefined}
            className="certificate-print-sheet"
            aria-hidden
          >
            <Certificate
              recipient={winnerName || "Full.Name"}
              category={categoryTitle}
              verifyCode={issued.code}
              qrMarkup={issued.qrMarkup}
            />
          </div>,
          document.body
        )}
    </>
  );
}
