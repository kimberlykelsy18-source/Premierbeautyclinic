// Builds the pre-filled wa.me deep links used by the WhatsApp checkout/booking
// handoff. Pure functions, no DB access — single source of truth for message
// copy so both /checkout/whatsapp and /appointments/book-whatsapp stay in sync.

// Same number used site-wide by WhatsAppButton.tsx / TreatmentDetail.tsx / SkinConcernPage.tsx
const CLINIC_WHATSAPP_NUMBER = '254768679646';

function buildWhatsAppUrl(message) {
  return `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// 2547XXXXXXXX / 2541XXXXXXXX -> 07XXXXXXXX / 01XXXXXXXX for readability in the message text
function toLocalPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if ((digits.startsWith('2547') || digits.startsWith('2541')) && digits.length === 12) {
    return '0' + digits.slice(3);
  }
  return phone;
}

// Mirrors DashboardOrders.tsx's formatAddress() so the WhatsApp text and the
// staff dashboard agree on how an address renders.
function formatDeliveryLine(shipping) {
  if (!shipping) return '—';
  if (shipping.raw) return shipping.raw;
  return [shipping.street, shipping.building, shipping.city, shipping.county].filter(Boolean).join(', ') || '—';
}

function buildOrderMessage({ customerName, phone, deliveryLine, items, subtotal, shippingFee, total, orderRef }) {
  const itemLines = items.map(i => `• ${i.name} x${i.quantity} — KES ${(i.price * i.quantity).toLocaleString()}`).join('\n');
  return `🛍️ New Order Request

Customer: ${customerName}
Phone: ${toLocalPhone(phone)}
Delivery: ${deliveryLine}

Order:
${itemLines}

Subtotal: KES ${subtotal.toLocaleString()}
Shipping: KES ${shippingFee.toLocaleString()}
Total: KES ${total.toLocaleString()}

Order #${orderRef} — please confirm to proceed.`;
}

function buildBookingMessage({ customerName, phone, serviceName, dateLabel, priceKes, aptRef }) {
  const priceLine = priceKes != null
    ? `Price: KES ${priceKes.toLocaleString()}`
    : `Pricing: To be confirmed at consultation`;
  return `💆 New Booking Request

Customer: ${customerName}
Phone: ${toLocalPhone(phone)}

Service: ${serviceName}
Date: ${dateLabel}
${priceLine}

Booking #${aptRef} — please confirm to proceed.`;
}

module.exports = { buildWhatsAppUrl, buildOrderMessage, buildBookingMessage, formatDeliveryLine, toLocalPhone };
