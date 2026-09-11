import { padFlap } from "../board/charset";
import { FlapTile, type TileTone } from "./FlapTile";

type Props = {
  text: string;
  width: number;
  tone?: TileTone;
  rowDelay?: number;
  slam?: boolean;
  seed: string;
};

export function FlapText({
  text,
  width,
  tone = "cream",
  rowDelay = 0,
  slam = false,
  seed,
}: Props) {
  const padded = padFlap(text, width);
  return (
    <span className="flap-word">
      {Array.from(padded).map((ch, i) => (
        <FlapTile
          key={`${seed}-${i}`}
          ch={ch}
          delayMs={rowDelay + i * (slam ? 18 : 38)}
          tone={ch === " " ? "mute" : tone}
          slam={slam}
          seed={`${seed}-${i}-${ch}`}
        />
      ))}
    </span>
  );
}
