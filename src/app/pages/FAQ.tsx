import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

// Mock FAQ data - In production, this will be fetched from the backend
const mockFAQs = [
  {
    id: 1,
    category: 'Products',
    question: 'Are your products suitable for sensitive skin?',
    answer: 'Yes, all our products are dermatologist-tested and suitable for sensitive skin. We carefully select ingredients that are gentle yet effective. If you have specific concerns, please consult with our skin care specialists during a consultation.'
  },
  {
    id: 2,
    category: 'Shipping',
    question: 'How long does delivery take?',
    answer: 'Delivery typically takes 2-5 business days within Nairobi and 3-7 business days for other regions in Kenya. We provide tracking information once your order ships.'
  },
  {
    id: 3,
    category: 'Services',
    question: 'Do I need to pay the full amount when booking a service?',
    answer: 'No, you only need to pay a deposit via M-Pesa when booking. The remaining balance can be paid at the clinic after your service.'
  },
  {
    id: 4,
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We accept returns within 14 days of purchase for unopened products. Please contact our customer service team to initiate a return. Opened products can only be returned if defective.'
  },
  {
    id: 5,
    category: 'Services',
    question: 'Can I reschedule my appointment?',
    answer: 'Yes, you can reschedule your appointment up to 24 hours before the scheduled time through your account dashboard or by contacting us directly.'
  },
  {
    id: 6,
    category: 'Products',
    question: 'Do you offer product samples?',
    answer: 'Yes, we offer samples for select products. Please visit our clinic or contact us to request samples of products you\'re interested in trying.'
  },
  {
    id: 7,
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept M-Pesa, Visa, and Debit Cards for both online purchases and service bookings. All transactions are securely processed with 256-bit SSL encryption.'
  },
  {
    id: 8,
    category: 'Shipping',
    question: 'Do you ship outside Kenya?',
    answer: 'Currently, we only ship within Kenya. We are working on expanding our shipping to other East African countries soon.'
  }
];

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(mockFAQs.map(faq => faq.category)))];

  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-[36px] md:text-[48px] lg:text-[64px] font-serif italic mb-3 md:mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 text-[14px] md:text-[16px] max-w-2xl mx-auto px-4">
            Find answers to common questions about our products, services, and policies.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 md:mb-12">
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 border border-gray-200 rounded-full text-[14px] md:text-[15px] focus:outline-none focus:border-[#6D4C91] transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-12 justify-center">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 md:px-6 py-2 rounded-full text-[11px] md:text-[13px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                selectedCategory === category
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#6D4C91]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <p className="text-gray-400 text-[14px] md:text-[15px]">No FAQs found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={faq.id}
                className="bg-white border border-gray-200 rounded-xl md:rounded-2xl overflow-hidden transition-all hover:border-[#6D4C91]"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-5 md:px-8 py-5 md:py-6 flex items-center justify-between text-left"
                >
                  <div className="flex-1 pr-3 md:pr-4">
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[#6D4C91] mb-1 md:mb-2 block">
                      {faq.category}
                    </span>
                    <h3 className="text-[14px] md:text-[16px] font-bold leading-snug">{faq.question}</h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-5 md:px-8 pb-5 md:pb-6 pt-2">
                    <p className="text-gray-600 text-[14px] md:text-[15px] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 md:mt-20 text-center bg-[#F8F6F3] rounded-2xl md:rounded-3xl p-8 md:p-12">
          <h3 className="text-[20px] md:text-[24px] font-serif italic mb-2 md:mb-3">Still have questions?</h3>
          <p className="text-gray-600 text-[14px] md:text-[15px] mb-5 md:mb-6 px-4">
            Can't find the answer you're looking for? Our customer support team is here to help.
          </p>
          <a
            href="mailto:admin@premierbeautyclinic.com"
            className="inline-block bg-[#1A1A1A] text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all active:scale-95"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}