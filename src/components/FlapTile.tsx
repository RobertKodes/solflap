import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { jitterDeg, normalizeChar } from "../board/charset";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export type TileTone = "cream" | "amber" | "cancel" | "mute";

type Props = {
  ch: string;
  delayMs: number;
  tone: TileTone;
  slam?: boolean;
  seed: string;
};

export function FlapTile({ ch, delayMs, tone, slam = false, seed }: Props) {
  const reduced = usePrefersReducedMotion();
  const target = normalizeChar(ch);
  const [shown, setShown] = useState(reduced ? target : " ");
  const [outgoing, setOutgoing] = useState(reduced ? target : " ");
  const [flipping, setFlipping] = useState(false);
  const shownRef = useRef(shown);
  const timers = useRef<number[]>([]);
  const reactId = useId();
  const jitter = jitterDeg(seed + reactId);

  useEffect(() => {
    shownRef.current = shown;
  }, [shown]);

  useEffect(() => {
    return () => {
      for (const id of timers.current) window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];

    if (target === shownRef.current) return;

    if (reduced) {
      setOutgoing(target);
      setShown(target);
      setFlipping(false);
      return;
    }

    const start = window.setTimeout(() => {
      setOutgoing(shownRef.current);
      setFlipping(true);
      const dur = slam ? 130 : 280;
      const done = window.setTimeout(() => {
        setShown(target);
        setOutgoing(target);
        setFlipping(false);
      }, dur);
      timers.current.push(done);
    }, delayMs);
    timers.current.push(start);
  }, [target, delayMs, reduced, slam]);

  const face = flipping ? outgoing : shown;
  const incoming = target;

  return (
    <span
      className={`flap tone-${tone}${flipping ? " is-flip" : ""}${slam ? " is-slam" : ""}`}
      style={{ "--jitter": `${jitter}deg` } as CSSProperties}
      aria-hidden="true"
    >
      <span className="flap-half flap-upper">
        <span className="flap-glyph">{face}</span>
      </span>
      <span className="flap-half flap-lower">
        <span className="flap-glyph">{flipping ? incoming : face}</span>
      </span>
      <span className="flap-leaf flap-leaf-top">
        <span className="flap-glyph">{outgoing}</span>
      </span>
      <span className="flap-leaf flap-leaf-bot">
        <span className="flap-glyph">{incoming}</span>
      </span>
      <span className="flap-split" />
    </span>
  );
}
