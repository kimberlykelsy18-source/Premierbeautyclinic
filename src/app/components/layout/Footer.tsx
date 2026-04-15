import { Link } from 'react-router';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';
import logo from '../../../assets/logo.png';

// TikTok SVG icon component since it's not in lucide-react
const TikTokIcon = () => (
  <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export function Footer() {
  const shopCollections = [
    { name: 'New Arrivals', path: '/shop?collection=new-arrivals' },
    { name: 'Bestsellers', path: '/shop?collection=bestsellers' },
    { name: 'Skincare Kits', path: '/shop?collection=skincare-kits' },
    { name: 'Hygiene Essentials', path: '/shop?collection=hygiene-essentials' },
    { name: 'Professional Grade', path: '/shop?collection=professional-grade' },
    { name: 'Eco-Friendly', path: '/shop?collection=eco-friendly' }
  ];

  const quickLinks = [
    { name: 'Book a Service', path: '/book' },
    { name: 'FAQs', path: '/faq' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' }
  ];

  return (
    <footer className="bg-[#000000] border-t border-white/10 pt-16 md:pt-20 pb-8 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/">
              <img src={logo} alt="Premier Beauty Clinic" className="h-12 md:h-14 w-auto object-contain mb-6 md:mb-8" />
            </Link>
            <p className="text-white/60 text-[13px] md:text-[14px] leading-relaxed mb-6">
              Providing premium, dermatologist-approved skincare and hygiene solutions for all skin types. Your journey to radiant health begins here.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/premierbeautyclinic"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 md:w-10 md:h-10 bg-white/10 hover:bg-[#6D4C91] rounded-full flex items-center justify-center transition-all active:scale-90"
              >
                <Instagram className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </a>
              <a
                href="https://www.tiktok.com/@premierbeautyclinic"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 md:w-10 md:h-10 bg-white/10 hover:bg-[#6D4C91] rounded-full flex items-center justify-center transition-all active:scale-90"
              >
                <span className="text-white"><TikTokIcon /></span>
              </a>
            </div>
          </div>

          {/* Shop Collections */}
          <div>
            <h3 className="text-white text-[12px] md:text-[13px] font-bold uppercase tracking-widest mb-4 md:mb-6">Shop Collections</h3>
            <ul className="space-y-3">
              {shopCollections.map(collection => (
                <li key={collection.name}>
                  <Link to={collection.path} className="text-white/60 hover:text-white text-[13px] md:text-[14px] transition-colors">
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-[12px] md:text-[13px] font-bold uppercase tracking-widest mb-4 md:mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-white/60 hover:text-white text-[13px] md:text-[14px] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-[12px] md:text-[13px] font-bold uppercase tracking-widest mb-4 md:mb-6">Get In Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#6D4C91] flex-shrink-0 mt-0.5" />
                <span className="text-white/60 text-[13px] md:text-[14px]">Karibu Mall, Kilimani<br />1st Floor, Nairobi</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-[#6D4C91] flex-shrink-0 mt-0.5" />
                <span className="text-white/60 text-[13px] md:text-[14px]">+254 707 259 295</span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-[#6D4C91] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col space-y-1">
                  <a href="mailto:info@premierbeautyclinic.com" className="text-white/60 hover:text-white text-[13px] md:text-[14px] transition-colors">info@premierbeautyclinic.com</a>
                  <a href="mailto:customersupport@premierbeautyclinic.com" className="text-white/60 hover:text-white text-[13px] md:text-[14px] transition-colors">customersupport@premierbeautyclinic.com</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-white/40 text-[11px] md:text-[12px]">© {new Date().getFullYear()} Premier Beauty Clinic. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-white/40 hover:text-white/80 text-[11px] md:text-[12px] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-white/40 hover:text-white/80 text-[11px] md:text-[12px] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
