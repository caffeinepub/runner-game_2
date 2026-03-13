import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HighScore } from "../backend.d";
import { useActor } from "./useActor";

export function useLeaderBoard(limit = 10) {
  const { actor, isFetching } = useActor();
  return useQuery<HighScore[]>({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderBoard(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveHighScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playerName,
      score,
    }: { playerName: string; score: number }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveHighScore(playerName, BigInt(score));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
