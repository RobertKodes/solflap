import { COL } from "../board/charset";
import type { Flight } from "../types";
import { FlapText } from "./FlapText";
import type { TileTone } from "./FlapTile";

type Props = {
  flight: Flight | null;
  rowIndex: number;
  armed: boolean;
};

function remarksTone(status: Flight["status"] | ""): TileTone {
  if (status === "CANCELLED") return "cancel";
  if (status === "DELAYED") return "amber";
  return "cream";
}

export function FlapRow({ flight, rowIndex, armed }: Props) {
  const live = armed ? flight : null;
  const slam = live?.status === "CANCELLED";
  const rowDelay = live ? 90 + rowIndex * 70 : 0;

  return (
    <li className={`board-row${slam ? " is-cancelled" : ""}`}>
      <FlapText
        text={live ? live.flightNo : ""}
        width={COL.flt}
        tone="cream"
        rowDelay={rowDelay}
        seed={`${live?.id ?? "empty"}-flt-${rowIndex}`}
      />
      <FlapText
        text={live ? live.carrier : ""}
        width={COL.dest}
        tone="cream"
        rowDelay={rowDelay + 40}
        seed={`${live?.id ?? "empty"}-dest-${rowIndex}`}
      />
      <FlapText
        text={live ? String(live.slot) : ""}
        width={COL.slot}
        tone="amber"
        rowDelay={rowDelay + 80}
        seed={`${live?.id ?? "empty"}-slot-${rowIndex}`}
      />
      <FlapText
        text={live ? live.status : ""}
        width={COL.remarks}
        tone={remarksTone(live ? live.status : "")}
        rowDelay={rowDelay + 120}
        slam={Boolean(slam)}
        seed={`${live?.id ?? "empty"}-rmk-${rowIndex}`}
      />
    </li>
  );
}
