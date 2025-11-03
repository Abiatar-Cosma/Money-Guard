import React, { useEffect, useState, useMemo } from 'react';
import styles from './Currency.module.css';
import CurrencyChart from './CurrencyChart';
import { fetchCurrencyData } from './currencyService';

const Currency = () => {
  // rates: { USD: {purchase, sale}, EUR: {purchase, sale}, meta?: { eurUsd } }
  const [rates, setRates] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setError(null);
        const data = await fetchCurrencyData(); // folosește cache-ul dacă e proaspăt
        if (!mounted) return;

        if (data) {
          setRates(data);
          // timestamp-ul e salvat de service în localStorage
          const cached = localStorage.getItem('currencyData');
          if (cached) {
            const parsed = JSON.parse(cached);
            setUpdatedAt(parsed.timestamp || null);
          }
        } else {
          setError('Nu am putut prelua cursurile valutare.');
        }
      } catch (e) {
        console.error(e);
        setError('A apărut o eroare la preluarea cursurilor.');
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const toNum = v =>
    typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : 0;

  const format2 = val => {
    const n = toNum(val);
    return n ? n.toFixed(2) : '-';
  };

  const chartData = useMemo(() => {
    if (!rates) return [];
    const usdBuy = toNum(rates.USD?.purchase);
    const eurBuy = toNum(rates.EUR?.purchase);
    return [
      {
        name: 'USD',
        currency: usdBuy,
        label: usdBuy ? usdBuy.toFixed(2) : '-',
      },
      {
        name: 'EUR',
        currency: eurBuy,
        label: eurBuy ? eurBuy.toFixed(2) : '-',
      },
    ];
  }, [rates]);

  const formattedTs = useMemo(() => {
    if (!updatedAt) return null;
    try {
      const d = new Date(updatedAt);
      return d.toLocaleString();
    } catch {
      return null;
    }
  }, [updatedAt]);

  const eurUsd = rates?.meta?.eurUsd ?? null;

  return (
    <div className={styles.currencyWrapper}>
      <table className={styles.tab}>
        <thead>
          <tr className={styles.header}>
            <th className={styles.item}>Currency</th>
            <th className={styles.item}>Purchase</th>
            <th className={styles.item}>Sale</th>
          </tr>
        </thead>

        <tbody>
          <tr className={styles.tr}>
            <td className={styles.item}>USD</td>
            <td className={styles.item}>
              {rates?.USD?.purchase ? format2(rates.USD.purchase) : '-'}
            </td>
            <td className={styles.item}>
              {rates?.USD?.sale ? format2(rates.USD.sale) : '-'}
            </td>
          </tr>
          <tr className={styles.tr}>
            <td className={styles.item}>EUR</td>
            <td className={styles.item}>
              {rates?.EUR?.purchase ? format2(rates.EUR.purchase) : '-'}
            </td>
            <td className={styles.item}>
              {rates?.EUR?.sale ? format2(rates.EUR.sale) : '-'}
            </td>
          </tr>
        </tbody>
      </table>

      <CurrencyChart data={chartData} />

      {/* status + timestamp */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 12,
          opacity: 0.8,
          padding: '6px 0 2px',
        }}
      >
        {error ? (
          <span style={{ color: '#ff6f61' }}>{error}</span>
        ) : formattedTs ? (
          <>Actualizat la: {formattedTs}</>
        ) : (
          <>Se încarcă…</>
        )}
      </div>

      {/* opțional: arată EUR→USD dacă e expus de service */}
      {eurUsd && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            opacity: 0.9,
            paddingBottom: 10,
          }}
        >
          1 EUR ≈ {Number(eurUsd).toFixed(4)} USD
        </div>
      )}
    </div>
  );
};

export default Currency;
