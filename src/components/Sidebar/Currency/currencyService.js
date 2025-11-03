const API_URL = 'https://api.frankfurter.app/latest?from=USD&to=EUR';
const STORAGE_KEY = 'currencyData';
const TTL_MINUTES = 60; // cache 60 min

export const fetchCurrencyData = async () => {
  try {
    // cache
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const lastFetched = new Date(parsed.timestamp);
      if ((Date.now() - lastFetched.getTime()) / (1000 * 60) < TTL_MINUTES) {
        return parsed.data;
      }
    }

    // fetch latest USD->EUR (ECB rates via Frankfurter)
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();

    const eurPerUsd = Number(result?.rates?.EUR);
    if (!eurPerUsd) throw new Error('Invalid rates from API');

    // professional-ish: păstrăm același model ca înainte
    // USD = 1.00 (față de USD), EUR = eurPerUsd (câți EUR pentru 1 USD)
    const USD_mid = 1.0;
    const EUR_mid = eurPerUsd;

    // simulăm buy/sell cu un spread (5%) ca în codul tău anterior
    const spread = 0.05;
    const mkBuy = x => Number(x.toFixed(4));
    const mkSell = x => Number((x * (1 + spread)).toFixed(4));

    const currencyData = {
      USD: {
        purchase: mkBuy(USD_mid),
        sale: mkSell(USD_mid),
      },
      EUR: {
        purchase: mkBuy(EUR_mid),
        sale: mkSell(EUR_mid),
      },
      // quality-of-life: includem și EURUSD real (1 EUR în USD) pentru UI
      meta: {
        eurUsd: Number((1 / EUR_mid).toFixed(6)), // 1 EUR ≈ X USD
      },
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data: currencyData, timestamp: new Date() })
    );

    return currencyData;
  } catch (error) {
    console.error('Currency fetch failed:', error.message);
    return null;
  }
};
