import { SITE_NAME, SUPPORT_EMAIL } from '@/lib/site';
export const metadata = { title: 'Privacy Policy', alternates: { canonical: '/privacy' } };
export default function Privacy() {
  return (
    <div className="wrap section prose" style={{ maxWidth: 760 }}>
      <h1>Privacy Policy</h1>
      <p>This policy explains what {SITE_NAME} collects and how it is used. Please review it with a legal advisor before launch.</p>
      <h2>What we collect</h2>
      <ul>
        <li><b>Your mobile number</b>, verified by OTP, to create your account. Our team may call or message you about your account, your listings or places you asked about.</li>
        <li><b>Your name</b> and, optionally, email and WhatsApp number.</li>
        <li><b>Listing details</b> hosts add: rent, area, photos, contact details and private address.</li>
        <li><b>Inquiries</b>: when you reveal an owner’s number we record it, and share your name and number with that owner.</li>
      </ul>
      <h2>Who sees what</h2>
      <p>Owners’ numbers are shown only to logged-in users who ask for them. The full address a host enters is visible only to our team. We do not sell your data.</p>
      <h2>Your choices</h2>
      <p>You can edit your profile any time and delete your listings from the host dashboard. To delete your account, contact us{SUPPORT_EMAIL ? ` at ${SUPPORT_EMAIL}` : ''}.</p>
      <h2>Services we use</h2>
      <p>Google Firebase sends and verifies OTPs. Supabase stores account and listing data and photos.</p>
    </div>
  );
}
