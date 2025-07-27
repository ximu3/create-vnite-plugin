import type { ScraperProvider, GameList, ScraperIdentifier, GameMetadata } from 'vnite-plugin-sdk'

export const provider: ScraperProvider = {
  id: 'example-scraper',
  name: 'Example Scraper',

  // The following are all optional implementations, remove any functions that cannot be implemented
  // For scrapers used by the game adder, at minimum implement
  // searchGames, checkGameExists, getGameMetadata, getGameBackgrounds, getGameCovers functions
  async searchGames(gameName: string): Promise<GameList> {
    return []
  },

  async checkGameExists(identifier: ScraperIdentifier): Promise<boolean> {
    return false
  },

  async getGameMetadata(identifier: ScraperIdentifier): Promise<GameMetadata> {
    return {} as GameMetadata
  },

  async getGameBackgrounds(identifier: ScraperIdentifier): Promise<string[]> {
    return []
  },

  async getGameCovers(identifier: ScraperIdentifier): Promise<string[]> {
    return []
  },

  async getGameLogos(identifier: ScraperIdentifier): Promise<string[]> {
    return []
  },

  async getGameIcons(identifier: ScraperIdentifier): Promise<string[]> {
    return []
  }
}
