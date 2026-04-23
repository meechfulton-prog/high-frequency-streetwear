/* ============================================================
   High Frequency — Tech & Streetwear
   main.js
   ============================================================ */

/**
 * Toggle a product card's sold-out state.
 * Usage: setSoldOut(0, true)  → marks first card as sold out
 *        setSoldOut(0, false) → marks first card as available
 */
function setSoldOut(cardIndex, isSoldOut) {
  const cards = document.querySelectorAll('.card');
  if (!cards[cardIndex]) return;
  cards[cardIndex].classList.toggle('isSoldOut', isSoldOut);
}

/**
 * Example — uncomment to mark specific items as sold out on load:
 *
 * setSoldOut(0, true);   // White Long Sleeve Tee
 * setSoldOut(1, true);   // Black Trucker Cap
 * setSoldOut(2, true);   // Black Graphic Long Sleeve
 */
