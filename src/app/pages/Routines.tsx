import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { LazyImage } from '../components/LazyImage';
import { Seo } from '../lib/seo';

// Curated multi-product routine shots. "Shop Now" doesn't add to cart (these are
// groupings, not a single SKU) — it opens WhatsApp with the routine name pre-filled,
// same handoff pattern used sitewide since card/M-Pesa checkout was paused.
const WHATSAPP_NUMBER = '254768679646';

interface Routine {
  title: string;
  description: string;
  image: string;
  bg: string;
}

const ROUTINES: Routine[] = [
  {
    title: 'Clear Skin Reset',
    description: 'Benzoyl peroxide, an Effaclar cleanser and a K-beauty toner team up to calm breakouts and clear congestion.',
    image: 'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/routines/1786628585960-Premier_Poducts_377.jpg',
    bg: '#E8EDE3',
  },
  {
    title: 'Deep Hydration Ritual',
    description: 'Cleansing oil, an intensive balm and SPF layer together for skin that drinks in moisture and stays protected.',
    image: 'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/routines/1786628586680-Premier_Poducts_382.jpg',
    bg: '#E3EBF2',
  },
  {
    title: 'Calm & Repair',
    description: 'Cica-powered creams and a gentle oil-to-foam cleanser soothe redness and help skin bounce back.',
    image: 'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/routines/1786628587141-Premier_Poducts_384.jpg',
    bg: '#F2E7E5',
  },
  {
    title: 'Everyday Essentials',
    description: 'A purifying cleanser, daily SPF and a gentle exfoliant — the steps that keep skin balanced, every single day.',
    image: 'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/routines/1786628587935-Premier_Poducts_388.jpg',
    bg: '#F5EFE4',
  },
  {
    title: 'Smooth & Resurface',
    description: 'A glycolic peel and a urea-rich cream work through rough, bumpy texture for skin that feels newly smooth.',
    image: 'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/routines/1786628588451-Premier_Poducts_391.jpg',
    bg: '#F5E9DD',
  },
  {
    title: 'Glow & Hydrate',
    description: 'An aloe cleanser and a gluta-hya lotion pair up for that soft, dewy, ready-for-anything glow.',
    image: 'https://iveielvhnpcwksfdpecw.supabase.co/storage/v1/object/public/clinic-images/routines/1786628589012-Premier_Poducts_397.jpg',
    bg: '#EDE6F5',
  },
];

function routineWhatsAppLink(title: string) {
  const message = `Hi! I'd like to shop the "${title}" routine from Premier Beauty Clinic 💜`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function Routines() {
  return (
    <div className="pt-[100px] md:pt-[140px] pb-24 bg-[#F2F1F8] min-h-screen">
      <Seo
        title="Skincare Routines"
        description="Curated multi-product skincare routines from Premier Beauty Clinic — Clear Skin Reset, Deep Hydration, Calm & Repair, and more. Shop the full routine on WhatsApp."
        path="/routines"
      />
      <div className="max-w-6xl mx-auto px-4 md:px-8">

        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#6D4C91] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6D4C91] mb-3">Curated For You</p>
          <h1 className="text-4xl md:text-5xl font-serif italic leading-tight mb-4">Premier Routines</h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            Complete skincare routines, grouped by what your skin actually needs — cleanse, treat and protect in a few
            simple steps. Message us on WhatsApp and we'll get the full routine ready for you.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROUTINES.map((routine, index) => (
            <motion.div
              key={routine.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="rounded-2xl overflow-hidden bg-white border border-gray-100"
            >
              <div className="aspect-square overflow-hidden bg-white">
                <LazyImage
                  src={routine.image}
                  alt={routine.title}
                  priority={index < 3}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6" style={{ backgroundColor: routine.bg }}>
                <h3 className="font-bold text-lg text-[#1A1A1A] mb-2 leading-snug">{routine.title}</h3>
                <p className="text-sm text-[#1A1A1A]/65 leading-relaxed mb-4">{routine.description}</p>
                <a
                  href={routineWhatsAppLink(routine.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#6D4C91] hover:text-[#5a3e79] transition-colors"
                >
                  Shop Now <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
