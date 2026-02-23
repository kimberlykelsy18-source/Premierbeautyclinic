import { Link } from 'react-router';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';
import logo from 'figma:asset/9f791e938296bf5db89926ddac1d6fc1b167f150.png';

// TikTok SVG icon component since it's not in lucide-react
const TikTokIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
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
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 lg:col-span-1">
            <Link to="/">
              <div className="bg-[#1A1A1A] px-4 py-2 rounded-xl inline-block mb-8">
                <img src={logo} alt="Premier Beauty Clinic" className="h-16 w-auto object-contain" />
              </div>
            </Link>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-8 pr-4">
              Providing premium, dermatologist-approved skincare and hygiene solutions for all skin types since 2015. Your journey to radiant health begins here.
            </p>
            <div className="flex space-x-5">
              <a 
                href="https://www.instagram.com/premierbeautyclinic" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#6D4C91] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@premierbeautyclinic" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#6D4C91] transition-colors"
              >
                <TikTokIcon />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[14px] font-bold uppercase tracking-widest mb-8">Shop Collections</h4>
            <ul className="space-y-4">
              {shopCollections.map(item => (
                <li key={item.name}>
                  <Link to={item.path} className="text-gray-500 hover:text-[#6D4C91] text-[15px] transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[14px] font-bold uppercase tracking-widest mb-8">Quick Links</h4>
            <ul className="space-y-4">
              {quickLinks.map(item => (
                <li key={item.name}>
                  <Link to={item.path} className="text-gray-500 hover:text-[#6D4C91] text-[15px] transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[14px] font-bold uppercase tracking-widest mb-8">Contact Us</h4>
            <ul className="space-y-6">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-4 text-[#6D4C91] shrink-0" />
                <span className="text-gray-500 text-[15px]">Karibu Mall, Kilimani<br />1st Floor</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-4 text-[#6D4C91] shrink-0" />
                <span className="text-gray-500 text-[15px]">+254 707 259 295</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-4 text-[#6D4C91] shrink-0" />
                <span className="text-gray-500 text-[15px]">admin@premierbeautyclinic.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-[13px]">
            &copy; {new Date().getFullYear()} Premier Beauty Clinic. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 grayscale opacity-50">
              {/* Payment methods placeholder icons */}
              <div className="w-10 h-6 bg-gray-200 rounded" />
              <div className="w-10 h-6 bg-gray-200 rounded" />
              <div className="w-10 h-6 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}