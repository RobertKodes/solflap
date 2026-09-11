export type FlightStatus = "ON TIME" | "DELAYED" | "CANCELLED";

export type WeatherKind = "CLEAR" | "HAZY" | "STORM" | "HOLD" | "DARK";

export type PollHealth = "idle" | "listening" | "ok" | "waiting" | "error";

export type Flight = {
  id: string;
  flightNo: string;
  carrier: string;
  slot: number;
  status: FlightStatus;
  blockTime: number | null;
};

export type ChainWeather = {
  slot: number;
  tps: number;
  txPerSlot: number;
  feeP90: number;
  feePressure: number;
  congested: boolean;
  kind: WeatherKind;
  line: string;
};

export type BoardState = {
  armed: boolean;
  flights: Flight[];
  weather: ChainWeather | null;
  health: PollHealth;
  note: string;
  rpcHost: string;
  clock: string;
};
