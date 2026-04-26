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

/* ─── Stripe init ─────────────────────────────────────────── */
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
        color:      '#fff',
        fontFamily: 'DM Sans, sans-serif',
        fontSize:   '15px',
        '::placeholder': { color: 'rgba(255,255,255,0.3)' },
      },
      invalid: { color: '#ff6b6b' }
    }
  });

  cardElement.mount('#card-element');

  cardElement.on('change', function(e) {
    var el = document.getElementById('card-errors');
    if (el) el.textContent = e.error ? e.error.message : '';
  });
}

/* ─── Modal open / close ─────────────────────────────────── */
function openMembershipModal() {
  var modal = document.getElementById('membershipModal');
  if (!modal) { console.error('Modal not found'); return; }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(initStripe, 150);
}

function closeModal() {
  var modal = document.getElementById('membershipModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Called from overlay onclick — only close if clicking the dark overlay itself
function closeMembershipModal(event) {
  if (event) {
    if (event.target && event.target.id === 'membershipModal') {
      closeModal();
    }
  } else {
    closeModal();
  }
}

// Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

/* ─── Payment handler ────────────────────────────────────── */
async function handlePayment(e) {
  e.preventDefault();

  if (!stripe || !cardElement) {
    document.getElementById('card-errors').textContent = 'Payment system not loaded. Please refresh and try again.';
    return;
  }

  var btnText    = document.getElementById('btnText');
  var btnSpinner = document.getElementById('btnSpinner');
  var submitBtn  = document.getElementById('submitBtn');
  var errorEl    = document.getElementById('card-errors');
  var name       = document.getElementById('cardName').value.trim();
  var email      = document.getElementById('cardEmail').value.trim();

  // Loading state
  btnText.style.display    = 'none';
  btnSpinner.style.display = 'inline';
  submitBtn.disabled       = true;
  errorEl.textContent      = '';

  try {
    // Call Netlify function
    var res = await fetch('/api/create-subscription', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: name, email: email })
    });

    var data = await res.json();
    if (data.error) throw new Error(data.error);

    // Confirm card payment
    var result = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card:            cardElement,
        billing_details: { name: name, email: email }
      }
    });

    if (result.error) throw new Error(result.error.message);

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
  var firstName = name ? name.split(' ')[0] : '';
  document.getElementById('paymentForm').innerHTML =
    '<div style="text-align:center; padding:24px 0;">' +
      '<div style="font-size:3.5rem; margin-bottom:14px;">✅</div>' +
      '<h3 style="margin-bottom:10px;">Welcome to the Inner Circle' + (firstName ? ', ' + firstName : '') + '!</h3>' +
      '<p style="color:var(--muted); font-size:.92rem; line-height:1.7;">' +
        'You\'re in. Check <strong style="color:#fff;">' + email + '</strong> for your confirmation and access details.' +
      '</p>' +
      '<div style="margin-top:16px; padding:14px; border-radius:12px; background:rgba(0,229,200,.08); border:1px solid rgba(0,229,200,.2);">' +
        '<p style="font-size:.85rem; color:var(--tech); font-weight:900; margin-bottom:4px;">WHAT\'S NEXT</p>' +
        '<p style="font-size:.85rem; color:var(--muted); line-height:1.6;">You\'ll receive a welcome email with your member dashboard link, video library access, and instructions to book your first 1-on-1 session.</p>' +
      '</div>' +
      '<button class="btn btn--tech" style="margin-top:20px; width:100%; justify-content:center;" onclick="closeModal()">Back to Site</button>' +
    '</div>';
}

/* ─── Debug: confirm script loaded ──────────────────────── */
console.log('HF main.js loaded ✓');
