import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";

actor {
  type HighScore = {
    playerName : Text;
    score : Nat;
  };

  module HighScore {
    public func compare(a : HighScore, b : HighScore) : Order.Order {
      Nat.compare(b.score, a.score);
    };
  };

  type Player = Text;

  let scoresByPlayer = Map.empty<Player, HighScore>();

  public shared ({ caller }) func saveHighScore(playerName : Text, score : Nat) : async () {
    switch (scoresByPlayer.get(playerName)) {
      case (null) { scoresByPlayer.add(playerName, { playerName; score }) };
      case (?existingScore) {
        if (score > existingScore.score) {
          scoresByPlayer.add(playerName, { playerName; score });
        } else {
          Runtime.trap("New score must be higher than existing score");
        };
      };
    };
  };

  public query ({ caller }) func getLeaderBoard(limit : Nat) : async [HighScore] {
    let allScores = scoresByPlayer.values().toArray().sort();
    let limitValue = if (limit > 0 and limit < allScores.size()) { limit } else {
      allScores.size();
    };
    allScores.sliceToArray(0, limitValue);
  };
};
