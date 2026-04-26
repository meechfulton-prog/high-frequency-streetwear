/* ============================================================
   netlify/functions/create-subscription.js

   Environment variables required in Netlify dashboard:
     STRIPE_SECRET_KEY  — sk_test_... or sk_live_...
     STRIPE_PRICE_ID    — price_... (from Stripe Product Catalogue)
   ============================================================ */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

exports.handler = async (event) => {

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { name, email } = JSON.parse(event.body);

    if (!name || !email) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Name and email are required' }),
      };
    }

    // 1. Find or create Stripe customer
