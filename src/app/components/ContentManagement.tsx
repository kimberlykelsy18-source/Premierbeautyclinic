import { useState } from 'react';
import { Edit, Save, X, Plus, Trash2, AlertCircle, Image as ImageIcon, Type, Layout, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from './Feedback';

interface MarqueePromotion {
  id: string;
  text: string;
  active: boolean;
}

interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface Banner {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  active: boolean;
}

export function ContentManagement() {
  const { showFeedback } = useFeedback();
  const [activeSection, setActiveSection] = useState<'marquee' | 'hero' | 'features' | 'banners'>('marquee');

  // Marquee Promotions State
  const [marqueePromotions, setMarqueePromotions] = useState<MarqueePromotion[]>([
    { id: '1', text: '🎉 Free Shipping on Orders Over KES 5,000', active: true },
    { id: '2', text: '✨ New Arrivals: Discover Our Latest Skincare Collection', active: true },
    { id: '3', text: '💝 15% Off First-Time Consultations - Use Code: GLOW15', active: false },
  ]);
  const [isAddingMarquee, setIsAddingMarquee] = useState(false);
  const [newMarqueeText, setNewMarqueeText] = useState('');
  const [editingMarqueeId, setEditingMarqueeId] = useState<string | null>(null);
  const [editedMarqueeText, setEditedMarqueeText] = useState('');

  // Hero Content State
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: 'Radiate Confidence with Expert Skincare',
    subtitle: 'Premium beauty solutions tailored to your skin\'s unique needs.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
  });
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [editedHero, setEditedHero] = useState<HeroContent>(heroContent);

  // Features State
  const [features, setFeatures] = useState<Feature[]>([
    { id: '1', icon: '🚚', title: 'Fast Delivery', description: 'Same-day delivery in Nairobi, 2-3 days nationwide' },
    { id: '2', icon: '✓', title: 'Expert Consultations', description: 'Book personalized skin analysis with certified dermatologists' },
    { id: '3', icon: '🔒', title: 'Secure Payments', description: 'M-Pesa & card payments with SSL encryption' },
    { id: '4', icon: '💫', title: 'Authentic Products', description: '100% genuine skincare from trusted global brands' },
  ]);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [newFeature, setNewFeature] = useState<Feature>({ id: '', icon: '✨', title: '', description: '' });

  // Banners State
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: '1',
      title: 'Summer Glow Collection',
      description: 'Protect and nourish your skin with our curated summer essentials',
      buttonText: 'Shop Collection',
      buttonLink: '/shop?category=sun-care',
      imageUrl: '/banner-summer.jpg',
      active: true,
    },
  ]);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [isAddingBanner, setIsAddingBanner] = useState(false);

  // Marquee Functions
  const addMarqueePromotion = () => {
    if (!newMarqueeText.trim()) {
      showFeedback('error', 'Validation Error', 'Please enter promotion text');
      return;
    }
    const newPromo: MarqueePromotion = {
      id: Date.now().toString(),
      text: newMarqueeText,
      active: true,
    };
    setMarqueePromotions([...marqueePromotions, newPromo]);
    setNewMarqueeText('');
    setIsAddingMarquee(false);
    showFeedback('success', 'Promotion Added', 'New marquee promotion has been created');
  };

  const toggleMarqueePromotion = (id: string) => {
    setMarqueePromotions(marqueePromotions.map(p => p.id === id ? { ...p, active: !p.active } : p));
    showFeedback('success', 'Status Updated', 'Marquee promotion status changed');
  };

  const deleteMarqueePromotion = (id: string) => {
    setMarqueePromotions(marqueePromotions.filter(p => p.id !== id));
    showFeedback('success', 'Deleted', 'Marquee promotion has been removed');
  };

  const editMarqueePromotion = (id: string) => {
    const promo = marqueePromotions.find(p => p.id === id);
    if (promo) {
      setEditingMarqueeId(id);
      setEditedMarqueeText(promo.text);
    }
  };

  const saveMarqueePromotion = (id: string) => {
    if (!editedMarqueeText.trim()) {
      showFeedback('error', 'Validation Error', 'Please enter promotion text');
      return;
    }
    setMarqueePromotions(marqueePromotions.map(p => p.id === id ? { ...p, text: editedMarqueeText } : p));
    setEditingMarqueeId(null);
    setEditedMarqueeText('');
    showFeedback('success', 'Promotion Updated', 'Marquee promotion has been updated');
  };

  // Hero Functions
  const saveHeroContent = () => {
    setHeroContent(editedHero);
    setIsEditingHero(false);
    showFeedback('success', 'Hero Updated', 'Home page hero section has been saved');
  };

  // Feature Functions
  const saveFeature = (feature: Feature) => {
    if (!feature.title.trim() || !feature.description.trim()) {
      showFeedback('error', 'Validation Error', 'Please fill in all feature fields');
      return;
    }
    setFeatures(features.map(f => f.id === feature.id ? feature : f));
    setEditingFeatureId(null);
    showFeedback('success', 'Feature Updated', 'Feature has been saved');
  };

  const addFeature = () => {
    if (!newFeature.title.trim() || !newFeature.description.trim()) {
      showFeedback('error', 'Validation Error', 'Please fill in all feature fields');
      return;
    }
    const feature: Feature = { ...newFeature, id: Date.now().toString() };
    setFeatures([...features, feature]);
    setNewFeature({ id: '', icon: '✨', title: '', description: '' });
    setIsAddingFeature(false);
    showFeedback('success', 'Feature Added', 'New feature has been created');
  };

  const deleteFeature = (id: string) => {
    setFeatures(features.filter(f => f.id !== id));
    showFeedback('success', 'Deleted', 'Feature has been removed');
  };

  // Banner Functions
  const toggleBanner = (id: string) => {
    setBanners(banners.map(b => b.id === id ? { ...b, active: !b.active } : b));
    showFeedback('success', 'Status Updated', 'Banner visibility changed');
  };

  const deleteBanner = (id: string) => {
    setBanners(banners.filter(b => b.id !== id));
    showFeedback('success', 'Deleted', 'Banner has been removed');
  };

  const sections = [
    { id: 'marquee', name: 'Marquee Promotions', icon: MessageSquare },
    { id: 'hero', name: 'Hero Section', icon: Layout },
    { id: 'features', name: 'Features', icon: Type },
    { id: 'banners', name: 'Promotional Banners', icon: ImageIcon },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[24px] md:text-[32px] font-serif font-bold italic mb-2">Content Management</h1>
        <p className="text-[13px] md:text-[15px] text-gray-500">Update website content, promotions, and marketing messages.</p>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`px-4 md:px-6 py-2.5 md:py-3 rounded-full text-[11px] md:text-[13px] font-bold uppercase tracking-widest transition-all flex items-center ${
                activeSection === section.id
                  ? 'bg-[#6D4C91] text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#6D4C91] hover:text-[#6D4C91]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
              <span className="hidden sm:inline">{section.name}</span>
              <span className="sm:hidden">{section.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Marquee Promotions Section */}
      {activeSection === 'marquee' && (
        <div className="bg-white rounded-2xl md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-[#FDFBF7]">
            <div>
              <h2 className="text-[18px] md:text-[20px] font-serif mb-1">Marquee Promotions</h2>
              <p className="text-[12px] md:text-[13px] text-gray-500">Scrolling text at the top of the website</p>
            </div>
            <button
              onClick={() => setIsAddingMarquee(true)}
              className="bg-[#6D4C91] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center justify-center w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
              Add Promotion
            </button>
          </div>

          <div className="p-4 md:p-8 space-y-3 md:space-y-4">
            {marqueePromotions.map(promo => (
              <div key={promo.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                  <button
                    onClick={() => toggleMarqueePromotion(promo.id)}
                    className={`flex-shrink-0 w-12 h-6 rounded-full relative transition-all ${
                      promo.active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      promo.active ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                  {editingMarqueeId === promo.id ? (
                    <input
                      value={editedMarqueeText}
                      onChange={(e) => setEditedMarqueeText(e.target.value)}
                      className="text-[13px] md:text-[14px] font-medium flex-1 px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20"
                    />
                  ) : (
                    <p className="text-[13px] md:text-[14px] font-medium flex-1 break-words">{promo.text}</p>
                  )}
                </div>
                <div className="flex gap-2 justify-end sm:justify-start">
                  {editingMarqueeId === promo.id ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingMarqueeId(null);
                          setEditedMarqueeText('');
                        }}
                        className="px-4 md:px-5 py-2 md:py-2.5 text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveMarqueePromotion(promo.id)}
                        className="bg-green-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-green-700 transition-all"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => editMarqueePromotion(promo.id)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMarqueePromotion(promo.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {isAddingMarquee && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-[#FDFBF7] rounded-2xl border border-[#6D4C91]/20"
              >
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                  Promotion Text
                </label>
                <input
                  value={newMarqueeText}
                  onChange={(e) => setNewMarqueeText(e.target.value)}
                  placeholder="e.g., 🎉 Free Shipping on Orders Over KES 5,000"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] mb-4"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsAddingMarquee(false)}
                    className="px-6 py-3 text-[12px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addMarqueePromotion}
                    className="bg-[#6D4C91] text-white px-6 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all"
                  >
                    Add Promotion
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      {activeSection === 'hero' && (
        <div className="bg-white rounded-2xl md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-[#FDFBF7]">
            <div>
              <h2 className="text-[18px] md:text-[20px] font-serif mb-1">Hero Section</h2>
              <p className="text-[12px] md:text-[13px] text-gray-500">Main banner on the home page</p>
            </div>
            {!isEditingHero && (
              <button
                onClick={() => {
                  setEditedHero(heroContent);
                  setIsEditingHero(true);
                }}
                className="bg-[#6D4C91] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center justify-center w-full sm:w-auto"
              >
                <Edit className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                Edit Hero
              </button>
            )}
          </div>

          <div className="p-4 md:p-8">
            {!isEditingHero ? (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Title</p>
                  <p className="text-[20px] md:text-[24px] font-serif font-bold">{heroContent.title}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Subtitle</p>
                  <p className="text-[14px] md:text-[16px] text-gray-600">{heroContent.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">CTA Button Text</p>
                    <p className="text-[13px] md:text-[14px] font-medium">{heroContent.ctaText}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">CTA Link</p>
                    <p className="text-[13px] md:text-[14px] text-gray-500">{heroContent.ctaLink}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Title</label>
                  <input
                    value={editedHero.title}
                    onChange={(e) => setEditedHero({ ...editedHero, title: e.target.value })}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Subtitle</label>
                  <textarea
                    value={editedHero.subtitle}
                    onChange={(e) => setEditedHero({ ...editedHero, subtitle: e.target.value })}
                    rows={2}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px] resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">CTA Button Text</label>
                    <input
                      value={editedHero.ctaText}
                      onChange={(e) => setEditedHero({ ...editedHero, ctaText: e.target.value })}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">CTA Link</label>
                    <input
                      value={editedHero.ctaLink}
                      onChange={(e) => setEditedHero({ ...editedHero, ctaLink: e.target.value })}
                      placeholder="/shop"
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                    />
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                  <button
                    onClick={() => setIsEditingHero(false)}
                    className="px-6 py-3 text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveHeroContent}
                    className="bg-green-600 text-white px-6 py-3 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center"
                  >
                    <Save className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features Section */}
      {activeSection === 'features' && (
        <div className="bg-white rounded-2xl md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-[#FDFBF7]">
            <div>
              <h2 className="text-[18px] md:text-[20px] font-serif mb-1">Features</h2>
              <p className="text-[12px] md:text-[13px] text-gray-500">Key selling points displayed on the home page</p>
            </div>
            <button
              onClick={() => setIsAddingFeature(true)}
              className="bg-[#6D4C91] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center justify-center w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
              Add Feature
            </button>
          </div>

          <div className="p-4 md:p-8 space-y-3 md:space-y-4">
            {features.map(feature => (
              <div key={feature.id} className="p-4 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                {editingFeatureId === feature.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-3 md:gap-4">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Icon</label>
                        <input
                          value={feature.icon}
                          onChange={(e) => setFeatures(features.map(f => f.id === feature.id ? { ...f, icon: e.target.value } : f))}
                          className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Title</label>
                        <input
                          value={feature.title}
                          onChange={(e) => setFeatures(features.map(f => f.id === feature.id ? { ...f, title: e.target.value } : f))}
                          className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                      <textarea
                        value={feature.description}
                        onChange={(e) => setFeatures(features.map(f => f.id === feature.id ? { ...f, description: e.target.value } : f))}
                        rows={2}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px] resize-none"
                      />
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                      <button
                        onClick={() => setEditingFeatureId(null)}
                        className="px-6 py-3 text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveFeature(feature)}
                        className="bg-green-600 text-white px-6 py-3 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-green-700 transition-all"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      <div className="text-[28px] md:text-[32px]">{feature.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-[15px] md:text-[16px] font-bold mb-1">{feature.title}</h3>
                        <p className="text-[13px] md:text-[14px] text-gray-600 break-words">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end sm:justify-start">
                      <button
                        onClick={() => setEditingFeatureId(feature.id)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFeature(feature.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isAddingFeature && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 md:p-6 bg-[#FDFBF7] rounded-xl md:rounded-2xl border border-[#6D4C91]/20"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3 md:gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Icon</label>
                      <input
                        value={newFeature.icon}
                        onChange={(e) => setNewFeature({ ...newFeature, icon: e.target.value })}
                        placeholder="✨"
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Title</label>
                      <input
                        value={newFeature.title}
                        onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                        placeholder="Feature Name"
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                    <textarea
                      value={newFeature.description}
                      onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                      placeholder="Brief description of this feature"
                      rows={2}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[13px] md:text-[14px] resize-none"
                    />
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                    <button
                      onClick={() => setIsAddingFeature(false)}
                      className="px-6 py-3 text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addFeature}
                      className="bg-[#6D4C91] text-white px-6 py-3 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all"
                    >
                      Add Feature
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Promotional Banners Section */}
      {activeSection === 'banners' && (
        <div className="bg-white rounded-2xl md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-[#FDFBF7]">
            <div>
              <h2 className="text-[18px] md:text-[20px] font-serif mb-1">Promotional Banners</h2>
              <p className="text-[12px] md:text-[13px] text-gray-500">Large promotional sections on the home page</p>
            </div>
            <button
              onClick={() => setIsAddingBanner(true)}
              className="bg-[#6D4C91] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center justify-center w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
              Add Banner
            </button>
          </div>

          <div className="p-4 md:p-8 space-y-4 md:space-y-6">
            {banners.map(banner => (
              <div key={banner.id} className="p-4 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <button
                      onClick={() => toggleBanner(banner.id)}
                      className={`flex-shrink-0 w-12 h-6 rounded-full relative transition-all ${
                        banner.active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        banner.active ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                    <h3 className="text-[16px] md:text-[18px] font-serif font-bold break-words">{banner.title}</h3>
                  </div>
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[13px] md:text-[14px] text-gray-600 mb-4 break-words">{banner.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-[12px]">
                  <div>
                    <p className="text-gray-400 uppercase tracking-widest font-bold mb-1">Button Text</p>
                    <p className="font-medium">{banner.buttonText}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase tracking-widest font-bold mb-1">Link</p>
                    <p className="font-medium text-gray-500 break-all">{banner.buttonLink}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase tracking-widest font-bold mb-1">Image</p>
                    <p className="font-medium text-gray-500 break-all">{banner.imageUrl}</p>
                  </div>
                </div>
              </div>
            ))}

            {isAddingBanner && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 md:p-6 bg-[#FDFBF7] rounded-xl md:rounded-2xl border border-[#6D4C91]/20"
              >
                <p className="text-[13px] text-gray-500 mb-4">Add new promotional banner functionality coming soon...</p>
                <button
                  onClick={() => setIsAddingBanner(false)}
                  className="px-6 py-3 text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-all"
                >
                  Close
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}