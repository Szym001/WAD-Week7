import { useEffect, useRef, useState } from 'react';
export default function PlayTimer() {
  // STATE: seconds appears in the UI, so updates trigger a render.
  const [seconds, setSeconds] = useState(0);
  // REF: the handle survives renders but does not appear in the UI.
  const timerRef = useRef<number | null>(null);
  function startTimer() { if (timerRef.current === null) timerRef.current = window.setInterval(() => setSeconds((previous) => previous + 1), 1000); }
  function stopTimer() { if (timerRef.current !== null) { clearInterval(timerRef.current); timerRef.current = null; } }
  function resetTimer() { stopTimer(); setSeconds(0); }
  useEffect(() => () => { if (timerRef.current !== null) clearInterval(timerRef.current); }, []); // Cleanup runs when removed.
  return <section className="panel mini-panel"><span className="concept-label">useRef + useState</span><h2>Play Timer</h2><div className="timer">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</div><div className="button-row"><button onClick={startTimer}>Start</button><button className="secondary" onClick={stopTimer}>Stop</button><button className="secondary" onClick={resetTimer}>Reset</button></div></section>;
}
