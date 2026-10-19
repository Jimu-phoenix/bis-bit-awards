import type { Metadata } from "next";
import Certificate from "@/components/certificate";

export const metadata: Metadata = {
  title: "Certificate of Excellence — Finale Awards",
  description: "BIT / BIS Certificate of Excellence.",
};

export default function CertificatePage() {
  return <Certificate />;
}
