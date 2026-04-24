/* ============================================================
   High Frequency — Tech & Streetwear
   main.js
   ============================================================ */

/* ─── Sold-out toggle ─────────────────────────────────────── */
function setSoldOut(cardIndex, isSoldOut) {
  const cards = document.querySelectorAll('.card');
  if (!cards[cardIndex]) return;
  cards[cardIndex].classList.toggle('isSoldOut', isSoldOut);
}

/* ─── Stripe Membership Modal ─────────────────────────────── */

// ⚠️  REPLACE with your real Stripe publishable key from dashboard.stripe.com
const STRIPE_PUBLISHABLE_KEY = 'pk_test_REPLACE_WITH_YOUR_KEY';

let stripe, cardElement;

function initStripe() {
  if (!window.Stripe || stripe) return;
  stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
  const elements = stripe.elements({
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#00e5c8',
        colorBackground: 'rgba(255,255,255,0.05)',
        colorText: '#ffffff',
        colorDanger: '#ff6b6b',
        fontFamily: 'DM Sans, sans-serif',
        borderRadius: '10px',
      }
    }
  });
  cardElement = elements.create('card', {
    style: {
      base: {
        color: '#fff',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '15px',
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

function openMembershipModal() {
  const modal = document.getElementById('membershipModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Init Stripe lazily on first open
  setTimeout(initStripe, 100);
}

function closeMembershipModal(event) {
  if (event && event.target !== document.getElementById('membershipModal')) return;
  document.getElementById('membershipModal').classList.remove('active');
  document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMembershipModal();
});

async function handlePayment(e) {
  e.preventDefault();
  if (!stripe || !cardElement) return;

  const btnText    = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const submitBtn  = document.getElementById('submitBtn');
  const errorEl    = document.getElementById('card-errors');
  const name       = document.getElementById('cardName').value;
  const email      = document.getElementById('cardEmail').value;

  // Show loading state
  btnText.style.display    = 'none';
  btnSpinner.style.display = 'inline';
  submitBtn.disabled       = true;
  errorEl.textContent      = '';

  try {
    /*
     * BACKEND REQUIRED:
     * You need a server endpoint (e.g. Netlify Function, Vercel Function, or
     * Express server) that:
     *   1. Creates a Stripe Customer
     *   2. Creates a Subscription with a Price ID
     *   3. Returns a clientSecret for PaymentIntent confirmation
     *
     * Example endpoint call (replace URL with your own):
     *
     * const res = await fetch('/api/create-subscription', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ name, email })
     * });
     * const { clientSecret } = await res.json();
     *
     * const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
     *   payment_method: { card: cardElement, billing_details: { name, email } }
     * });
     *
     * if (error) throw new Error(error.message);
     * showSuccess();
     */

    // ── DEMO MODE (no backend yet) ──────────────────────────
    // Simulates a successful payment for UI testing.
    // Remove this block once your backend is connected.
    await new Promise(r => setTimeout(r, 1500));
    showSuccess(name);
    // ────────────────────────────────────────────────────────

  } catch (err) {
    errorEl.textContent = err.message || 'Something went wrong. Please try again.';
    btnText.style.display    = 'inline';
    btnSpinner.style.display = 'none';
    submitBtn.disabled       = false;
  }
}

function showSuccess(name) {
  const form = document.getElementById('paymentForm');
  form.innerHTML = `
    <div style="text-align:center; padding: 20px 0;">
      <div style="font-size:3rem; margin-bottom:16px;">✅</div>
      <h3 style="margin-bottom:8px;">Welcome to the Inner Circle${name ? ', ' + name.split(' ')[0] : ''}!</h3>
      <p style="color:var(--muted); font-size:.92rem; line-height:1.6;">
        You're in. Check <strong style="color:#fff;">${document.getElementById('cardEmail') ? document.getElementById('cardEmail').value : 'your email'}</strong>
        for your membership confirmation and next steps.
      </p>
      <button class="btn btn--tech" style="margin-top:20px; width:100%; justify-content:center;"
        onclick="closeMembershipModal()">Back to Site</button>
    </div>
  `;
}
