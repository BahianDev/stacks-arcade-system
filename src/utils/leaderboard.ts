import { Player, LeaderboardEntry } from '../types/leaderboard';

const STORAGE_KEY = 'morph-mania-leaderboard';
const DAILY_LOGIN_POINTS = 10;
const DAILY_DECAY_RATE = 0.025; // 2.5% per day

export class LeaderboardManager {
  private players: Player[] = [];

  constructor() {
    this.loadFromStorage();
    this.applyDailyDecay();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.players = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load leaderboard data:', error);
      this.players = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.players));
    } catch (error) {
      console.warn('Failed to save leaderboard data:', error);
    }
  }

  private applyDailyDecay(): void {    
    this.players = this.players.map(player => {
      const lastLogin = new Date(player.lastLoginDate);
      const daysSinceLogin = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLogin > 0) {
        // Apply decay for each day missed
        const decayFactor = Math.pow(1 - DAILY_DECAY_RATE, daysSinceLogin);
        const newPoints = Math.floor(player.points * decayFactor);
        
        return {
          ...player,
          points: Math.max(0, newPoints), // Don't go below 0
          updatedAt: new Date().toISOString()
        };
      }
      
      return player;
    });
    
    this.saveToStorage();
  }

  public getOrCreatePlayer(name: string, walletAddress: string): Player {
    let player = this.players.find(p => p.walletAddress === walletAddress);
    
    if (!player) {
      player = {
        id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        walletAddress,
        points: 0,
        dailyLogins: 0,
        lastLoginDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.players.push(player);
      this.saveToStorage();
    }
    
    return player;
  }

  public recordDailyLogin(walletAddress: string): boolean {
    const player = this.players.find(p => p.walletAddress === walletAddress);
    if (!player) return false;
    
    const today = new Date().toDateString();
    const lastLoginDate = new Date(player.lastLoginDate).toDateString();
    
    // Only award points if it's a new day
    if (today !== lastLoginDate) {
      player.points += DAILY_LOGIN_POINTS;
      player.dailyLogins += 1;
      player.lastLoginDate = new Date().toISOString();
      player.updatedAt = new Date().toISOString();
      
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  public addGameScore(walletAddress: string, gameScore: number): void {
    const player = this.players.find(p => p.walletAddress === walletAddress);
    if (!player) return;
    
    player.points += gameScore;
    player.updatedAt = new Date().toISOString();
    this.saveToStorage();
  }

  public getLeaderboard(): LeaderboardEntry[] {
    // Apply decay before generating leaderboard
    this.applyDailyDecay();
    
    // Sort by points descending
    const sortedPlayers = [...this.players].sort((a, b) => b.points - a.points);
    
    return sortedPlayers.map((player, index) => {
      const lastLogin = new Date(player.lastLoginDate);
      const daysInactive = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        rank: index + 1,
        player,
        pointsChange: 0, // Could track daily changes if needed
        daysInactive
      };
    });
  }

  public getPlayerStats(walletAddress: string): Player | null {
    return this.players.find(p => p.walletAddress === walletAddress) || null;
  }

  public getTotalPlayers(): number {
    return this.players.length;
  }

  public getActivePlayers(): number {
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    return this.players.filter(p => new Date(p.lastLoginDate).getTime() > threeDaysAgo).length;
  }
}

// Singleton instance
export const leaderboardManager = new LeaderboardManager();