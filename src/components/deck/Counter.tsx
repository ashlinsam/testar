/** A three-digit mechanical tape counter: printed digits on rolling drums. */
export function Counter({ value }: { value: number }) {
  const v = Math.max(0, Math.floor(value)) % 1000;
  const digits = String(v).padStart(3, "0").split("");
  return (
    <span className="counter" role="img" aria-label={`Counter ${v}`}>
      {digits.map((d, i) => (
        <span key={i} className="drum" aria-hidden>
          <span className="drum__strip" style={{ transform: `translateY(${-Number(d) * 22}px)` }}>
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
