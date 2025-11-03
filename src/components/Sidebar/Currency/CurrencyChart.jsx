import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import s from './Currency.module.css';

const CurrencyChart = ({ data }) => {
  // data: [{ name: 'USD'|'EUR', currency: number, label: string }, ...]

  const safeNum = v => (typeof v === 'number' ? v : Number(v) || 0);

  const renderLabelWithIcon = props => {
    const { x, y, value, index } = props;
    if (!data || !data[index]) return null;

    const name = data[index].name;
    const icon = name === 'USD' ? '$' : name === 'EUR' ? '€' : null;
    const num = safeNum(value);
    if (!num) return null;

    return (
      <text x={x} y={y - 10} fill="#ff6f61" fontSize={14} textAnchor="middle">
        {icon ? `${icon} ${num.toFixed(2)}` : num.toFixed(2)}
      </text>
    );
  };

  const renderDot = props => {
    const { cx, cy, index } = props;
    if (!data || !data[index]) return null;

    const val = safeNum(data[index].currency);
    if (!val) return null;

    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={4}
        fill="#563EAF"
        stroke="#ff6f61"
        strokeWidth={2}
      />
    );
  };

  const renderActiveDot = props => {
    const { cx, cy, index } = props;
    if (!data || !data[index]) return null;

    const val = safeNum(data[index].currency);
    if (!val) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="#ff6f61"
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  const CustomTooltip = ({ active }) => {
    // păstrăm design-ul fără tooltip tradițional
    if (active) return null;
    return null;
  };

  const hasValues =
    Array.isArray(data) && data.some(d => d && safeNum(d.currency) > 0);

  return (
    <div className={s.graph}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={hasValues ? data : []} margin={{ top: 10 }}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="currency"
            stroke="none"
            fill="url(#colorGradient)"
            fillOpacity={1}
            transform="translate(0, 10)"
            activeDot={false}
            dot={false}
            isAnimationActive={false}
          />

          <Area
            type="monotone"
            dataKey="currency"
            stroke="#ff6f61"
            strokeWidth={2}
            fill="none"
            activeDot={renderActiveDot}
            dot={renderDot}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="label"
              content={renderLabelWithIcon}
              position="top"
              offset={10}
              fill="#ff6f61"
              fontSize={12}
            />
          </Area>

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'none' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CurrencyChart;
