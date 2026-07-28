import { useState, useEffect, useRef } from 'react';
import './StatsCounter.css';

const stats = [
  { label: 'Clients satisfaits', value: 500, suffix: '+' },
  { label: 'Commandes livrées', value: 1200, suffix: '+' },
  { label: 'Taux de satisfaction', value: 98, suffix: '%' },
  { label: 'Avis 5 étoiles', value: 300, suffix: '+' },
];

function StatItem({ value, suffix, label }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCount();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCount = () => {
    const duration = 1500;
    const steps = 50;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
  };

  return (
    <div className="stat-item" ref={ref}>
      <p className="stat-number">
        {count}
        {suffix}
      </p>
      <p className="stat-label">{label}</p>
    </div>
  );
}

function StatsCounter() {
  return (
    <section className="stats-counter">
      <div className="stats-counter-grid">
        {stats.map((stat, index) => (
          <StatItem key={index} value={stat.value} suffix={stat.suffix} label={stat.label} />
        ))}
      </div>
    </section>
  );
}

export default StatsCounter;