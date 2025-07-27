import type { IPluginAPI } from 'vnite-plugin-sdk'
import { provider } from './provider'

/**
 * Scraper example plugin
 *
 * Just complete the provider
 */

// Plugin activation function
async function activate(api: IPluginAPI): Promise<void> {
  global.vniteAPI = api

  api.scraper.registerProvider(provider)
}

// Plugin deactivation function
async function deactivate(api: IPluginAPI): Promise<void> {}

// Export plugin
export default {
  activate,
  deactivate
}
