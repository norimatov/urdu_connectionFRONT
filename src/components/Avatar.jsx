import { hueFor, initials } from '../lib/format.js';

export default function Avatar({ name = '', size = 40 }) {
  const h = hueFor(name);
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${h} 80% 60%), hsl(${(h + 60) % 360} 80% 55%))`,
      }}
    >
      {initials(name)}
    </div>
  );
}
