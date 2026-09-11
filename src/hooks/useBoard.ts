import { useCallback, useEffect, useRef, useState } from "react";
import { formatClock } from "../board/charset";
import { mergeFlights } from "../board/flights";
import { weatherLine } from "../board/status";
import { BoardPoller, RPC_CANDIDATES } from "../solana/poller";
import { hostOf } from "../solana/rpc";
import type { BoardState, ChainWeather, Flight, PollHealth } from "../types";

const EMPTY: BoardState = {
  armed: false,
  flights: [],
  weather: null,
  health: "idle",
  note: "Board is dark. Open it first.",
  rpcHost: hostOf(RPC_CANDIDATES[0] ?? ""),
  clock: formatClock(),
};

export function useBoard(): BoardState & {
  arm: () => void;
  cut: () => void;
} {
  const [state, setState] = useState<BoardState>(EMPTY);
  const pollerRef = useRef<BoardPoller | null>(null);

  const tearDown = useCallback(() => {
    pollerRef.current?.stop();
    pollerRef.current = null;
  }, []);

  const arm = useCallback(() => {
    if (pollerRef.current) return;
    setState((prev) => ({
      ...prev,
      armed: true,
      health: "listening",
      note: "Raising the flaps…",
    }));

    const poller = new BoardPoller(RPC_CANDIDATES, {
      onFlights: (incoming: Flight[]) => {
        setState((prev) => ({
          ...prev,
          flights: mergeFlights(prev.flights, incoming),
        }));
      },
      onWeather: (weather: ChainWeather) => {
        setState((prev) => ({
          ...prev,
          weather,
          clock: formatClock(),
        }));
      },
      onHealth: (health: PollHealth, note: string) => {
        setState((prev) => ({
          ...prev,
          health,
          note,
          rpcHost: poller.rpcHost(),
          weather:
            health === "waiting" && prev.weather
              ? {
                  ...prev.weather,
                  kind: "HOLD",
                  line: weatherLine("HOLD", prev.weather.slot, prev.weather.tps, prev.weather.feeP90),
                }
              : prev.weather,
        }));
      },
    });
    pollerRef.current = poller;
    poller.start();
  }, []);

  const cut = useCallback(() => {
    tearDown();
    setState({
      ...EMPTY,
      clock: formatClock(),
    });
  }, [tearDown]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((prev) => {
        const next = formatClock();
        return prev.clock === next ? prev : { ...prev, clock: next };
      });
    }, 15_000);
    return () => {
      window.clearInterval(id);
      tearDown();
    };
  }, [tearDown]);

  return { ...state, arm, cut };
}
