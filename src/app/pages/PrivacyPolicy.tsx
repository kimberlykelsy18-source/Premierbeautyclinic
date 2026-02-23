export function PrivacyPolicy() {
  // In production, this content will be managed by employees from their portal
  const content = `
Last Updated: February 23, 2026

At Premier Beauty Clinic, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.

**Information We Collect**

We collect information that you provide directly to us, including:
- Personal identification information (name, email address, phone number)
- Shipping and billing addresses
- Payment information
- Skin type and product preferences
- Service booking details

**How We Use Your Information**

We use the information we collect to:
- Process your orders and payments
- Schedule and manage service appointments
- Send you promotional emails (you can opt out anytime)
- Improve our products and services
- Respond to your customer service requests
- Comply with legal obligations

**Information Sharing**

We do not sell or rent your personal information to third parties. We may share your information with:
- Payment processors (M-Pesa, Visa, etc.)
- Shipping partners for order delivery
- Service providers who assist our business operations

**Data Security**

We implement appropriate security measures to protect your personal information. All payment transactions are encrypted using 256-bit SSL technology.

**Your Rights**

You have the right to:
- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Opt out of marketing communications
- Update your preferences in your account settings

**Cookies**

We use cookies to enhance your browsing experience and analyze site traffic. You can control cookie preferences through your browser settings.

**Contact Us**

If you have questions about this Privacy Policy, please contact us:
- Email: admin@premierbeautyclinic.com
- Phone: +254 707 259 295
- Location: Karibu Mall, Kilimani, 1st Floor

**Changes to This Policy**

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated "Last Updated" date.
  `;

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[36px] md:text-[48px] lg:text-[64px] font-serif italic mb-6 md:mb-8 text-center">
          Privacy Policy
        </h1>
        
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 border border-gray-100">
          <div className="prose prose-sm md:prose-lg max-w-none">
            <div className="text-gray-600 text-[13px] md:text-[15px] leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-8 text-center">
          <p className="text-gray-400 text-[11px] md:text-[13px]">
            This content is managed by Premier Beauty Clinic staff.
          </p>
        </div>
      </div>
    </div>
  );
}