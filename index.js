#!/usr/bin/env node

/**
 * create-vnite-plugin
 * A scaffolding tool for creating Vnite plugins
 * Usage: npm create vnite-plugin <plugin-name>
 */

const fs = require('fs-extra')
const path = require('path')
const prompts = require('prompts')

// 简单的颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
}

function showHelp() {
  console.log(`
${colors.bold('🚀 Create Vnite Plugin')}

${colors.blue('用法:')}
  npm create vnite-plugin [plugin-name]

${colors.blue('示例:')}
  npm create vnite-plugin my-awesome-plugin   # 直接指定名称
  npm create vnite-plugin                     # 交互式创建

${colors.blue('更多信息:')}
  GitHub: https://github.com/ximu3/create-vnite-plugin
  `)
}

function validatePluginName(name) {
  if (!name) {
    return false
  }

  // 检查插件名称格式
  const validName = /^[a-z0-9-_]+$/
  return validName.test(name)
}

// 将字符串转换为小写并将空格替换为连字符
function formatString(str) {
  return str.toLowerCase().replace(/\s+/g, '-')
}

async function collectPluginInfo(providedName) {
  console.log(colors.bold('\n🎯 让我们创建你的 Vnite 插件!'))
  console.log(colors.blue('请回答以下问题来配置你的插件:\n'))

  const questions = [
    {
      type: 'text',
      name: 'name',
      message: '插件名称 (只能包含小写字母、数字、连字符和下划线)',
      initial: providedName || 'example-plugin',
      validate: (value) => {
        if (!value) return '插件名称不能为空'
        if (!validatePluginName(value)) {
          return '插件名称只能包含小写字母、数字、连字符和下划线'
        }
        return true
      }
    },
    {
      type: 'text',
      name: 'description',
      message: '插件描述',
      initial: (prev) => `A Vnite plugin: ${prev}`
    },
    {
      type: 'text',
      name: 'author',
      message: '作者姓名',
      initial: 'YourName'
    },
    {
      type: 'select',
      name: 'category',
      message: '插件类别',
      choices: [
        { title: 'Common (通用)', value: 'common' },
        { title: 'Scraper (刮削器)', value: 'scraper' }
      ],
      initial: 0
    },
    {
      type: 'text',
      name: 'license',
      message: '许可证',
      initial: 'GPL-3.0-only'
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: '确认创建插件?',
      initial: true
    }
  ]

  try {
    const response = await prompts(questions, {
      onCancel: () => {
        console.log(colors.yellow('\n❌ 已取消创建插件'))
        process.exit(0)
      }
    })

    if (!response.confirm) {
      console.log(colors.yellow('\n❌ 已取消创建插件'))
      process.exit(0)
    }

    // 自动生成关键词而不是让用户输入
    response.keywords = ['vnite-plugin', response.category, response.name]

    return response
  } catch (error) {
    console.error(colors.red('❌ 输入错误:'), error.message)
    process.exit(1)
  }
}

async function createPlugin(pluginInfo) {
  const { name: pluginName, description, author, category, keywords, license } = pluginInfo
  const targetDir = path.resolve(process.cwd(), pluginName)
  const templateDir = path.join(__dirname, `template/${category}`)

  // 检查目录是否已存在
  if (await fs.pathExists(targetDir)) {
    console.error(colors.red(`❌ 错误: 目录 "${pluginName}" 已存在`))
    process.exit(1)
  }

  // 检查模板目录是否存在
  if (!(await fs.pathExists(templateDir))) {
    console.error(colors.red(`❌ 错误: 模板目录 "${category}" 不存在`))
    console.error(
      colors.yellow(`请确认在 ${path.dirname(templateDir)} 中存在 ${category} 模板目录`)
    )
    process.exit(1)
  }

  console.log(colors.blue(`\n🏗️  创建插件: ${colors.bold(pluginName)}`))
  console.log(colors.blue(`📍 目标目录: ${targetDir}`))

  try {
    // 创建目标目录
    await fs.ensureDir(targetDir)

    // 复制模板文件
    await fs.copy(templateDir, targetDir)

    // 更新 package.json
    const packageJsonPath = path.join(targetDir, 'package.json')

    // 确认 package.json 存在
    if (!(await fs.pathExists(packageJsonPath))) {
      throw new Error(`模板目录中缺少 package.json 文件`)
    }

    const packageJson = await fs.readJson(packageJsonPath)

    // 格式化author和pluginName
    const formattedAuthor = formatString(author)
    const formattedPluginName = formatString(pluginName)

    // 应用用户输入的信息
    packageJson.id = `${formattedAuthor}/${formattedPluginName}`
    packageJson.name = pluginName
    packageJson.description = description
    packageJson.author = author
    packageJson.license = license
    packageJson.category = category
    packageJson.keywords = keywords

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })

    // 创建自定义的 README
    const readmePath = path.join(targetDir, 'README.md')
    const readmeContent = `# ${pluginName}

${description}

## 开发者

${author}

## 安装

\`\`\`bash
# 开发模式
npm install

# 打包
npm run pack
\`\`\`

## 许可证

${license}
`

    await fs.writeFile(readmePath, readmeContent)

    console.log(colors.green('\n✅ 插件创建成功!'))

    // 显示创建的插件信息
    console.log(colors.blue('\n📋 插件信息:'))
    console.log(colors.yellow(`  名称: ${pluginName}`))
    console.log(colors.yellow(`  描述: ${description}`))
    console.log(colors.yellow(`  作者: ${author}`))
    console.log(colors.yellow(`  类别: ${category}`))
    console.log(colors.yellow(`  关键词: ${keywords.join(', ')}`))
    console.log(colors.yellow(`  许可证: ${license}`))

    console.log(colors.blue('\n📦 接下来的步骤:'))
    console.log(colors.yellow(`  cd ${pluginName}`))
    console.log(colors.yellow('  npm install'))

    console.log(colors.blue('\n🔗 有用的命令:'))
    console.log(colors.yellow('  npm run pack      # 打包为 .vnpkg 文件'))

    console.log(colors.green('\n🎉 开始开发你的 Vnite 插件吧!'))
  } catch (error) {
    console.error(colors.red('❌ 创建插件时出错:'), error.message)
    // 清理已创建的目录
    if (await fs.pathExists(targetDir)) {
      await fs.remove(targetDir)
    }
    process.exit(1)
  }
}

async function main() {
  const args = process.argv.slice(2)

  // 显示帮助信息
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    return
  }

  // 显示版本信息
  if (args.includes('--version') || args.includes('-v')) {
    const packageJson = require(path.join(__dirname, 'package.json'))
    console.log(`create-vnite-plugin v${packageJson.version || '1.0.0'}`)
    return
  }

  // 获取可能提供的插件名称
  const providedName = args[0] && !args[0].startsWith('-') ? args[0] : null

  // 如果提供了名称但格式不正确，显示错误
  if (providedName && !validatePluginName(providedName)) {
    console.error(colors.red('❌ 错误: 插件名称只能包含小写字母、数字、连字符和下划线'))
    console.log(colors.blue('💡 提示: 你可以不提供名称，我们将引导你交互式创建'))
    process.exit(1)
  }

  // 收集插件信息（交互式或使用提供的名称）
  const pluginInfo = await collectPluginInfo(providedName)

  // 创建插件
  await createPlugin(pluginInfo)
}

// 只有直接运行时才执行main
if (require.main === module) {
  main().catch((error) => {
    console.error(colors.red('❌ 意外错误:'), error.message)
    process.exit(1)
  })
}

// 导出函数供测试使用
module.exports = {
  collectPluginInfo,
  createPlugin,
  validatePluginName
}
