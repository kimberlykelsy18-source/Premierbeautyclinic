import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle2, Plus, X, CreditCard, ChevronRight, Check, Printer, RefreshCw, Smartphone, Stethoscope, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { apiFetch, toShortAptId, toShortWalkInId } from '../../lib/api';
import logoUrl from '../../../assets/logo.png';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentInfo {
  status: string;
  mpesa_receipt: string | null;
  amount: number;
  failure_reason: string | null;
  checkout_request_id?: string | null;
}

interface ApiAppointment {
  id: string;
  appointment_number: number | null;
  appointment_time: string;
  status: string;
  deposit_amount: number;
  total_amount: number;
  practitioner?: string | null;
  services: { name: string; base_price: number; deposit_percentage: number } | null;
  profiles: { full_name: string; phone?: string } | null;
  payments: PaymentInfo[] | null;
}

interface ApiService {
  id: number;
  name: string;
  base_price?: number;
  deposit_percentage?: number;
}

interface WalkIn {
  id: string;
  walk_in_number: number | null;
  customer_name: string;
  phone: string | null;
  email?: string | null;
  service_id: number | null;
  services: { name: string; base_price: number; deposit_percentage: number | null } | null;
  deposit_paid: number;
  status: string; // 'pending' | 'paid' | 'completed'
  practitioner?: string | null;
  notes: string | null;
  appointment_time: string | null;
  created_at: string;
  payments: PaymentInfo[] | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRACTITIONERS = ['Dr. Sarah Kimani', 'Dr. Michael Chen', 'Esthetician Jane', 'Nurse Mary'];

const EMPTY_FORM = {
  customer_name:    '',
  phone:            '',
  email:            '',
  notes:            '',
  service_id:       '',
  practitioner:     '',
  deposit_paid:     '',
  appointment_date: '',
  appointment_time: '09:00',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAptDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatAptTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}
function isToday(iso: string)    { return new Date(iso).toDateString() === new Date().toDateString(); }
function isTomorrow(iso: string) {
  const t = new Date(); t.setDate(t.getDate() + 1);
  return new Date(iso).toDateString() === t.toDateString();
}
function isThisWeek(iso: string) {
  const d = new Date(iso), now = new Date();
  const start = new Date(now); start.setDate(now.getDate() - now.getDay());
  const end   = new Date(start); end.setDate(start.getDate() + 6);
  return d >= start && d <= end;
}

function mapAptStatus(status: string) {
  const map: Record<string, string> = {
    confirmed: 'Confirmed', pending: 'Pending',
    completed: 'Completed', cancelled: 'Cancelled', failed: 'Failed',
  };
  return map[status] ?? (status.charAt(0).toUpperCase() + status.slice(1));
}

function mapWalkInStatus(status: string) {
  const map: Record<string, string> = {
    pending:   'Pending',
    paid:      'Paid',
    completed: 'Completed',
  };
  return map[status] ?? (status.charAt(0).toUpperCase() + status.slice(1));
}

function normalizeMpesaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('7') && digits.length === 9) return '254' + digits;
  return digits;
}

// ─── Print: appointment receipt ────────────────────────────────────────────────

function printAptReceipt(apt: ApiAppointment, logoSrc: string) {
  const receiptPayments = apt.payments?.filter(p => p.status === 'paid' && !!p.mpesa_receipt) ?? [];
  const depositPayment  = receiptPayments[0] ?? null;
  const balancePayment  = receiptPayments[1] ?? null;
  const shortId     = toShortAptId(apt.appointment_number);
  const serviceName = apt.services?.name ?? 'Service';
  const clientName  = apt.profiles?.full_name ?? 'Client';
  const date        = new Date(apt.appointment_time).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const time        = new Date(apt.appointment_time).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  const isFullyPaid = apt.status === 'completed' || !!balancePayment || (apt.deposit_amount === 0 && !!depositPayment);
  const totalPaid   = isFullyPaid ? apt.total_amount : (depositPayment ? apt.deposit_amount : 0);
  const balanceDue  = apt.total_amount - totalPaid;

  const win = window.open('', '_blank', 'width=520,height=820');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>Receipt — ${shortId}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#fff;color:#1a1a1a;max-width:480px;margin:32px auto;padding:0 20px}
    .hdr{background:#6D4C91;color:#fff;padding:24px;border-radius:12px 12px 0 0;text-align:center}
    .hdr img{height:44px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto}
    .body{border:1px solid #eee;border-top:none;padding:28px;border-radius:0 0 12px 12px}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    td{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px}td:first-child{color:#888;width:140px}td:last-child{font-weight:600}
    .badge{display:inline-block;padding:2px 12px;border-radius:99px;font-size:12px;background:${isFullyPaid ? '#22c55e' : '#f59e0b'};color:#fff}
    .footer{text-align:center;margin-top:24px;font-size:12px;color:#aaa}
    @media print{button{display:none}}
  </style></head><body>
  <div class="hdr">
    <img src="${logoSrc}" alt="Premier Beauty Clinic" />
    <p style="font-size:13px;opacity:.8">Appointment Receipt</p>
  </div>
  <div class="body">
    <table>
      <tr><td>Booking Ref</td><td style="color:#6D4C91">${shortId}</td></tr>
      <tr><td>Client</td><td>${clientName}</td></tr>
      <tr><td>Service</td><td>${serviceName}</td></tr>
      <tr><td>Date</td><td>${date}</td></tr>
      <tr><td>Time</td><td>${time}</td></tr>
      <tr><td>Total Fee</td><td>KES ${apt.total_amount.toLocaleString()}</td></tr>
      ${totalPaid > 0 ? `<tr><td>Amount Paid</td><td style="color:#22c55e">KES ${totalPaid.toLocaleString()}</td></tr>` : ''}
      ${depositPayment?.mpesa_receipt ? `<tr><td>${balancePayment ? 'Deposit Receipt' : 'M-Pesa Receipt'}</td><td>${depositPayment.mpesa_receipt}</td></tr>` : ''}
      ${balancePayment?.mpesa_receipt ? `<tr><td>Balance Receipt</td><td>${balancePayment.mpesa_receipt}</td></tr>` : ''}
      ${balanceDue > 0 ? `<tr><td>Balance Due</td><td>KES ${balanceDue.toLocaleString()} (at clinic)</td></tr>` : '<tr><td>Balance Due</td><td style="color:#22c55e">Fully Settled</td></tr>'}
      <tr><td>Status</td><td><span class="badge">${isFullyPaid ? 'Paid' : 'Pending'}</span></td></tr>
    </table>
    <div class="footer">
      <p>Premier Beauty Clinic · Ngong Road, Nairobi</p>
      <p style="margin-top:4px">Thank you for choosing us!</p>
    </div>
    <p style="text-align:center;margin-top:20px"><button onclick="window.print()">🖨 Print / Save PDF</button></p>
  </div>
  </body></html>`);
  win.document.close();
  win.focus();
}

// ─── Print: walk-in receipt ────────────────────────────────────────────────────

function printWalkInReceipt(wk: WalkIn, logoSrc: string) {
  const shortId     = toShortWalkInId(wk.walk_in_number);
  const paidPayment = wk.payments?.find(p => p.status === 'paid' && !!p.mpesa_receipt) ?? null;
  const clientName  = wk.customer_name;
  const serviceName = wk.services?.name ?? 'Service';
  const isPaid      = wk.status === 'paid' || wk.status === 'completed' || !!paidPayment;
  const dateStr     = wk.appointment_time
    ? new Date(wk.appointment_time).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : new Date(wk.created_at).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = wk.appointment_time
    ? new Date(wk.appointment_time).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
    : 'Walk-in';

  const win = window.open('', '_blank', 'width=520,height=780');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>Walk-in Receipt</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#fff;color:#1a1a1a;max-width:480px;margin:32px auto;padding:0 20px}
    .hdr{background:#0f766e;color:#fff;padding:24px;border-radius:12px 12px 0 0;text-align:center}
    .hdr img{height:44px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto}
    .body{border:1px solid #eee;border-top:none;padding:28px;border-radius:0 0 12px 12px}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    td{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px}td:first-child{color:#888;width:140px}td:last-child{font-weight:600}
    .badge{display:inline-block;padding:2px 12px;border-radius:99px;font-size:12px;background:${isPaid ? '#22c55e' : '#f59e0b'};color:#fff}
    .footer{text-align:center;margin-top:24px;font-size:12px;color:#aaa}
    @media print{button{display:none}}
  </style></head><body>
  <div class="hdr">
    <img src="${logoSrc}" alt="Premier Beauty Clinic" />
    <p style="font-size:13px;opacity:.8">Walk-in Receipt</p>
  </div>
  <div class="body">
    <table>
      <tr><td>Booking Ref</td><td style="color:#0f766e">${shortId}</td></tr>
      <tr><td>Type</td><td style="color:#0f766e">Walk-in</td></tr>
      <tr><td>Client</td><td>${clientName}</td></tr>
      ${wk.phone ? `<tr><td>Phone</td><td>${wk.phone}</td></tr>` : ''}
      <tr><td>Service</td><td>${serviceName}</td></tr>
      <tr><td>Date</td><td>${dateStr}</td></tr>
      <tr><td>Time</td><td>${timeStr}</td></tr>
      ${wk.deposit_paid > 0 ? `<tr><td>Deposit Paid</td><td style="color:#22c55e">KES ${Number(wk.deposit_paid).toLocaleString()}</td></tr>` : ''}
      ${paidPayment?.mpesa_receipt ? `<tr><td>M-Pesa Receipt</td><td>${paidPayment.mpesa_receipt}</td></tr>` : ''}
      <tr><td>Status</td><td><span class="badge">${isPaid ? 'Paid' : 'Pending'}</span></td></tr>
    </table>
    <div class="footer">
      <p>Premier Beauty Clinic · Ngong Road, Nairobi</p>
      <p style="margin-top:4px">Thank you for choosing us!</p>
    </div>
    <p style="text-align:center;margin-top:20px"><button onclick="window.print()">🖨 Print / Save PDF</button></p>
  </div>
  </body></html>`);
  win.document.close();
  win.focus();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardAppointments() {
  const { token, sessionId } = useStore();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [walkIns, setWalkIns]           = useState<WalkIn[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  // Appointment detail popup
  const [selectedApt, setSelectedApt]         = useState<ApiAppointment | null>(null);
  const [aptPractitioner, setAptPractitioner] = useState('');

  // Appointment check-in STK push state
  const [checkInPhone, setCheckInPhone]     = useState('');
  const [checkInStep, setCheckInStep]       = useState<'idle' | 'phone' | 'awaiting' | 'done' | 'failed'>('idle');
  const [checkInMsg, setCheckInMsg]         = useState('');
  const [completingId, setCompletingId]     = useState<string | null>(null);

  // Walk-in detail popup
  const [selectedWalkIn, setSelectedWalkIn] = useState<WalkIn | null>(null);

  // Walk-in detail — STK push state (collect payment for already-recorded walk-in)
  const [wkPayPhone, setWkPayPhone]         = useState('');
  const [wkPayStep, setWkPayStep]           = useState<'idle' | 'phone' | 'awaiting' | 'failed'>('idle');
  const [wkPayMsg, setWkPayMsg]             = useState('');
  const [wkCompletingId, setWkCompletingId] = useState<string | null>(null);

  // Walk-in creation modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeStep, setActiveStep]         = useState(1);
  const [walkinForm, setWalkinForm]         = useState(EMPTY_FORM);
  const [services, setServices]             = useState<ApiService[]>([]);
  const [isSubmitting, setIsSubmitting]     = useState(false);

  // Walk-in submission STK push state (inside the creation modal)
  const [walkinStkStep, setWalkinStkStep] = useState<'idle' | 'awaiting' | 'paid' | 'failed'>('idle');
  const [walkinStkMsg, setWalkinStkMsg]   = useState('');

  // Search + filter
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // ── Data fetching ──
  const fetchAppointments = async (showSpinner = false): Promise<ApiAppointment[]> => {
    if (showSpinner) setRefreshing(true);
    try {
      const data: ApiAppointment[] = await apiFetch('/admin/appointments', {}, token, sessionId);
      const list = data || [];
      setAppointments(list);
      return list;
    } catch {
      toast.error('Failed to load appointments');
      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWalkIns = async (): Promise<WalkIn[]> => {
    try {
      const data: WalkIn[] = await apiFetch('/admin/walkins', {}, token, sessionId);
      const list = data || [];
      setWalkIns(list);
      return list;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchWalkIns();
    apiFetch('/services', {}, token, sessionId)
      .then((data: ApiService[]) => setServices(data || []))
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-compute payment amount when service or date changes:
  //   today (or no date)  → full price
  //   future + deposit    → deposit amount
  //   future + no deposit → 0 (no payment)
  useEffect(() => {
    if (!walkinForm.service_id || services.length === 0) return;
    const svc = services.find(s => String(s.id) === walkinForm.service_id);
    if (!svc || !svc.base_price) return;
    const todayStr     = new Date().toISOString().slice(0, 10);
    const isForToday   = !walkinForm.appointment_date || walkinForm.appointment_date === todayStr;
    const depositPct   = svc.deposit_percentage ?? 0;
    const basePrice    = Number(svc.base_price);
    let amount = 0;
    if (isForToday)              amount = basePrice;
    else if (depositPct > 0)     amount = Math.round((basePrice * depositPct) / 100);
    setWalkinForm(prev => ({ ...prev, deposit_paid: String(amount) }));
  }, [walkinForm.service_id, walkinForm.appointment_date]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derived payment summary shown in Step 3
  const computedPayment = useMemo(() => {
    if (!walkinForm.service_id || services.length === 0) return null;
    const svc = services.find(s => String(s.id) === walkinForm.service_id);
    if (!svc || !svc.base_price) return null;
    const todayStr   = new Date().toISOString().slice(0, 10);
    const isForToday = !walkinForm.appointment_date || walkinForm.appointment_date === todayStr;
    const depositPct = svc.deposit_percentage ?? 0;
    const basePrice  = Number(svc.base_price);
    if (isForToday) {
      return { type: 'full' as const, amount: basePrice, balance: 0, label: 'Full payment (same-day appointment)' };
    } else if (depositPct > 0) {
      const dep = Math.round((basePrice * depositPct) / 100);
      return { type: 'deposit' as const, amount: dep, balance: basePrice - dep, label: `${depositPct}% deposit — balance KES ${(basePrice - dep).toLocaleString()} at clinic` };
    } else {
      return { type: 'none' as const, amount: 0, balance: basePrice, label: 'No advance payment — customer pays at clinic' };
    }
  }, [walkinForm.service_id, walkinForm.appointment_date, services]);

  // Unified list: online appointments + walk-ins sorted by time (newest first)
  const allBookings = useMemo(() => {
    const online  = appointments.map(a => ({ kind: 'online'  as const, apt: a, sortTime: a.appointment_time }));
    const walkins = walkIns.map(w =>     ({ kind: 'walkin'  as const, wk:  w, sortTime: w.appointment_time ?? w.created_at }));
    return [...online, ...walkins].sort((a, b) => new Date(b.sortTime).getTime() - new Date(a.sortTime).getTime());
  }, [appointments, walkIns]);

  // Filtered list: applies type filter + text search
  const filteredBookings = useMemo(() => {
    return allBookings.filter(booking => {
      // ── Type / status filter ──
      if (statusFilter === 'Online'  && booking.kind !== 'online') return false;
      if (statusFilter === 'Walk-in' && booking.kind !== 'walkin') return false;
      if (statusFilter === 'Active') {
        if (booking.kind === 'online' && !['pending', 'confirmed'].includes(booking.apt.status)) return false;
        if (booking.kind === 'walkin' && !['pending', 'paid'].includes(booking.wk.status)) return false;
      }
      if (statusFilter === 'Completed') {
        if (booking.kind === 'online' && booking.apt.status !== 'completed') return false;
        if (booking.kind === 'walkin' && booking.wk.status !== 'completed') return false;
      }
      // ── Text search ──
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      if (booking.kind === 'online') {
        const apt = booking.apt;
        return (
          (apt.profiles?.full_name || '').toLowerCase().includes(q) ||
          (apt.services?.name || '').toLowerCase().includes(q) ||
          (apt.profiles?.phone || '').toLowerCase().includes(q) ||
          toShortAptId(apt.appointment_number).toLowerCase().includes(q)
        );
      } else {
        const wk = booking.wk;
        return (
          wk.customer_name.toLowerCase().includes(q) ||
          (wk.services?.name || '').toLowerCase().includes(q) ||
          (wk.phone || '').toLowerCase().includes(q) ||
          toShortWalkInId(wk.walk_in_number).toLowerCase().includes(q)
        );
      }
    });
  }, [allBookings, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const todayApts      = appointments.filter(a => isToday(a.appointment_time)).length;
    const tomorrowApts   = appointments.filter(a => isTomorrow(a.appointment_time)).length;
    const weekApts       = appointments.filter(a => isThisWeek(a.appointment_time)).length;
    const pendingToday   = appointments.filter(a => isToday(a.appointment_time) && a.status === 'pending').length;
    const pendingTomorrow= appointments.filter(a => isTomorrow(a.appointment_time) && a.status === 'pending').length;
    const todayWalkIns   = walkIns.filter(w => isToday(w.created_at)).length;
    return { todayApts, tomorrowApts, weekApts, pendingToday, pendingTomorrow, todayWalkIns };
  }, [appointments, walkIns]);

  // ── Shared: payment status polling ──
  const pollPaymentStatus = async (checkoutRequestId: string): Promise<'paid' | 'failed' | 'timeout'> => {
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 3000));
      try {
        const data = await apiFetch(`/payment/status/${checkoutRequestId}`, {}, token, sessionId);
        if (data.status === 'paid')   return 'paid';
        if (data.status === 'failed') return 'failed';
      } catch { /* keep polling */ }
    }
    return 'timeout';
  };

  // ── Appointment: direct check-in (deposit already paid) ──
  const handleDirectCheckIn = async (apt: ApiAppointment, practitioner?: string) => {
    setCompletingId(apt.id);
    try {
      await apiFetch(
        `/admin/appointments/${apt.id}/complete`,
        { method: 'POST', body: JSON.stringify({ practitioner: practitioner || null }) },
        token, sessionId
      );
      const updated = { ...apt, status: 'completed', practitioner: practitioner || apt.practitioner || null };
      setAppointments(prev => prev.map(a => a.id === apt.id ? updated : a));
      if (selectedApt?.id === apt.id) setSelectedApt(updated);
      toast.success(`${apt.profiles?.full_name || 'Client'} checked in${practitioner ? ` — ${practitioner}` : ''}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to check in');
    } finally {
      setCompletingId(null);
    }
  };

  // ── Appointment: STK push check-in (zero-deposit or collect balance) ──
  const handleSendSTK = async () => {
    if (!selectedApt) return;
    const normalized = normalizeMpesaPhone(checkInPhone);
    if (!/^2547\d{8}$|^2541\d{8}$/.test(normalized)) {
      toast.error('Enter a valid Kenyan M-Pesa number (e.g. 0712345678)');
      return;
    }

    setCheckInStep('awaiting');
    setCheckInMsg('STK push sent — waiting for customer to confirm payment on their phone…');

    try {
      const data = await apiFetch(
        `/admin/appointments/${selectedApt.id}/checkin-pay`,
        { method: 'POST', body: JSON.stringify({ phone: normalized }) },
        token, sessionId
      );

      if (data.free) {
        setAppointments(prev => prev.map(a => a.id === selectedApt.id ? { ...a, status: 'completed' } : a));
        setSelectedApt(prev => prev ? { ...prev, status: 'completed' } : prev);
        setCheckInStep('done');
        setCheckInMsg('Appointment completed — no payment was required.');
        return;
      }

      const result = await pollPaymentStatus(data.checkout_request_id);
      if (result === 'paid') {
        const freshList = await fetchAppointments();
        const fresh = freshList.find(a => a.id === selectedApt.id);
        setSelectedApt(fresh ?? selectedApt);
        setCheckInStep('idle');
        toast.success('Payment confirmed! Now click "Check In Client" to complete the appointment.');
      } else if (result === 'failed') {
        await fetchAppointments();
        setCheckInStep('failed');
        setCheckInMsg('Payment was declined or cancelled by the customer. Tap "Try Again" to retry.');
      } else {
        setCheckInStep('failed');
        setCheckInMsg('Payment timed out. If the customer was charged, contact us with their M-Pesa receipt.');
      }
    } catch (err: any) {
      setCheckInStep('failed');
      setCheckInMsg(err.message || 'Failed to initiate payment.');
    }
  };

  const resetCheckIn = () => { setCheckInStep('idle'); setCheckInPhone(''); setCheckInMsg(''); };
  const handleCloseAptModal = () => { setSelectedApt(null); resetCheckIn(); setAptPractitioner(''); };

  // ── Walk-in detail: STK push (collect payment for already-recorded walk-in) ──
  const handleWalkInPay = async () => {
    if (!selectedWalkIn) return;
    const normalized = normalizeMpesaPhone(wkPayPhone);
    if (!/^2547\d{8}$|^2541\d{8}$/.test(normalized)) {
      toast.error('Enter a valid Kenyan M-Pesa number (e.g. 0712345678)');
      return;
    }

    setWkPayStep('awaiting');
    setWkPayMsg('STK push sent — waiting for customer to confirm payment on their phone…');

    try {
      const data = await apiFetch(
        `/admin/walkins/${selectedWalkIn.id}/pay`,
        { method: 'POST', body: JSON.stringify({ phone: normalized, amount: selectedWalkIn.deposit_paid }) },
        token, sessionId
      );

      const result = await pollPaymentStatus(data.checkout_request_id);
      if (result === 'paid') {
        const freshList = await fetchWalkIns();
        const fresh = freshList.find(w => w.id === selectedWalkIn.id);
        setSelectedWalkIn(fresh ?? { ...selectedWalkIn, status: 'paid' });
        setWkPayStep('idle');
        toast.success('Payment confirmed! You can now check in the client.');
      } else if (result === 'failed') {
        await fetchWalkIns();
        setWkPayStep('failed');
        setWkPayMsg('Payment was declined or cancelled. Tap "Try Again" to retry.');
      } else {
        setWkPayStep('failed');
        setWkPayMsg('Payment timed out. If the customer was charged, contact us with their M-Pesa receipt.');
      }
    } catch (err: any) {
      setWkPayStep('failed');
      setWkPayMsg(err.message || 'Failed to initiate payment.');
    }
  };

  const resetWkPay = () => { setWkPayStep('idle'); setWkPayPhone(''); setWkPayMsg(''); };
  const handleCloseWalkInModal = () => { setSelectedWalkIn(null); resetWkPay(); };

  // ── Walk-in detail: check-in (mark completed) ──
  const handleWalkInCheckIn = async (wk: WalkIn) => {
    setWkCompletingId(wk.id);
    try {
      await apiFetch(`/admin/walkins/${wk.id}/complete`, { method: 'POST' }, token, sessionId);
      setWalkIns(prev => prev.map(w => w.id === wk.id ? { ...w, status: 'completed' } : w));
      if (selectedWalkIn?.id === wk.id) setSelectedWalkIn({ ...wk, status: 'completed' });
      toast.success(`${wk.customer_name} checked in successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to check in');
    } finally {
      setWkCompletingId(null);
    }
  };

  // ── Walk-in: submission (with optional inline STK push) ──
  const handleSubmitWalkin = async () => {
    if (!walkinForm.customer_name.trim()) { toast.error('Customer name is required'); return; }
    if (!walkinForm.service_id)           { toast.error('Please select a service'); return; }

    setIsSubmitting(true);
    try {
      const notes = walkinForm.notes.trim() || null;
      let appointmentTime: string | null = null;
      if (walkinForm.appointment_date && walkinForm.appointment_time) {
        appointmentTime = new Date(`${walkinForm.appointment_date}T${walkinForm.appointment_time}:00`).toISOString();
      }

      const data = await apiFetch('/admin/walkin', {
        method: 'POST',
        body: JSON.stringify({
          customer_name:    walkinForm.customer_name.trim(),
          phone:            walkinForm.phone.trim() || null,
          email:            walkinForm.email.trim() || null,
          service_id:       Number(walkinForm.service_id),
          notes,
          practitioner:     walkinForm.practitioner || null,
          appointment_time: appointmentTime,
        }),
      }, token, sessionId);

      // Backend triggered an STK push — show waiting state inside the modal
      if (data.checkout_request_id) {
        setWalkinStkStep('awaiting');
        setWalkinStkMsg('STK push sent — waiting for customer to confirm payment on their phone…');

        const result = await pollPaymentStatus(data.checkout_request_id);
        if (result === 'paid') {
          setWalkinStkStep('paid');
          setWalkinStkMsg('Payment confirmed! Walk-in recorded successfully.');
          await Promise.all([fetchWalkIns(), fetchAppointments()]);
          setTimeout(() => {
            setIsAddModalOpen(false);
            setWalkinForm(EMPTY_FORM);
            setActiveStep(1);
            setWalkinStkStep('idle');
          }, 1800);
        } else if (result === 'failed') {
          await fetchWalkIns();
          setWalkinStkStep('failed');
          setWalkinStkMsg('Payment was declined or cancelled. You can retry or record the walk-in without payment.');
        } else {
          setWalkinStkStep('failed');
          setWalkinStkMsg('Payment timed out. Walk-in was recorded — collect payment manually or retry.');
          await fetchWalkIns();
        }
      } else {
        // No STK push (no phone/deposit) — just close
        toast.success(`Walk-in recorded for ${walkinForm.customer_name}`);
        await fetchWalkIns();
        setIsAddModalOpen(false);
        setWalkinForm(EMPTY_FORM);
        setActiveStep(1);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to record walk-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeWalkinCreationModal = () => {
    if (walkinStkStep === 'awaiting') return; // block close during active STK push
    setIsAddModalOpen(false);
    setWalkinForm(EMPTY_FORM);
    setActiveStep(1);
    setWalkinStkStep('idle');
    setWalkinStkMsg('');
  };

  const field = (key: keyof typeof EMPTY_FORM) => ({
    value:    walkinForm[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setWalkinForm(prev => ({ ...prev, [key]: e.target.value })),
  });

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Service Bookings</h1>
          <p className="text-gray-500">Loading appointments...</p>
        </div>
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#6D4C91] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[32px] font-serif font-bold italic mb-2">Service Bookings</h1>
          <p className="text-gray-500">Manage client appointments and clinic consultations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchAppointments(true); fetchWalkIns(); }}
            disabled={refreshing}
            className="bg-white text-black border border-gray-100 px-5 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center shadow-sm active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => { setIsAddModalOpen(true); setActiveStep(1); setWalkinForm(EMPTY_FORM); setWalkinStkStep('idle'); }}
            className="bg-[#6D4C91] text-white px-8 py-4 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] transition-all flex items-center shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Walk-in
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Today',       value: String(stats.todayApts),    sub: `${stats.pendingToday} Pending` },
          { label: 'Tomorrow',    value: String(stats.tomorrowApts), sub: `${stats.pendingTomorrow} Pending` },
          { label: 'This Week',   value: String(stats.weekApts),     sub: 'Total this week' },
          { label: "Today's Walk-ins", value: String(stats.todayWalkIns), sub: 'In-person visits' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
            <h3 className="text-[32px] font-bold mb-1">{stat.value}</h3>
            <p className="text-[12px] text-[#6D4C91] font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── All Appointments (online + walk-ins unified) ── */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-10 pt-8 pb-6 border-b border-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-serif font-bold">All Appointments</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Online bookings and walk-ins</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#6D4C91]/10 text-[#6D4C91] text-[11px] font-bold uppercase tracking-widest rounded-full">
                {appointments.length} online
              </span>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 text-[11px] font-bold uppercase tracking-widest rounded-full">
                {walkIns.length} walk-ins
              </span>
            </div>
          </div>
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, service, phone, or ID…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-full text-[13px] outline-none focus:ring-2 focus:ring-[#6D4C91]/20"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {(['All', 'Online', 'Walk-in', 'Active', 'Completed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                    statusFilter === f
                      ? 'bg-[#6D4C91] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Calendar className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <p className="text-[16px] font-serif mb-2">{searchTerm || statusFilter !== 'All' ? 'No results found' : 'No appointments yet'}</p>
            <p className="text-[13px]">{searchTerm || statusFilter !== 'All' ? 'Try a different search or filter.' : 'Online bookings and walk-ins will appear here.'}</p>
          </div>
        ) : (
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBookings.map((booking) => {
              if (booking.kind === 'online') {
                const apt             = booking.apt;
                const displayStatus   = mapAptStatus(apt.status);
                const receiptPayments = apt.payments?.filter(p => p.status === 'paid' && !!p.mpesa_receipt) ?? [];
                const depositPayment  = receiptPayments[0] ?? null;
                const balancePayment  = receiptPayments[1] ?? null;
                const hasDepositPaid  = !!depositPayment;
                const hasBalancePaid  = !!balancePayment;
                const isDepositBased  = apt.deposit_amount > 0;
                const paymentFailed   = apt.status === 'failed';
                const balanceDue      = apt.total_amount - apt.deposit_amount;
                const isZeroDeposit   = apt.deposit_amount === 0 && apt.total_amount > 0 && apt.status === 'confirmed' && !hasDepositPaid;

                return (
                  <div
                    key={apt.id}
                    onClick={() => { setSelectedApt(apt); resetCheckIn(); setAptPractitioner(apt.practitioner || ''); }}
                    className={`rounded-[32px] border flex flex-col cursor-pointer hover:shadow-xl transition-all group overflow-hidden ${paymentFailed ? 'bg-red-50 border-red-100' : 'bg-[#FDFBF7] border-gray-50'}`}
                  >
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${paymentFailed ? 'bg-red-100 text-red-400' : 'bg-white text-[#6D4C91]'}`}>
                          <Clock className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-[#6D4C91]/15 text-[#6D4C91]">
                            Online
                          </span>
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            displayStatus === 'Confirmed'  ? 'bg-green-500 text-white' :
                            displayStatus === 'Completed'  ? 'bg-[#6D4C91] text-white' :
                            displayStatus === 'Failed'     ? 'bg-red-500 text-white' :
                            displayStatus === 'Cancelled'  ? 'bg-red-400 text-white' :
                                                              'bg-amber-500 text-white'
                          }`}>
                            {displayStatus}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#6D4C91] mb-2">{toShortAptId(apt.appointment_number)}</p>
                      <h4 className="text-[18px] font-bold mb-2 leading-tight">{apt.services?.name || 'Service'}</h4>

                      <div className="flex items-center text-gray-400 text-[14px] mb-1">
                        <User className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{apt.profiles?.full_name || 'Unknown Client'}</span>
                      </div>
                      <div className="flex items-center text-gray-400 text-[13px] mb-1">
                        <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span>{formatAptDate(apt.appointment_time)} · {formatAptTime(apt.appointment_time)}</span>
                      </div>
                      {apt.profiles?.phone && (
                        <div className="flex items-center text-gray-400 text-[13px]">
                          <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span>{apt.profiles.phone}</span>
                        </div>
                      )}
                      {apt.practitioner && (
                        <div className="flex items-center text-[#6D4C91] text-[12px] mt-1">
                          <Stethoscope className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="font-medium">{apt.practitioner}</span>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                        {isDepositBased ? (
                          <>
                            <div className="flex justify-between items-center text-[13px]">
                              <span className="text-gray-400 font-medium">Deposit:</span>
                              {hasDepositPaid
                                ? <span className="font-bold text-green-600 text-[11px]">KES {apt.deposit_amount.toLocaleString()} ✓</span>
                                : <span className="font-medium text-amber-600 text-[11px]">KES {apt.deposit_amount.toLocaleString()} pending</span>
                              }
                            </div>
                            <div className="flex justify-between items-center text-[13px]">
                              <span className="text-gray-400 font-medium">Balance:</span>
                              {hasBalancePaid || apt.status === 'completed'
                                ? <span className="font-bold text-green-600 text-[11px]">KES {balanceDue.toLocaleString()} ✓</span>
                                : balanceDue > 0
                                  ? <span className="font-medium text-gray-500 text-[11px]">KES {balanceDue.toLocaleString()} at clinic</span>
                                  : <span className="font-bold text-green-600 text-[11px]">Fully settled</span>
                              }
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-gray-400 font-medium">{isZeroDeposit ? 'Full Payment:' : 'Payment:'}</span>
                            {apt.status === 'completed' || hasDepositPaid
                              ? <span className="font-bold text-green-600 text-[11px]">KES {apt.total_amount.toLocaleString()} ✓</span>
                              : paymentFailed
                                ? <span className="font-bold text-red-600 text-[11px]">Failed</span>
                                : <span className="font-medium text-gray-400 text-[11px]">{isZeroDeposit ? 'Collect at clinic' : 'Pending'}</span>
                            }
                          </div>
                        )}
                        {depositPayment?.mpesa_receipt && (
                          <p className="text-[10px] font-mono text-gray-400 truncate">{depositPayment.mpesa_receipt}</p>
                        )}
                      </div>
                    </div>
                    <div className="px-8 pb-6 mt-auto">
                      <div className="w-full bg-white border border-gray-100 rounded-xl py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400 group-hover:border-[#6D4C91]/30 group-hover:text-[#6D4C91] transition-all">
                        View Details
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Walk-in card
                const wk            = booking.wk;
                const displayStatus = mapWalkInStatus(wk.status);
                const paidPayment   = wk.payments?.find(p => p.status === 'paid' && !!p.mpesa_receipt) ?? null;
                const isPaid        = wk.status === 'paid' || wk.status === 'completed' || !!paidPayment;

                return (
                  <div
                    key={wk.id}
                    onClick={() => { setSelectedWalkIn(wk); resetWkPay(); }}
                    className="rounded-[32px] border bg-teal-50/40 border-teal-100/80 flex flex-col cursor-pointer hover:shadow-xl transition-all group overflow-hidden"
                  >
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-white text-teal-700">
                          <User className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-teal-600 text-white">
                            Walk-in
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                            displayStatus === 'Completed' ? 'bg-[#6D4C91] text-white' :
                            displayStatus === 'Paid'      ? 'bg-green-500 text-white' :
                                                            'bg-amber-500 text-white'
                          }`}>
                            {displayStatus}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700 mb-1">{toShortWalkInId(wk.walk_in_number)}</p>
                      <h4 className="text-[18px] font-bold mb-1 leading-tight">{wk.customer_name}</h4>
                      <p className="text-[13px] font-medium text-teal-700 mb-3">{wk.services?.name || 'Service not set'}</p>

                      {wk.phone && (
                        <div className="flex items-center text-gray-400 text-[13px] mb-1">
                          <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span>{wk.phone}</span>
                        </div>
                      )}
                      {wk.practitioner && (
                        <div className="flex items-center text-gray-400 text-[13px] mb-1">
                          <Stethoscope className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span>{wk.practitioner}</span>
                        </div>
                      )}
                      {wk.appointment_time ? (
                        <div className="flex items-center text-gray-400 text-[13px] mb-1">
                          <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span>{formatAptDate(wk.appointment_time)} · {formatAptTime(wk.appointment_time)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400 text-[13px] mb-1">
                          <Clock className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span>Recorded {formatAptDate(wk.created_at)}</span>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-teal-100 space-y-1.5">
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-gray-400 font-medium">{wk.deposit_paid > 0 ? 'Deposit:' : 'Payment:'}</span>
                          {isPaid
                            ? <span className="font-bold text-green-600 text-[11px]">KES {Number(wk.deposit_paid).toLocaleString()} ✓</span>
                            : wk.deposit_paid > 0
                              ? <span className="font-medium text-amber-600 text-[11px]">KES {Number(wk.deposit_paid).toLocaleString()} pending</span>
                              : <span className="text-gray-400 text-[11px]">Pay at clinic</span>
                          }
                        </div>
                        {paidPayment?.mpesa_receipt && (
                          <p className="text-[10px] font-mono text-gray-400 truncate">{paidPayment.mpesa_receipt}</p>
                        )}
                      </div>
                    </div>
                    <div className="px-8 pb-6 mt-auto">
                      <div className="w-full bg-white border border-teal-100 rounded-xl py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400 group-hover:border-teal-400/40 group-hover:text-teal-700 transition-all">
                        View Details
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════ APPOINTMENT DETAIL POPUP ══════════════════════ */}
      <AnimatePresence>
        {selectedApt && (() => {
          const apt              = selectedApt;
          const displayStatus    = mapAptStatus(apt.status);
          const receiptPayments  = apt.payments?.filter(p => p.status === 'paid' && !!p.mpesa_receipt) ?? [];
          const depositPayment   = receiptPayments[0] ?? null;
          const balancePayment   = receiptPayments[1] ?? null;
          const hasDepositPaid   = !!depositPayment;
          const hasBalancePaid   = !!balancePayment;
          const paymentFailed    = apt.status === 'failed';
          const isCompleted      = apt.status === 'completed';
          const isConfirmed      = apt.status === 'confirmed';
          const isDepositBased   = apt.deposit_amount > 0;
          const balanceDue       = apt.total_amount - apt.deposit_amount;
          const isZeroDeposit    = !isDepositBased && apt.total_amount > 0 && isConfirmed && !hasDepositPaid;
          const isZeroDepositPaid = !isDepositBased && apt.total_amount > 0 && isConfirmed && hasDepositPaid;
          const isAwaitingBalance = isDepositBased && isConfirmed && hasDepositPaid && !hasBalancePaid && balanceDue > 0;
          const canCheckIn = !isCompleted && isConfirmed && (
            isZeroDepositPaid ||
            (isDepositBased && hasDepositPaid && (hasBalancePaid || balanceDue === 0))
          );

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseAptModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl">

                <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-[#FDFBF7]">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#6D4C91] mb-1">{toShortAptId(apt.appointment_number)}</p>
                    <h2 className="text-[22px] font-serif mb-1">{apt.services?.name || 'Appointment'}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      displayStatus === 'Confirmed'  ? 'bg-green-100 text-green-700' :
                      displayStatus === 'Completed'  ? 'bg-[#6D4C91]/10 text-[#6D4C91]' :
                      displayStatus === 'Failed'     ? 'bg-red-100 text-red-700' :
                      displayStatus === 'Cancelled'  ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                    }`}>{displayStatus}</span>
                  </div>
                  <button onClick={handleCloseAptModal} className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Client</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#6D4C91]/10 flex items-center justify-center text-[#6D4C91] font-bold text-[13px]">
                          {(apt.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-[14px]">{apt.profiles?.full_name || 'Unknown'}</span>
                      </div>
                    </div>
                    {apt.profiles?.phone && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Phone</p>
                        <div className="flex items-center gap-2 text-[14px]">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{apt.profiles.phone}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Date</p>
                      <div className="flex items-center gap-2 text-[14px]">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatAptDate(apt.appointment_time)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Time</p>
                      <div className="flex items-center gap-2 text-[14px]">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{formatAptTime(apt.appointment_time)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-gray-50 space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Payment Details
                    </p>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-gray-500">Total Fee</span>
                      <span className="font-bold">KES {apt.total_amount.toLocaleString()}</span>
                    </div>
                    {isDepositBased ? (
                      <>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-gray-500">Deposit</span>
                          <span className={`font-bold ${hasDepositPaid ? 'text-green-600' : 'text-amber-600'}`}>
                            KES {apt.deposit_amount.toLocaleString()} {hasDepositPaid ? '✓' : '(pending)'}
                          </span>
                        </div>
                        {depositPayment?.mpesa_receipt && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-gray-500">Deposit Receipt</span>
                            <span className="font-mono font-bold text-[#6D4C91] text-[12px]">{depositPayment.mpesa_receipt}</span>
                          </div>
                        )}
                        {balanceDue > 0 && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-gray-500">Balance Due</span>
                            <span className={`font-bold ${hasBalancePaid || isCompleted ? 'text-green-600' : 'text-amber-600'}`}>
                              {hasBalancePaid || isCompleted ? 'KES 0 — Fully Settled' : `KES ${balanceDue.toLocaleString()}`}
                            </span>
                          </div>
                        )}
                        {balancePayment?.mpesa_receipt && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-gray-500">Balance Receipt</span>
                            <span className="font-mono font-bold text-[#6D4C91] text-[12px]">{balancePayment.mpesa_receipt}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-gray-500">Full Payment</span>
                          <span className={`font-bold ${hasDepositPaid || isCompleted ? 'text-green-600' : 'text-amber-600'}`}>
                            {hasDepositPaid || isCompleted ? `KES ${apt.total_amount.toLocaleString()} ✓` : 'Collect at clinic'}
                          </span>
                        </div>
                        {depositPayment?.mpesa_receipt && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-gray-500">M-Pesa Receipt</span>
                            <span className="font-mono font-bold text-[#6D4C91]">{depositPayment.mpesa_receipt}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-[13px] text-gray-500">Payment Status</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        isCompleted || (!isDepositBased && hasDepositPaid) || (isDepositBased && hasBalancePaid)
                          ? 'bg-green-100 text-green-700'
                          : isDepositBased && hasDepositPaid
                            ? 'bg-blue-100 text-blue-700'
                            : paymentFailed
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isCompleted || (!isDepositBased && hasDepositPaid) || (isDepositBased && hasBalancePaid)
                          ? 'Fully Paid'
                          : isDepositBased && hasDepositPaid
                            ? 'Deposit Paid'
                            : paymentFailed ? 'Failed' : 'Pending'}
                      </span>
                    </div>
                    {paymentFailed && apt.payments?.[0]?.failure_reason && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[12px] text-red-700">
                        ⚠ {apt.payments[0].failure_reason}
                      </div>
                    )}
                  </div>

                  {/* Practitioner assignment — visible on confirmed and completed appointments */}
                  {(isConfirmed || isCompleted) && (
                    <div className="p-5 rounded-2xl bg-gray-50 space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Assigned Practitioner</p>
                      {isCompleted && apt.practitioner ? (
                        <p className="font-bold text-[14px] text-[#6D4C91]">{apt.practitioner}</p>
                      ) : isCompleted ? (
                        <p className="text-[13px] text-gray-400 italic">None assigned</p>
                      ) : (
                        <select
                          value={aptPractitioner}
                          onChange={e => setAptPractitioner(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]"
                        >
                          <option value="">Select practitioner (optional)</option>
                          {PRACTITIONERS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      )}
                    </div>
                  )}

                  {/* STK push section: collect balance or zero-deposit full payment */}
                  {(isZeroDeposit || isAwaitingBalance) && (
                    <div className="p-5 rounded-2xl border border-[#6D4C91]/20 bg-[#6D4C91]/5 space-y-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#6D4C91] flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        {isAwaitingBalance ? 'Collect Balance via M-Pesa' : 'Collect Full Payment via M-Pesa'}
                      </p>
                      <p className="text-[13px] text-gray-600">
                        {isAwaitingBalance
                          ? <>Deposit paid. Enter the customer's phone to collect the remaining <strong>KES {balanceDue.toLocaleString()}</strong>.</>
                          : <>No upfront deposit required. Enter the customer's phone to send an STK push for <strong>KES {apt.total_amount.toLocaleString()}</strong>.</>
                        }
                      </p>
                      {checkInStep === 'idle' && (
                        <button onClick={() => setCheckInStep('phone')} className="w-full bg-[#6D4C91] text-white py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] active:scale-95 transition-all">
                          Collect Payment Now
                        </button>
                      )}
                      {checkInStep === 'phone' && (
                        <div className="space-y-3">
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="tel" value={checkInPhone} onChange={e => setCheckInPhone(e.target.value)} placeholder="07XX XXX XXX" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={resetCheckIn} className="flex-1 py-3 border border-gray-200 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">Cancel</button>
                            <button onClick={handleSendSTK} disabled={!checkInPhone.trim()} className="flex-1 bg-[#6D4C91] text-white py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#5a3e79] disabled:opacity-50 active:scale-95 transition-all">
                              Send STK Push
                            </button>
                          </div>
                        </div>
                      )}
                      {checkInStep === 'awaiting' && (
                        <div className="flex items-center gap-3 text-[13px] text-[#6D4C91]">
                          <div className="w-5 h-5 border-2 border-[#6D4C91] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          <span>{checkInMsg}</span>
                        </div>
                      )}
                      {checkInStep === 'done' && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl text-[13px] text-green-700">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                          <span>{checkInMsg}</span>
                        </div>
                      )}
                      {checkInStep === 'failed' && (
                        <div className="space-y-2">
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[12px] text-red-700">⚠ {checkInMsg}</div>
                          <button onClick={resetCheckIn} className="w-full py-2.5 border border-gray-200 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">Try Again</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-8 bg-gray-50 flex gap-3">
                  {(depositPayment?.mpesa_receipt || isCompleted) && (
                    <button onClick={() => printAptReceipt(apt, logoUrl)} className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all">
                      <Printer className="w-4 h-4" /> Receipt
                    </button>
                  )}
                  {canCheckIn && (
                    <button onClick={() => handleDirectCheckIn(apt, aptPractitioner || undefined)} disabled={completingId === apt.id} className="flex-1 bg-[#1A1A1A] text-white py-4 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                      {completingId === apt.id
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <><Check className="w-4 h-4" /> Check In{aptPractitioner ? ` — ${aptPractitioner.split(' ').slice(-1)[0]}` : ''}</>
                      }
                    </button>
                  )}
                  {isCompleted && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-green-50 border border-green-100 rounded-full text-[12px] font-bold uppercase tracking-widest text-green-700">
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Checked In</div>
                      {apt.practitioner && <span className="text-[10px] text-green-600 normal-case font-normal">{apt.practitioner}</span>}
                    </div>
                  )}
                  {paymentFailed && (
                    <div className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-50 border border-red-100 rounded-full text-[12px] font-bold uppercase tracking-widest text-red-600">
                      Payment Failed — No Check In
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ══════════════════════ WALK-IN DETAIL POPUP ══════════════════════ */}
      <AnimatePresence>
        {selectedWalkIn && (() => {
          const wk            = selectedWalkIn;
          const displayStatus = mapWalkInStatus(wk.status);
          const paidPayment   = wk.payments?.find(p => p.status === 'paid' && !!p.mpesa_receipt) ?? null;
          const isPaid        = wk.status === 'paid' || wk.status === 'completed' || !!paidPayment;
          const isCompleted   = wk.status === 'completed';

          // ── Smart payment computation ────────────────────────────────────────
          const wkBasePrice  = Number(wk.services?.base_price) || 0;
          const wkDepositPct = wk.services?.deposit_percentage ?? 0;
          const wkIsToday    = !wk.appointment_time || isToday(wk.appointment_time);
          // same-day → full price always; future + deposit → deposit only; future + no-deposit → 0
          const wkCollectAmt = Number(wk.deposit_paid) || 0; // backend already computed the right amount
          const wkIsFullPmt  = wkIsToday;                    // full payment for same-day
          const wkBalance    = wkIsFullPmt ? 0 : Math.max(0, wkBasePrice - wkCollectAmt);
          const wkPayLabel   = wkIsFullPmt ? 'Full Payment' : (wkDepositPct > 0 ? 'Deposit' : 'Payment');
          const wkNoPayment  = wkCollectAmt === 0 && !isPaid; // future + no-deposit service

          const canCollect = !isPaid && !!wk.phone && wkCollectAmt > 0;
          const canCheckIn = isPaid && !isCompleted;

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseWalkInModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl">

                <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-teal-50/60">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700 mb-1">{toShortWalkInId(wk.walk_in_number)}</p>
                    <h2 className="text-[22px] font-serif mb-1">{wk.customer_name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-teal-600 text-white">Walk-in</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        displayStatus === 'Completed' ? 'bg-[#6D4C91]/10 text-[#6D4C91]' :
                        displayStatus === 'Paid'      ? 'bg-green-100 text-green-700' :
                                                        'bg-amber-100 text-amber-700'
                      }`}>{displayStatus}</span>
                    </div>
                  </div>
                  <button onClick={handleCloseWalkInModal} className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto">

                  {/* Client info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Service</p>
                      <p className="font-bold text-[14px]">{wk.services?.name || 'Not set'}</p>
                    </div>
                    {wk.phone && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Phone</p>
                        <div className="flex items-center gap-2 text-[14px]">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{wk.phone}</span>
                        </div>
                      </div>
                    )}
                    {wk.practitioner && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Practitioner</p>
                        <div className="flex items-center gap-2 text-[14px]">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          <span>{wk.practitioner}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Date/time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        {wk.appointment_time ? 'Appointment' : 'Recorded'}
                      </p>
                      <div className="flex items-center gap-2 text-[14px]">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatAptDate(wk.appointment_time ?? wk.created_at)}</span>
                      </div>
                    </div>
                    {wk.appointment_time && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Time</p>
                        <div className="flex items-center gap-2 text-[14px]">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{formatAptTime(wk.appointment_time)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {wk.notes && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Notes</p>
                      <p className="text-[13px] text-gray-600 leading-relaxed">{wk.notes}</p>
                    </div>
                  )}

                  {/* Payment */}
                  <div className="p-5 rounded-2xl bg-gray-50 space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Payment
                    </p>
                    {wkNoPayment ? (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Payment</span>
                        <span className="font-bold text-blue-600">Pay at clinic</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-gray-500">{wkPayLabel}</span>
                          <span className={`font-bold ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                            KES {wkCollectAmt.toLocaleString()}
                            {isPaid ? ' ✓' : ''}
                          </span>
                        </div>
                        {wkBalance > 0 && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-gray-500">Balance at clinic</span>
                            <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                              KES {wkBalance.toLocaleString()}{isCompleted ? ' ✓' : ''}
                            </span>
                          </div>
                        )}
                        {wkBasePrice > 0 && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-gray-500">Service Total</span>
                            <span className="text-gray-500">KES {wkBasePrice.toLocaleString()}</span>
                          </div>
                        )}
                      </>
                    )}
                    {paidPayment?.mpesa_receipt && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">M-Pesa Receipt</span>
                        <span className="font-mono font-bold text-teal-700 text-[12px]">{paidPayment.mpesa_receipt}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-[13px] text-gray-500">Status</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        isCompleted ? 'bg-[#6D4C91]/10 text-[#6D4C91]' :
                        isPaid      ? 'bg-green-100 text-green-700' :
                        wkNoPayment ? 'bg-blue-100 text-blue-700' :
                                      'bg-amber-100 text-amber-700'
                      }`}>
                        {isCompleted ? 'Completed' : isPaid ? 'Paid' : wkNoPayment ? 'Pay at Clinic' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* No-payment info (future date + no-deposit service) */}
                  {wkNoPayment && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                      <CreditCard className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[13px] text-blue-700 leading-relaxed">
                        No advance payment required. Customer pays the full <strong>KES {wkBasePrice.toLocaleString()}</strong> at the clinic on their appointment day.
                        {wk.email ? ` A booking confirmation was sent to ${wk.email}.` : ''}
                      </p>
                    </div>
                  )}

                  {/* Collect payment via STK push */}
                  {canCollect && (
                    <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/60 space-y-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        {wkIsFullPmt ? 'Collect Full Payment via M-Pesa' : 'Collect Deposit via M-Pesa'}
                      </p>
                      <p className="text-[13px] text-gray-600">
                        Send an STK push to collect <strong>KES {wkCollectAmt.toLocaleString()}</strong>
                        {wkIsFullPmt
                          ? ' (full service payment).'
                          : wkBalance > 0
                            ? `. Balance of KES ${wkBalance.toLocaleString()} will be collected at the clinic.`
                            : '.'
                        }
                      </p>

                      {wkPayStep === 'idle' && (
                        <button onClick={() => setWkPayStep('phone')} className="w-full bg-teal-700 text-white py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-teal-800 active:scale-95 transition-all">
                          Collect Payment Now
                        </button>
                      )}
                      {wkPayStep === 'phone' && (
                        <div className="space-y-3">
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="tel"
                              value={wkPayPhone}
                              onChange={e => setWkPayPhone(e.target.value)}
                              placeholder={wk.phone ?? '07XX XXX XXX'}
                              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-[14px]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={resetWkPay} className="flex-1 py-3 border border-gray-200 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">Cancel</button>
                            <button onClick={handleWalkInPay} disabled={!wkPayPhone.trim()} className="flex-1 bg-teal-700 text-white py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-teal-800 disabled:opacity-50 active:scale-95 transition-all">
                              Send STK Push
                            </button>
                          </div>
                        </div>
                      )}
                      {wkPayStep === 'awaiting' && (
                        <div className="flex items-center gap-3 text-[13px] text-teal-700">
                          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          <span>{wkPayMsg}</span>
                        </div>
                      )}
                      {wkPayStep === 'failed' && (
                        <div className="space-y-2">
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[12px] text-red-700">⚠ {wkPayMsg}</div>
                          <button onClick={resetWkPay} className="w-full py-2.5 border border-gray-200 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">Try Again</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-8 bg-gray-50 flex gap-3">
                  {(isPaid || isCompleted) && (
                    <button onClick={() => printWalkInReceipt(wk, logoUrl)} className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all">
                      <Printer className="w-4 h-4" /> Receipt
                    </button>
                  )}
                  {canCheckIn && (
                    <button
                      onClick={() => handleWalkInCheckIn(wk)}
                      disabled={wkCompletingId === wk.id}
                      className="flex-1 bg-[#1A1A1A] text-white py-4 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-teal-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {wkCompletingId === wk.id
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <><Check className="w-4 h-4" /> Check In Client</>
                      }
                    </button>
                  )}
                  {isCompleted && (
                    <div className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-50 border border-green-100 rounded-full text-[12px] font-bold uppercase tracking-widest text-green-700">
                      <CheckCircle2 className="w-4 h-4" /> Checked In
                    </div>
                  )}
                  {!isPaid && !canCollect && !isCompleted && (
                    <div className="flex-1 flex items-center justify-center py-4 text-[12px] text-gray-400 font-medium">
                      {wkNoPayment
                        ? 'Customer pays at clinic — no M-Pesa required'
                        : 'No phone on record — collect payment manually'}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ══════════════════════ WALK-IN CREATION MODAL ══════════════════════ */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeWalkinCreationModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl">

              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="text-[24px] font-serif mb-1">New Walk-in</h2>
                  <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">
                    {walkinStkStep !== 'idle' ? 'Processing Payment' : `Step ${activeStep} of 3`}
                  </p>
                </div>
                <button
                  onClick={closeWalkinCreationModal}
                  disabled={walkinStkStep === 'awaiting'}
                  className="p-2 bg-white rounded-full border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all disabled:opacity-30"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 max-h-[65vh] overflow-y-auto">
                {/* Step 1 — Client Info */}
                {activeStep === 1 && walkinStkStep === 'idle' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Client Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Customer Name *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input {...field('customer_name')} placeholder="Full name" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input {...field('phone')} placeholder="+254 XXX XXX XXX" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                        <div className="relative">
                          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          <input {...field('email')} type="email" placeholder="customer@example.com" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]" />
                        </div>
                        <p className="text-[10px] text-gray-400">For booking confirmation and payment receipt emails</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Client Notes / Concerns</label>
                      <textarea {...field('notes')} rows={3} placeholder="Any specific skin concerns or medical history..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px] resize-none" />
                    </div>
                  </motion.div>
                )}

                {/* Step 2 — Service Details */}
                {activeStep === 2 && walkinStkStep === 'idle' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Service Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Service *</label>
                        <select {...field('service_id')} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]">
                          <option value="">Select Service</option>
                          {services.map(s => (
                            <option key={s.id} value={String(s.id)}>
                              {s.name}{s.base_price ? ` — KES ${Number(s.base_price).toLocaleString()}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Practitioner</label>
                        <select {...field('practitioner')} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]">
                          <option value="">Assign Practitioner</option>
                          {PRACTITIONERS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="date" {...field('appointment_date')} min={new Date().toISOString().slice(0, 10)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Time</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select {...field('appointment_time')} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6D4C91]/20 text-[14px]">
                            {['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3 — Payment summary + STK push states */}
                {activeStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    {walkinStkStep === 'idle' && (
                      <>
                        <h3 className="text-[18px] font-serif border-b border-gray-100 pb-4">Payment Summary</h3>

                        {/* Computed payment summary — read-only, driven by service + date */}
                        {computedPayment ? (
                          <div className={`p-5 rounded-2xl border space-y-3 ${
                            computedPayment.type === 'none'
                              ? 'bg-blue-50/60 border-blue-100'
                              : 'bg-[#6D4C91]/5 border-[#6D4C91]/20'
                          }`}>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                              {computedPayment.type === 'full'    ? 'Full Payment Due' :
                               computedPayment.type === 'deposit' ? 'Deposit Required' :
                                                                    'No Payment Required'}
                            </p>
                            {computedPayment.type !== 'none' ? (
                              <>
                                <p className="text-[28px] font-bold text-[#6D4C91]">KES {computedPayment.amount.toLocaleString()}</p>
                                <p className="text-[12px] text-gray-500">{computedPayment.label}</p>
                                {computedPayment.type === 'deposit' && computedPayment.balance > 0 && (
                                  <p className="text-[12px] text-gray-500">
                                    Balance of <strong>KES {computedPayment.balance.toLocaleString()}</strong> payable at the clinic on the day.
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <p className="text-[14px] font-medium text-blue-700">{computedPayment.label}</p>
                                {walkinForm.email.trim() && (
                                  <p className="text-[12px] text-blue-600">
                                    A booking confirmation email will be sent to <strong>{walkinForm.email}</strong>.
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-[13px] text-amber-700">
                            Please complete Steps 1 &amp; 2 to calculate payment.
                          </div>
                        )}

                        {/* STK push preview — only when phone + payment amount > 0 */}
                        {walkinForm.phone.trim() && Number(walkinForm.deposit_paid) > 0 && (
                          <div className="flex items-start gap-3 p-4 bg-[#6D4C91]/5 border border-[#6D4C91]/20 rounded-xl">
                            <Smartphone className="w-5 h-5 text-[#6D4C91] flex-shrink-0 mt-0.5" />
                            <p className="text-[12px] text-[#6D4C91] font-medium leading-relaxed">
                              An M-Pesa STK push for <strong>KES {Number(walkinForm.deposit_paid).toLocaleString()}</strong> will be sent to <strong>{walkinForm.phone}</strong> after confirming.
                            </p>
                          </div>
                        )}
                        <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-100">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <p className="text-[12px] text-green-700 font-medium">Walk-in will be recorded immediately on confirmation.</p>
                        </div>
                      </>
                    )}

                    {walkinStkStep === 'awaiting' && (
                      <div className="py-8 flex flex-col items-center gap-4 text-center">
                        <div className="w-14 h-14 border-4 border-[#6D4C91] border-t-transparent rounded-full animate-spin" />
                        <p className="text-[15px] font-bold text-[#6D4C91]">Waiting for Payment</p>
                        <p className="text-[13px] text-gray-500 max-w-xs">{walkinStkMsg}</p>
                      </div>
                    )}

                    {walkinStkStep === 'paid' && (
                      <div className="py-8 flex flex-col items-center gap-4 text-center">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-[15px] font-bold text-green-700">Payment Confirmed!</p>
                        <p className="text-[13px] text-gray-500">{walkinStkMsg}</p>
                      </div>
                    )}

                    {walkinStkStep === 'failed' && (
                      <div className="py-4 space-y-4">
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700">
                          ⚠ {walkinStkMsg}
                        </div>
                        <p className="text-[12px] text-gray-500 text-center">The walk-in has been recorded. You can collect payment later from the walk-in's detail view.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Modal footer */}
              <div className="p-8 bg-gray-50 flex justify-between items-center">
                {walkinStkStep === 'idle' ? (
                  <>
                    <button disabled={activeStep === 1} onClick={() => setActiveStep(p => p - 1)} className="px-8 py-4 text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-black disabled:opacity-30 transition-all">Back</button>
                    {activeStep < 3 ? (
                      <button onClick={() => setActiveStep(p => p + 1)} className="bg-[#6D4C91] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-[#5a3e79] active:scale-95 transition-all flex items-center shadow-lg">
                        Continue <ChevronRight className="w-4 h-4 ml-2" />
                      </button>
                    ) : (
                      <button onClick={handleSubmitWalkin} disabled={isSubmitting} className="bg-green-600 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-green-700 active:scale-95 transition-all flex items-center shadow-lg disabled:opacity-50">
                        {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Recording…</> : <><Check className="w-4 h-4 mr-2" />Confirm Walk-in</>}
                      </button>
                    )}
                  </>
                ) : walkinStkStep === 'awaiting' ? (
                  <p className="w-full text-center text-[12px] text-gray-400 font-medium">Please wait — do not close this window</p>
                ) : walkinStkStep === 'paid' ? (
                  <button onClick={closeWalkinCreationModal} className="w-full bg-green-600 text-white py-4 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-green-700 active:scale-95 transition-all">
                    Close
                  </button>
                ) : /* failed */ (
                  <div className="w-full flex gap-3">
                    <button
                      onClick={() => setWalkinStkStep('idle')}
                      className="flex-1 py-4 border border-gray-200 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                    >
                      Retry Payment
                    </button>
                    <button onClick={closeWalkinCreationModal} className="flex-1 bg-[#1A1A1A] text-white py-4 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#6D4C91] transition-all">
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
