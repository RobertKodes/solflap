import { PublicKey } from "@solana/web3.js";

export type KnownProgram = {
  id: string;
  name: string;
  key: PublicKey;
};

const RAW: Array<[string, string]> = [
  ["11111111111111111111111111111111", "SYSTEM"],
  ["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", "TOKEN"],
  ["TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", "TOK2022"],
  ["ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", "ATA"],
  ["ComputeBudget111111111111111111111111111111", "COMPUTE"],
  ["MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr", "MEMO"],
  ["Stake11111111111111111111111111111111111111", "STAKE"],
  ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", "JUPITER"],
  ["675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", "RAYDIUM"],
  ["CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", "RAY-CLMM"],
  ["whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", "ORCA"],
  ["PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY", "PHOENIX"],
  ["srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX", "OPENBOOK"],
  ["metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s", "METAPLEX"],
  ["MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD", "MARINADE"],
  ["dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH", "DRIFT"],
  ["KLend2g3cP87fffoy8q1mQqGKjrxjC8boUYqWG3pVL", "KLEND"],
  ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "USDC"],
];

const seen = new Set<string>();

export const KNOWN_PROGRAMS: KnownProgram[] = RAW.filter(([id]) => {
  if (seen.has(id)) return false;
  seen.add(id);
  return true;
}).map(([id, name]) => ({
  id,
  name,
  key: new PublicKey(id),
}));

export const FEE_WATCH = KNOWN_PROGRAMS.slice(0, 6).map((p) => p.key);

export function nicknameFor(id: string): string {
  const hit = KNOWN_PROGRAMS.find((p) => p.id === id);
  if (hit) return hit.name;
  return `${id.slice(0, 4)}…${id.slice(-3)}`.toUpperCase();
}
