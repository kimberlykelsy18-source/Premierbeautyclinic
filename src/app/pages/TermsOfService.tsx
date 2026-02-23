export function TermsOfService() {
  // In production, this content will be managed by employees from their portal
  const content = `
Last Updated: February 23, 2026

Welcome to Premier Beauty Clinic. By accessing and using our website and services, you agree to be bound by these Terms of Service.

**Acceptance of Terms**

By creating an account, making a purchase, or booking a service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.

**Eligibility**

You must be at least 18 years old to use our services. By using our website, you represent and warrant that you meet this age requirement.

**Account Responsibilities**

- You are responsible for maintaining the confidentiality of your account credentials
- You agree to provide accurate and complete information
- You must notify us immediately of any unauthorized use of your account
- You are responsible for all activities under your account

**Orders and Payments**

- All prices are listed in Kenyan Shillings (KES) unless otherwise stated
- We accept M-Pesa, Visa, and Debit Card payments
- Orders are subject to product availability
- We reserve the right to refuse or cancel orders at our discretion
- Payment must be received before products are shipped

**Service Bookings**

- A deposit is required to secure service appointments
- Cancellations must be made at least 24 hours in advance for a refund
- Late cancellations or no-shows forfeit the deposit
- Rescheduling is allowed up to 24 hours before the appointment

**Shipping and Delivery**

- Shipping fees vary by location and will be calculated at checkout
- Delivery times are estimates and not guaranteed
- Risk of loss passes to you upon delivery
- You are responsible for providing accurate shipping information

**Returns and Refunds**

- Unopened products can be returned within 14 days of purchase
- Products must be in original condition with all packaging
- Opened products can only be returned if defective
- Refunds will be processed within 7-10 business days
- Shipping costs are non-refundable unless the return is due to our error

**Product Information**

- We strive to provide accurate product descriptions and images
- Colors may vary slightly due to monitor settings
- We do not warrant that product descriptions are error-free
- Consult with a dermatologist before using products if you have skin concerns

**Intellectual Property**

All content on this website, including text, graphics, logos, and images, is the property of Premier Beauty Clinic and protected by copyright laws.

**Limitation of Liability**

Premier Beauty Clinic shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our products or services.

**Prohibited Activities**

You may not:
- Use our website for any unlawful purpose
- Attempt to interfere with website functionality
- Impersonate another person or entity
- Transmit viruses or malicious code
- Harvest data from the website

**Modifications**

We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use constitutes acceptance of modified terms.

**Governing Law**

These Terms are governed by the laws of Kenya. Any disputes shall be resolved in the courts of Kenya.

**Contact Information**

For questions about these Terms of Service:
- Email: admin@premierbeautyclinic.com
- Phone: +254 707 259 295
- Location: Karibu Mall, Kilimani, 1st Floor

**Severability**

If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.

By using our website and services, you acknowledge that you have read and understood these Terms of Service.
  `;

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[36px] md:text-[48px] lg:text-[64px] font-serif italic mb-6 md:mb-8 text-center">
          Terms of Service
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