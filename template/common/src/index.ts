import type { IPluginAPI } from 'vnite-plugin-sdk'

/**
 * 通用示例插件
 *
 * 可通过事件系统来实现插件功能
 */

// 插件激活函数
async function activate(api: IPluginAPI): Promise<void> {
  global.vniteAPI = api

  api.eventBus.on('game:added', async (eventData) => {
    const gameName = eventData.name
  })
}

// 插件停用函数
async function deactivate(api: IPluginAPI): Promise<void> {}

// 导出插件
export default {
  activate,
  deactivate
}
