import { motion } from 'motion/react';
import { Instagram, Mail, MapPin, Phone, Clock } from 'lucide-react';
import { Seo, BUSINESS } from '../lib/seo';
import logo from '../../assets/logo.png';

// TikTok SVG icon — not available in lucide-react (matches Footer.tsx)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const WHATSAPP_URL = `https://wa.me/${BUSINESS.telephone.replace('+', '')}?text=${encodeURIComponent(
  "Hello Premier Beauty Clinic! I'd like to know more about your products and services."
)}`;

const SPRING = { type: 'spring' as const, stiffness: 100, damping: 20 };

const container = {
  initial: {},
  animate: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: SPRING },
};

export function ComingSoon() {
  return (
    <div className="relative min-h-[100dvh] bg-[#000000] text-white overflow-hidden flex flex-col">
      <Seo
        title="Opening Soon"
        description="Premier Beauty Clinic's online store is being put in its final touches. Visit us in Kilimani, Nairobi, or reach us on WhatsApp — we're open for business."
        path="/"
      />

      {/* Ambient glow accents */}
      <div className="pointer-events-none absolute -top-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-[#6D4C91]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-24 w-[30rem] h-[30rem] rounded-full bg-[#8B5CF6]/20 blur-[130px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <motion.div
        variants={container}
        initial="initial"
        animate="animate"
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20 text-center"
      >
        <motion.img
          variants={item}
          src={logo}
          alt="Premier Beauty Clinic"
          className="h-14 md:h-16 w-auto object-contain mb-10"
        />

        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 text-[#B99AD9] text-[11px] md:text-[12px] font-bold uppercase tracking-[0.25em] mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
          Our New Home Is Opening Soon
        </motion.span>

        <motion.h1
          variants={item}
          className="font-serif italic text-[36px] leading-[1.15] md:text-[64px] md:leading-[1.1] max-w-4xl mb-6"
        >
          A beautiful new way to<br className="hidden md:block" /> shop &amp; book with us
        </motion.h1>

        <motion.p
          variants={item}
          className="text-white/60 text-[15px] md:text-[17px] leading-relaxed max-w-xl mb-10"
        >
          We're putting the final touches on our online store and booking experience.
          In the meantime, our Kilimani clinic is open as usual — reach out and we'll
          take care of you.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center gap-4 mb-14"
        >
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all hover:-translate-y-[1px] active:scale-95"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Chat With Us
          </a>
          <a
            href={`tel:${BUSINESS.telephone}`}
            className="inline-flex items-center gap-2.5 border border-white/25 hover:border-white/60 text-white px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all hover:-translate-y-[1px] active:scale-95"
          >
            <Phone className="w-4 h-4" />
            {BUSINESS.telephone}
          </a>
        </motion.div>

        <motion.div
          variants={item}
          className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden max-w-2xl w-full border border-white/10"
        >
          <div className="bg-[#0A0A0A] px-6 py-6 flex flex-col items-center gap-2 text-center">
            <MapPin className="w-4 h-4 text-[#8B5CF6]" />
            <p className="text-white/80 text-[13px] leading-snug">
              Karibu Square Mall, Kilimani<br />1st Floor, Nairobi
            </p>
          </div>
          <div className="bg-[#0A0A0A] px-6 py-6 flex flex-col items-center gap-2 text-center">
            <Clock className="w-4 h-4 text-[#8B5CF6]" />
            <p className="text-white/80 text-[13px] leading-snug">
              Mon – Sat<br />9:00 AM – 7:00 PM
            </p>
          </div>
          <div className="bg-[#0A0A0A] px-6 py-6 flex flex-col items-center gap-2 text-center">
            <Mail className="w-4 h-4 text-[#8B5CF6]" />
            <a
              href={`mailto:${BUSINESS.email}`}
              className="text-white/80 hover:text-white text-[13px] leading-snug transition-colors"
            >
              {BUSINESS.email}
            </a>
          </div>
        </motion.div>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.6, duration: 0.5 } }}
        className="relative z-10 border-t border-white/10 py-6 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto w-full"
      >
        <p className="text-white/40 text-[11px] md:text-[12px]">
          © {new Date().getFullYear()} Premier Beauty Clinic. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/premier_beauty_clinic?igsh=NTZsaGw5dXl0Y3c4&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-9 h-9 bg-white/10 hover:bg-[#6D4C91] rounded-full flex items-center justify-center transition-all active:scale-90"
          >
            <Instagram className="w-4 h-4 text-white" />
          </a>
          <a
            href="https://www.tiktok.com/@premier_beauty_clinic?_r=1&_t=ZS-98q7CMWmW9Q"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="w-9 h-9 bg-white/10 hover:bg-[#6D4C91] rounded-full flex items-center justify-center transition-all active:scale-90"
          >
            <TikTokIcon className="w-4 h-4 text-white" />
          </a>
        </div>
      </motion.footer>
    </div>
  );
}
