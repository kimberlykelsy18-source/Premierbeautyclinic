import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, Save, X, ChevronDown } from 'lucide-react';
import { ButtonWithLoading } from './Loading';

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
}

interface FAQsManagementProps {
  showFeedback: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

// Mock initial FAQs
const INITIAL_FAQS: FAQ[] = [
  {
    id: '1',
    category: 'Products',
    question: 'Are your products authentic?',
    answer: 'Yes, all our skincare products are 100% authentic and sourced directly from authorized distributors and brands. We guarantee the authenticity of every product we sell.',
    order: 1
  },
  {
    id: '2',
    category: 'Products',
    question: 'How do I choose the right products for my skin type?',
    answer: 'Book a free skin analysis consultation with our experts. They will assess your skin type and recommend products tailored to your specific needs. You can also use our product filters to shop by skin type.',
    order: 2
  },
  {
    id: '3',
    category: 'Shipping',
    question: 'What are the shipping fees?',
    answer: 'Shipping fees vary by county. Nairobi County is KES 350, Mombasa County is KES 600, Kisumu County is KES 550, and other regions range from KES 400-800. Exact fees are calculated at checkout based on your delivery location.',
    order: 3
  },
  {
    id: '4',
    category: 'Shipping',
    question: 'How long does delivery take?',
    answer: 'Delivery within Nairobi typically takes 1-2 business days. Other major cities take 2-4 business days, while remote areas may take 3-7 business days. You will receive tracking information once your order is shipped.',
    order: 4
  },
  {
    id: '5',
    category: 'Orders',
    question: 'Can I cancel or modify my order?',
    answer: 'Yes, you can cancel or modify your order within 2 hours of placing it. After this window, we begin processing your order. Please contact our customer service immediately if you need to make changes.',
    order: 5
  },
  {
    id: '6',
    category: 'Orders',
    question: 'What payment methods do you accept?',
    answer: 'We accept M-Pesa (mobile money), Visa, Mastercard, and American Express credit/debit cards. All transactions are processed securely through our encrypted payment gateway.',
    order: 6
  },
  {
    id: '7',
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'Unopened products can be returned within 14 days of delivery for a full refund. For hygiene reasons, opened skincare products cannot be returned unless defective. Contact us within 48 hours of delivery if you receive a defective or incorrect item.',
    order: 7
  },
  {
    id: '8',
    category: 'Services',
    question: 'How do I book a consultation?',
    answer: 'Click on "Book a Service" in the navigation menu or visit our Services page. Select your preferred service, choose a date and time, and complete the booking with a deposit payment via M-Pesa.',
    order: 8
  },
  {
    id: '9',
    category: 'Services',
    question: 'Can I reschedule my appointment?',
    answer: 'Yes, you can reschedule your appointment up to 24 hours in advance through your account dashboard. Cancellations or rescheduling within 24 hours may be subject to a fee.',
    order: 9
  },
  {
    id: '10',
    category: 'Account',
    question: 'How do I track my order?',
    answer: 'Once your order is shipped, you will receive an email with tracking information. You can also track your orders by logging into your account and viewing your order history.',
    order: 10
  }
];

export function FAQsManagementContent({ showFeedback }: FAQsManagementProps) {
  const [faqs, setFaqs] = useState<FAQ[]>(INITIAL_FAQS);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: '',
    question: '',
    answer: ''
  });

  const categories = ['Products', 'Shipping', 'Orders', 'Returns', 'Services', 'Account', 'General'];

  const resetForm = () => {
    setFormData({ category: '', question: '', answer: '' });
    setEditingFaq(null);
  };

  const handleAdd = async () => {
    if (!formData.category || !formData.question || !formData.answer) {
      showFeedback('error', 'Missing Fields', 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const newFaq: FAQ = {
        id: Date.now().toString(),
        category: formData.category,
        question: formData.question,
        answer: formData.answer,
        order: faqs.length + 1
      };

      setFaqs([...faqs, newFaq]);
      showFeedback('success', 'FAQ Added', 'The FAQ has been added successfully.');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      showFeedback('error', 'Add Failed', 'Could not add FAQ. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!formData.category || !formData.question || !formData.answer || !editingFaq) {
      showFeedback('error', 'Missing Fields', 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      setFaqs(faqs.map(faq =>
        faq.id === editingFaq.id
          ? { ...faq, category: formData.category, question: formData.question, answer: formData.answer }
          : faq
      ));

      showFeedback('success', 'FAQ Updated', 'The FAQ has been updated successfully.');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      showFeedback('error', 'Update Failed', 'Could not update FAQ. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      setFaqs(faqs.filter(faq => faq.id !== id));
      showFeedback('success', 'FAQ Deleted', 'The FAQ has been deleted successfully.');
    } catch (error) {
      showFeedback('error', 'Delete Failed', 'Could not delete FAQ. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer
    });
    setShowAddModal(true);
  };

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <motion.div
      key="faqs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[24px] md:text-[32px] font-serif mb-2">FAQs Management</h2>
          <p className="text-[14px] text-gray-500">
            Manage frequently asked questions that appear on the customer-facing FAQ page.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-5 py-3 bg-[#6D4C91] text-white rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add FAQ</span>
        </button>
      </div>

      {/* FAQs List */}
      <div className="space-y-6">
        {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
          <div key={category} className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-[18px] font-serif mb-4 flex items-center">
              <span className="px-3 py-1 bg-[#6D4C91] text-white rounded-full text-[12px] font-bold uppercase tracking-widest mr-3">
                {category}
              </span>
              <span className="text-gray-400 text-[14px]">({categoryFaqs.length})</span>
            </h3>

            <div className="space-y-3">
              {categoryFaqs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <button
                        onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-[15px] font-medium pr-4">{faq.question}</p>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                              expandedId === faq.id ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedId === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-[14px] text-gray-600 mt-3 leading-relaxed">{faq.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(faq)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit FAQ"
                      >
                        <Edit className="w-4 h-4 text-[#6D4C91]" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            />
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[24px] md:text-[28px] font-serif">
                    {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5 mb-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[15px]"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Question *
                    </label>
                    <input
                      type="text"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[15px]"
                      placeholder="What is your question?"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Answer *
                    </label>
                    <textarea
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[15px] min-h-[120px] resize-y"
                      placeholder="Provide a detailed answer..."
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-4 border border-gray-200 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <ButtonWithLoading
                    isLoading={isLoading}
                    onClick={editingFaq ? handleEdit : handleAdd}
                    className="flex-1 bg-[#6D4C91] text-white px-6 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingFaq ? 'Update FAQ' : 'Add FAQ'}</span>
                  </ButtonWithLoading>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
