import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Berapa lama waktu pengiriman pesanan?",
    answer:
      "Untuk wilayah dalam kota, pesanan akan sampai dalam 30-60 menit. Untuk pengiriman luar kota, estimasi 1-3 hari kerja tergantung lokasi Anda.",
  },
  {
    question: "Apakah obat resep bisa dibeli tanpa resep dokter?",
    answer:
      "Tidak, obat-obatan yang memerlukan resep dokter hanya bisa dibeli dengan mengunggah resep yang valid dari dokter. Ini sesuai dengan peraturan BPOM untuk keamanan Anda.",
  },
  {
    question: "Bagaimana cara mengembalikan produk?",
    answer:
      "Anda dapat mengajukan pengembalian dalam waktu 1 hari setelah penerimaan jika produk rusak atau tidak sesuai. Hubungi customer service kami untuk proses pengembalian.",
  },
  {
    question: "Apakah produk dijamin asli?",
    answer:
      "Ya, semua produk kami 100% asli dan bersertifikat BPOM. Kami bekerja sama langsung dengan distributor resmi dan apotek berlisensi.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menerima berbagai metode pembayaran termasuk Transfer Bank (BCA, Mandiri, BNI), E-wallet (GoPay, DANA, OVO), QRIS, dan COD (Cash on Delivery) untuk belanja di bawah 100rb.",
  },
  {
    question: "Apakah ada konsultasi dengan apoteker?",
    answer:
      "Ya, kami menyediakan layanan konsultasi gratis dengan apoteker profesional 24/7 melalui fitur chat di aplikasi. Anda bisa bertanya tentang obat, dosis, atau interaksi obat.",
  },
  {
    question: "Bagaimana cara melacak pesanan saya?",
    answer:
      'Setelah pesanan dikonfirmasi, Anda akan menerima link tracking via WhatsApp/email. Anda juga bisa memantau status pesanan secara real-time melalui halaman "Pesanan Saya".',
  },
  {
    question: "Apakah ada minimal pembelian untuk gratis ongkir?",
    answer:
      "Ya, gratis ongkir untuk pembelian minimal Rp100.000 dalam kota. Untuk luar kota, minimal pembelian Rp150.000 untuk mendapatkan subsidi ongkir.",
  },
];

export const FAQSection: React.FC = () => {
  const whatsappNumber = "6285215932326"; 
  const message = "Halo Admin MedicGo, saya masih punya pertanyaan lain yang tidak ada di FAQ.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Temukan jawaban untuk pertanyaan umum tentang layanan MedicGo
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary hover:no-underline py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Masih punya pertanyaan lain?
          </p>
          <a
            href={whatsappLink}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Hubungi Customer Service Kami
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};
