import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createContext, useContext, useState, ReactNode } from 'react';

type FeedbackType = 'success' | 'error' | 'info';

interface Feedback {
  id: string;
  type: FeedbackType;
  title: string;
  message: string;
}

interface FeedbackContextType {
  showFeedback: (type: FeedbackType, title: string, message: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const showFeedback = (type: FeedbackType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setFeedbacks(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    }, 5000);
  };

  const removeFeedback = (id: string) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id));
  };

  return (
    <FeedbackContext.Provider value={{ showFeedback }}>
      {children}
      <div className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-[9999] space-y-3 max-w-[calc(100vw-32px)] md:max-w-md">
        <AnimatePresence>
          {feedbacks.map(feedback => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              className={`p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl border-2 backdrop-blur-sm ${
                feedback.type === 'success'
                  ? 'bg-white border-green-500'
                  : feedback.type === 'error'
                  ? 'bg-white border-red-500'
                  : 'bg-white border-blue-500'
              }`}
            >
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className={`p-2 rounded-full ${
                  feedback.type === 'success'
                    ? 'bg-green-50'
                    : feedback.type === 'error'
                    ? 'bg-red-50'
                    : 'bg-blue-50'
                }`}>
                  {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />}
                  {feedback.type === 'error' && <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />}
                  {feedback.type === 'info' && <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-[14px] md:text-[16px] font-bold mb-1 ${
                    feedback.type === 'success'
                      ? 'text-green-900'
                      : feedback.type === 'error'
                      ? 'text-red-900'
                      : 'text-blue-900'
                  }`}>
                    {feedback.title}
                  </h4>
                  <p className="text-[12px] md:text-[14px] text-gray-600 leading-relaxed">{feedback.message}</p>
                </div>
                <button
                  onClick={() => removeFeedback(feedback.id)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
}
