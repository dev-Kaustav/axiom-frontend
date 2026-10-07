import { useEffect, useState } from 'react';
export function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {const id = setInterval(() => setNow(new Date()),1000);return () => clearInterval(id);},[]);
  return <span className="clock">{now.toISOString().slice(11,19)}<small> UTC</small></span>;
}
