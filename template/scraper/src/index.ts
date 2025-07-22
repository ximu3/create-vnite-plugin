import type {
  IPluginAPI,
  ScraperProvider,
  GameList,
  ScraperIdentifier,
  GameMetadata
} from 'vnite-plugin-sdk'

/**
 * 刮削器示例插件
 *
 * 完成Provider即可
 */

// 插件激活函数
async function activate(api: IPluginAPI): Promise<void> {
  global.vniteAPI = api

  const provider: ScraperProvider = {
    id: 'example-scraper',
    name: '示例刮削器',

    // 以下均为可选实现，应删去任何无法实现的函数
    // 适用于游戏添加器的刮削器至少要实现 searchGames、checkGameExists、getGameMetadata、getGameBackgrounds、getGameCovers 函数
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

  api.scraper.registerProvider(provider)
}

// 插件停用函数
async function deactivate(api: IPluginAPI): Promise<void> {}

// 导出插件
export default {
  activate,
  deactivate
}
