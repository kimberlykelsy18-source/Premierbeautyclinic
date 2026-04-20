import { useState, useEffect, useMemo } from 'react';
import { Star, Search, CheckCircle, XCircle, Trash2, MessageSquare, Clock, ThumbsUp, ThumbsDown, Filter, ShoppingBag, Scissors, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { apiFetch } from '../../lib/api';

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_email: string | null;
  rating: number;
  title: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  is_verified_purchase: boolean;
  staff_note: string | null;
  created_at: string;
  product_id: number | null;
  service_id: string | null;
  products: { name: string } | null;
  services: { name: string } | null;
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: Review['status'] }) {
  const map = {
    pending:  { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Pending'  },
    approved: { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Approved' },
    rejected: { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Rejected' },
  };
  const { bg, text, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest ${bg} ${text}`}>
      {status === 'pending'  && <Clock className="w-3 h-3" />}
      {status === 'approved' && <CheckCircle className="w-3 h-3" />}
      {status === 'rejected' && <XCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

function ReviewCard({
  review,
  onApprove,
  onReject,
  onDelete,
  loading,
}: {
  review: Review;
  onApprove: (id: string) => void;
  onReject:  (id: string) => void;
  onDelete:  (id: string) => void;
  loading: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const subjectName = review.products?.name ?? review.services?.name ?? 'Unknown';
  const subjectType = review.product_id ? 'Product' : 'Service';
  const SubjectIcon = review.product_id ? ShoppingBag : Scissors;
  const date = new Date(review.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-[#6D4C91]/10 flex items-center justify-center text-[#6D4C91] font-bold text-[15px] shrink-0">
            {review.reviewer_name[0]?.toUpperCase()}
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <p className="font-bold text-[14px] text-gray-900">{review.reviewer_name}</p>
              {review.is_verified_purchase && (
                <span className="text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Verified Purchase</span>
              )}
              <StatusBadge status={review.status} />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <StarRow rating={review.rating} />
              <span className="text-[11px] text-gray-400 font-medium">{date}</span>
              <span className="text-gray-200">·</span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                <SubjectIcon className="w-3 h-3" />
                {subjectType}: <span className="font-semibold text-gray-600">{subjectName}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Review content */}
        <div className="mt-4 pl-14">
          <p className="text-[14px] font-bold text-gray-900 mb-1">{review.title}</p>
          <p className={`text-[13px] text-gray-600 leading-relaxed ${!expanded && review.body.length > 200 ? 'line-clamp-3' : ''}`}>
            {review.body}
          </p>
          {review.body.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] font-bold text-[#6D4C91] mt-1 hover:underline"
            >
              {expanded ? 'Show less' : 'Read more'}
              <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}

          {review.staff_note && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Staff note</p>
              <p className="text-[12px] text-gray-600">{review.staff_note}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 pl-14">
          {review.status !== 'approved' && (
            <button
              onClick={() => onApprove(review.id)}
              disabled={loading === review.id}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-[12px] font-bold transition-colors disabled:opacity-50"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Approve
            </button>
          )}
          {review.status !== 'rejected' && (
            <button
              onClick={() => onReject(review.id)}
              disabled={loading === review.id}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-[12px] font-bold transition-colors disabled:opacity-50"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              Reject
            </button>
          )}
          <button
            onClick={() => onDelete(review.id)}
            disabled={loading === review.id}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-[12px] font-bold transition-colors disabled:opacity-50 ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardReviews() {
  const { token, sessionId } = useStore();
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [stats, setStats]       = useState<ReviewStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter]     = useState<'all' | 'product' | 'service'>('all');
  const [search, setSearch]             = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (typeFilter   !== 'all') params.set('type',   typeFilter);
    apiFetch(`/admin/reviews?${params}`, {}, token, sessionId)
      .then((data: { reviews: Review[]; stats: ReviewStats }) => {
        setReviews(data.reviews);
        setStats(data.stats);
      })
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return reviews;
    return reviews.filter(r =>
      r.reviewer_name.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      (r.products?.name ?? r.services?.name ?? '').toLowerCase().includes(q)
    );
  }, [reviews, search]);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionId(id);
    try {
      await apiFetch(`/admin/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }, token, sessionId);
      toast.success(status === 'approved' ? 'Review approved' : 'Review rejected');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    setActionId(id);
    try {
      await apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' }, token, sessionId);
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r.id !== id));
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setActionId(null);
    }
  };

  const STATUS_TABS = [
    { id: 'all',      label: 'All',      count: stats.total    },
    { id: 'pending',  label: 'Pending',  count: stats.pending  },
    { id: 'approved', label: 'Approved', count: stats.approved },
    { id: 'rejected', label: 'Rejected', count: stats.rejected },
  ] as const;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 md:mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6D4C91] mb-1">Reviews</p>
        <h1 className="text-[28px] md:text-[34px] font-serif font-bold">Customer Reviews</h1>
        <p className="text-gray-400 text-[13px] mt-1">Moderate product and service reviews before they appear publicly.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',    value: stats.total,    color: 'text-gray-900',   bg: 'bg-white' },
          { label: 'Pending',  value: stats.pending,  color: 'text-amber-600',  bg: 'bg-amber-50' },
          { label: 'Approved', value: stats.approved, color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600',    bg: 'bg-red-50'   },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100`}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
            <p className={`text-[28px] font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
        {/* Status tabs */}
        <div className="flex gap-1 p-1 bg-gray-50 rounded-xl">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  statusFilter === tab.id ? 'bg-[#6D4C91] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl">
          <Filter className="w-3.5 h-3.5 text-gray-400 ml-1" />
          {(['all', 'product', 'service'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold capitalize transition-all ${
                typeFilter === t ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'all' ? 'All types' : t + 's'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 flex-grow min-w-[180px]">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reviewer or product…"
            className="bg-transparent outline-none text-[13px] w-full"
          />
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-grow space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-3/4 mt-4" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center text-center">
          <MessageSquare className="w-12 h-12 text-gray-200 mb-4" />
          <p className="text-[16px] font-bold text-gray-300 mb-1">No reviews found</p>
          <p className="text-[13px] text-gray-300">
            {search ? 'Try a different search term' : 'No reviews match the selected filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                onApprove={id => updateStatus(id, 'approved')}
                onReject={id  => updateStatus(id, 'rejected')}
                onDelete={deleteReview}
                loading={actionId}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
