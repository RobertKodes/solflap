import { PublicKey } from "@solana/web3.js";

export type KnownProgram = {
  id: string;
  name: string;
  key: PublicKey;
};

const RAW: Array<[string, string]> = [
  ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", "JUPITER"],
  ["675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", "RAYDIUM"],
  ["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", "TOKEN"],
  ["11111111111111111111111111111111", "SYSTEM"],
  ["whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", "ORCA"],
  ["PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY", "PHOENIX"],
  ["dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH", "DRIFT"],
  ["LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo", "METEORA"],
  ["6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P", "PUMP"],
  ["MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD", "MARINADE"],
  ["metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s", "METAPLEX"],
  ["CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", "RAY-CLMM"],
  ["KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD", "KLEND"],
  ["srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX", "OPENBOOK"],
  ["ComputeBudget111111111111111111111111111111", "COMPUTE"],
  ["ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", "ATA"],
  ["TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", "TOK2022"],
  ["MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr", "MEMO"],
  ["Stake11111111111111111111111111111111111111", "STAKE"],
  ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "USDC"],
];

const seen = new Set<string>();

export const KNOWN_PROGRAMS: KnownProgram[] = RAW.flatMap(([id, name]) => {
  if (seen.has(id)) return [];
  seen.add(id);
  try {
    return [{ id, name, key: new PublicKey(id) }];
  } catch {
    return [];
  }
});

export const FEE_WATCH = KNOWN_PROGRAMS.slice(0, 6).map((p) => p.key);

export function nicknameFor(id: string): string {
  const hit = KNOWN_PROGRAMS.find((p) => p.id === id);
  if (hit) return hit.name;
  return `${id.slice(0, 4)}…${id.slice(-3)}`.toUpperCase();
}
