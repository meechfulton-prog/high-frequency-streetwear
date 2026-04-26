/* ============================================================
   High Frequency — Tech & Streetwear
   main.js
   ============================================================ */

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TQA8g1iw0dRzkjgmhCiATLtXQEES15dIc0YFOntoyMkf1KolgkU1RVOvpGqVXtTu2cHJY6L75sGhEmMTHhXSy4100LvRFIbEH';

/* ─── Sold-out toggle ─────────────────────────────────────── */
function setSoldOut(cardIndex, isSoldOut) {
  const cards = document.querySelectorAll('.card');
  if (!cards[cardIndex]) return;
  cards[cardIndex].classList.toggle('isSoldOut', isSoldOut);
}

/* ─── Stripe init (lazy — fires on first modal open) ─────── */
let stripe, cardElement;

function initStripe() {
  if (!window.Stripe || stripe) return;

  stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

  const elements = stripe.elements({
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary:    '#00e5c8',
        colorBackground: '#0d0d0d',
        colorText:       '#ffffff',
        colorDanger:     '#ff6b6b',
        fontFamily:      'DM Sans, sans-serif',
        borderRadius:    '10px',
      }
    }
  });

  cardElement = elements.create('card', {
    style: {
      base: {
        color:       '#fff',
        fontFamily:  'DM Sans, sans-serif',
        fontSize:    '15px',
        '::placeholder': { color: 'rgba(255,255,255,0.3)' },
      },
      invalid: { color: '#ff6b6b' }
    }
  });

  cardElement.mount('#card-element');

  cardElement.on('change', ({ error }) => {
    document.getElementById('card-errors').textContent = error ? error.message : '';
  });
}

/* ─── Modal open / close ─────────────────────────────────── */
function openMembershipModal() {
  document.getElementById('membershipModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(initStripe, 100);
}

function closeMembershipModal(event) {
  // If called from overlay click, only close if clicking the overlay itself
  if (event && event.target !== document.getElementById('membershipModal')) return;
  _closeModal();
}

function _closeModal() {
  document.getElementById('membershipModal').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') _closeModal();
});

/* ─── Payment handler ────────────────────────────────────── */
async function handlePayment(e) {
  e.preventDefault();
  if (!stripe || !cardElement) return;

  const btnText    = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const submitBtn  = document.getElementById('submitBtn');
  const errorEl    = document.getElementById('card-errors');
  const name       = document.getElementById('cardName').value.trim();
  const email      = document.getElementById('cardEmail').value.trim();

  // Loading state
  btnText.style.display    = 'none';
  btnSpinner.style.display = 'inline';
  submitBtn.disabled       = true;
  errorEl.textContent      = '';

  try {
    // 1. Call Netlify function to create Stripe subscription
    const res = await fetch('/api/create-subscription', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // 2. Confirm card payment with Stripe.js
    const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card:             cardElement,
        billing_details:  { name, email }
      }
    });

    if (stripeError) throw new Error(stripeError.message);

    // 3. Success
    showSuccess(name, email);

  } catch (err) {
    errorEl.textContent      = err.message || 'Something went wrong. Please try again.';
    btnText.style.display    = 'inline';
    btnSpinner.style.display = 'none';
    submitBtn.disabled       = false;
  }
}

/* ─── Success screen ─────────────────────────────────────── */
function showSuccess(name, email) {
  const firstName = name ? name.split(' ')[0] : '';
  document.getElementById('paymentForm').innerHTML = `
    <div style="text-align:center; padding:24px 0;">
      <div style="font-size:3.5rem; margin-bottom:14px;">✅</div>
      <h3 style="margin-bottom:10px; font-size:1.3rem;">
        Welcome to the Inner Circle${firstName ? ', ' + firstName : ''}!
      </h3>
      <p style="color:var(--muted); font-size:.92rem; line-height:1.7;">
        You're in. Check <strong style="color:#fff;">${email}</strong>
        for your confirmation and access details.
      </p>
      <div style="margin-top:16px; padding:14px; border-radius:12px;
                  background:rgba(0,229,200,.08); border:1px solid rgba(0,229,200,.2);">
        <p style="font-size:.85rem; color:var(--tech); font-weight:900; margin-bottom:4px;">
          WHAT'S NEXT
        </p>
        <p style="font-size:.85rem; color:var(--muted); line-height:1.6;">
          You'll receive a welcome email with your member dashboard link,
          video library access, and instructions to book your first 1-on-1 session.
        </p>
      </div>
      <button class="btn btn--tech"
        style="margin-top:20px; width:100%; justify-content:center;"
        onclick="_closeModal()">
        Back to Site
      </button>
    </div>
  `;
