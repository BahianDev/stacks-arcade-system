export interface Player {
  id: string;
  name: string;
  walletAddress: string;
  points: number;
  dailyLogins: number;
  lastLoginDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  player: Player;
  pointsChange: number;
  daysInactive: number;
}

export interface GameScore {
  gameId: string;
  gameName: string;
  score: number;
  date: string;
}