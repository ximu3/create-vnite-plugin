import type { IPluginAPI } from 'vnite-plugin-sdk'

/**
 * Common example plugin
 *
 * Can implement plugin functionality through the event system
 */

// Plugin activation function
async function activate(api: IPluginAPI): Promise<void> {
  global.vniteAPI = api

  api.eventBus.on('game:added', async (eventData) => {
    const gameName = eventData.name
  })
}

// Plugin deactivation function
async function deactivate(api: IPluginAPI): Promise<void> {}

// Export plugin
export default {
  activate,
  deactivate
}
