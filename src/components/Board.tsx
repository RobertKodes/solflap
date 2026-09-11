import { COL } from "../board/charset";
import { MAX_ROWS } from "../board/flights";
import type { BoardState } from "../types";
import { FlapRow } from "./FlapRow";
import { FlapText } from "./FlapText";
import { PowerPlate } from "./PowerPlate";

type Props = {
  state: BoardState;
  onArm: () => void;
  onCut: () => void;
};

const HEADER = {
  flt: "FLT",
  dest: "DESTINATION",
  slot: "SLOT",
  remarks: "REMARKS",
} as const;

export function Board({ state, onArm, onCut }: Props) {
  const rows = Array.from({ length: MAX_ROWS }, (_, i) => state.flights[i] ?? null);
  const weather = state.armed
    ? (state.weather?.line ?? "SLOT —  ·  WEATHER DARK  ·  WAITING ON TOWER")
    : "SLOT —  ·  WEATHER DARK  ·  BOARD OFF";

  return (
    <section className={`chassis${state.armed ? " is-live" : " is-dark"}`}>
      <div className="chassis-bezel" aria-hidden="true">
        <span className="rivet rivet-tl" />
        <span className="rivet rivet-tr" />
        <span className="rivet rivet-bl" />
        <span className="rivet rivet-br" />
      </div>
      <div className="dust" aria-hidden="true" />

      <header className="mast">
        <div className="mast-left">
          <p className="mast-mark">Solflap</p>
          <p className="mast-sub">Mainnet arrivals · Hall 4</p>
        </div>
        <div className="mast-clock" aria-label={`UTC ${state.clock}`}>
          <span className="mast-clock-label">UTC</span>
          <FlapText text={state.armed ? state.clock : "     "} width={5} tone="amber" seed="clock" />
        </div>
      </header>

      <div className="board-scroll">
        <div className="col-heads" aria-hidden="true">
          <span style={{ width: `calc(${COL.flt} * var(--tile-w) + ${COL.flt - 1} * var(--tile-gap))` }}>
            {HEADER.flt}
          </span>
          <span style={{ width: `calc(${COL.dest} * var(--tile-w) + ${COL.dest - 1} * var(--tile-gap))` }}>
            {HEADER.dest}
          </span>
          <span style={{ width: `calc(${COL.slot} * var(--tile-w) + ${COL.slot - 1} * var(--tile-gap))` }}>
            {HEADER.slot}
          </span>
          <span style={{ width: `calc(${COL.remarks} * var(--tile-w) + ${COL.remarks - 1} * var(--tile-gap))` }}>
            {HEADER.remarks}
          </span>
        </div>

        <ol className="board-rows">
          {rows.map((flight, i) => (
            <FlapRow
              key={flight?.id ?? `empty-${i}`}
              flight={flight}
              rowIndex={i}
              armed={state.armed}
            />
          ))}
        </ol>
      </div>

      <footer className="weather">
        <p className="weather-line">{weather}</p>
        <p className="weather-meta">
          <span className={`jewel jewel-${state.health}`} />
          {state.armed ? (
            <>
              <span>{state.note}</span>
              <button type="button" className="cut" onClick={onCut}>
                Cut power
              </button>
            </>
          ) : (
            <span>Waiting on the open click.</span>
          )}
        </p>
      </footer>

      {!state.armed ? <PowerPlate onOpen={onArm} /> : null}
    </section>
  );
}
