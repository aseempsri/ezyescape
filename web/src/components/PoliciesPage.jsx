import { useEffect } from 'react';
import SiteChrome from './SiteChrome';
import { contactPath } from '../utils/paths';

const UPDATED = '26 September 2026';

const SECTIONS = [
  { id: 'terms', label: 'Terms' },
  { id: 'booking', label: 'Bookings' },
  { id: 'payment', label: 'Payment & coins' },
  { id: 'cancellation', label: 'Cancellation' },
  { id: 'admission', label: 'Admission' },
  { id: 'disclaimer', label: 'Disclaimer' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'data', label: 'Personal data' },
];

export default function PoliciesPage({ focus = '' }) {
  useEffect(() => {
    const id = focus || window.location.hash.replace('#', '');
    if (!id) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [focus]);

  return (
    <SiteChrome
      title="Terms, Privacy & Guest Policies — Ezy Escape"
      description="Terms of use, booking rules, privacy policy, and how Ezy Escape uses personal data for mountain homestay requests in Kumaon."
      path="/policies"
    >
      <section className="sp-hero sp-hero--contact">
        <div className="sp-hero-veil" aria-hidden="true" />
        <div className="container sp-hero-inner">
          <p className="sp-eyebrow">Guest policies</p>
          <h1 className="sp-title">
            <span className="sp-title-line">Terms, privacy, and house rules.</span>
          </h1>
          <p className="sp-lead">
            These notes cover booking a mountain home, how we use your details, and the rights reserved by each host. Last updated {UPDATED}.
          </p>
        </div>
      </section>

      <section className="sp-section legal-page">
        <div className="container legal-layout">
          <nav className="legal-nav" aria-label="Policy sections">
            {SECTIONS.map((section) => (
              <a key={section.id} href={`#${section.id}`}>{section.label}</a>
            ))}
          </nav>

          <article className="legal-copy">
            <section id="terms">
              <h2>Terms of use</h2>
              <p>
                Ezy Escape runs this website to introduce travellers to mountain homestays and small experiences in Kumaon, Uttarakhand. The homes are lived in by host families. They are not a hotel chain, and a listing is not a confirmed room until the host accepts your request.
              </p>
              <p>
                By using the site, creating an account, or sending a booking request, you agree to these terms and to the privacy notes below. If you book for other people, you confirm that you have their permission to share the details the host needs.
              </p>
            </section>

            <section id="booking">
              <h2>Booking a stay</h2>
              <ul>
                <li>A request is not a confirmed stay. The host confirms, rejects, or asks for a change by email from bookings@ezyescape.com.</li>
                <li>The price you request is the base fare for the nights and rooms you chose. Heartfelt Pricing means the Heart Price shown on a home is optional after your stay. It is a thank-you, never a condition of the booking.</li>
                <li>Guest counts follow the home: adults and children are limited by the rooms you request. An extra mattress is only included when you select it.</li>
                <li>A night already requested, confirmed, or completed for that home cannot be booked again. Booking the whole home uses every room.</li>
                <li>Check-in is generally from 2:00 pm India time unless the host writes otherwise. Check-out time is set by the host.</li>
                <li>One account can be signed in on one browser at a time. Sign out before using another browser.</li>
                <li>You must give a name, email, and mobile number we can actually reach. False details can lead to a rejected request.</li>
              </ul>
            </section>

            <section id="payment">
              <h2>Payment and ezy coins</h2>
              <p>
                The amount payable is the base fare after any ezy coins you redeem. This website does not ask for or store card numbers. Payment is collected as arranged with Ezy Escape or the host, and the booking is marked paid when that payment is recorded.
              </p>
              <ul>
                <li>One ezy coin is worth ₹1 on a booking.</li>
                <li>A new account receives 500 coins on first sign-in. Another 500 are added only when the host confirms the stay.</li>
                <li>You can use at most 100 coins on one booking.</li>
                <li>Coins expire. We email a reminder 3 days before, 2 days before, and on the day they expire.</li>
                <li>Coins are not cash, cannot be transferred, and cannot be bought or sold.</li>
              </ul>
            </section>

            <section id="cancellation">
              <h2>Changes, rejection, and cancellation</h2>
              <p>
                Write to <a href="mailto:bookings@ezyescape.com">bookings@ezyescape.com</a> if you need to change dates or guest count. The host decides whether the change is possible.
              </p>
              <ul>
                <li>If a request is rejected, or a stay is cancelled by the host or by us, coins you redeemed on that booking are returned to your account.</li>
                <li>The 500-coin stay reward is added only after confirmation. It is not added to a rejected or cancelled request.</li>
                <li>Hill roads, weather, and family events at the home can force a change. We will write to you as soon as we know.</li>
                <li>Leaving early, or being asked to leave for a serious breach of house rules, does not by itself refund nights already stayed. Unused nights are discussed with the host.</li>
              </ul>
            </section>

            <section id="admission">
              <h2>Rights of admission reserved</h2>
              <p>
                Rights of admission are reserved by the host of each home and by Ezy Escape. A request can be refused, and a confirmed guest can be denied entry, where the home cannot safely receive the party, the listing was misused, or house rules are broken.
              </p>
              <p>
                Refusal will not be based on religion, caste, gender, sexual orientation, or disability. If a particular home cannot manage a specific access need, we will say so before the stay is confirmed.
              </p>
              <p>
                Guests agree to respect the family, neighbours, quiet hours, the number of people booked, and local custom. Damage to the home, illegal activity, or harassment of hosts or other guests can end the stay.
              </p>
            </section>

            <section id="disclaimer">
              <h2>Disclaimer</h2>
              <ul>
                <li>Homes are homestays and guesthouses run by families. Facilities vary. The listing describes what the host has told us and what we have checked in good faith.</li>
                <li>Mountain travel involves narrow roads, weather, and limited medical access. You are responsible for your own travel insurance, permits where they apply, and the drive or transfer to the home.</li>
                <li>Experiences, meals, and festivals depend on the season and the host. A listed experience can be rearranged.</li>
                <li>Postcards are written by guests and appear only after we review them. Shop items are offered with partner groups. Those pages have their own availability.</li>
                <li>To the extent Indian law allows, Ezy Escape is not liable for loss caused by weather, road closure, acts of the host outside the confirmed booking, or events we could not reasonably prevent. Where we are liable for a booking, that liability is limited to the amount you paid for that stay.</li>
                <li>Nothing in these terms limits liability that the law does not allow us to limit, including liability for death or personal injury caused by negligence.</li>
              </ul>
            </section>

            <section id="privacy">
              <h2>Privacy policy</h2>
              <p>
                We collect only what we need to run accounts, booking requests, and guest messages. We do not sell personal data.
              </p>
              <p>
                Sign-in is by a code sent to your email, or by Google. The sign-in cookie stays on this site and is not readable by page scripts. You can sign out at any time, which ends that browser session.
              </p>
              <p>
                Questions about your data can go to <a href="mailto:info@ezyescape.com">info@ezyescape.com</a>. Booking questions go to <a href="mailto:bookings@ezyescape.com">bookings@ezyescape.com</a>. You can also use the <a href={contactPath()}>contact page</a>.
              </p>
            </section>

            <section id="data">
              <h2>Use of personal data</h2>
              <p>We use the details you give us for these purposes:</p>
              <ul>
                <li>To create your account and keep one active sign-in.</li>
                <li>To send the booking request to the host, and to email you when it is received, confirmed, rejected, or cancelled.</li>
                <li>To remind you of a confirmed stay 2 days before, 1 day before, and about 12 hours before a 2:00 pm check-in, and to send a thank-you note with a link to leave a postcard.</li>
                <li>To run ezy coins, including expiry reminders.</li>
                <li>To review a postcard before it is shown on the site.</li>
                <li>To answer you, prevent misuse, and keep booking records for accounts and disputes.</li>
              </ul>
              <p>
                The people who can see a booking are the Ezy Escape desk and the host of that home. Email is sent through our mailboxes at info@ezyescape.com and bookings@ezyescape.com. We do not pass your details to advertisers.
              </p>
              <p>
                We keep account and booking records while your account is open, and for as long as we need them for payments, coin balances, and legal duties. You may ask us to correct your name or mobile, or to close your account. We will delete what we are allowed to delete and keep what tax or dispute rules require.
              </p>
              <p>
                The site is for adults making a booking. Children may be included as guests on an adult’s request. Do not send us a child’s identity documents.
              </p>
              <p>
                These terms are governed by the laws of India. Courts in Uttarakhand have jurisdiction. We may update this page; the date at the top will change when we do. Continued use of the site after an update means you accept the revised notes.
              </p>
            </section>
          </article>
        </div>
      </section>
    </SiteChrome>
  );
}
