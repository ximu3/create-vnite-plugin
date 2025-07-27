#!/usr/bin/env node

/**
 * create-vnite-plugin
 * A scaffolding tool for creating Vnite plugins
 * Usage: npm create vnite-plugin <plugin-name>
 */

const fs = require('fs-extra')
const path = require('path')
const prompts = require('prompts')

// Simple color output functions
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
}

function showHelp() {
  console.log(`
${colors.bold('Create Vnite Plugin')}

${colors.blue('Usage:')}
  npm create vnite-plugin [plugin-name]

${colors.blue('Examples:')}
  npm create vnite-plugin my-awesome-plugin   # Specify name directly
  npm create vnite-plugin                     # Create interactively

${colors.blue('More information:')}
  GitHub: https://github.com/ximu3/create-vnite-plugin
  `)
}

function validatePluginName(name) {
  if (!name) {
    return false
  }

  // Check plugin name format
  const validName = /^[a-z0-9-_]+$/
  return validName.test(name)
}

// Convert string to lowercase and replace spaces with hyphens
function formatString(str) {
  return str.toLowerCase().replace(/\s+/g, '-')
}

async function collectPluginInfo(providedName) {
  console.log(colors.bold("\nLet's create your Vnite plugin!"))
  console.log(colors.blue('Please answer the following questions to configure your plugin:\n'))

  const questions = [
    {
      type: 'text',
      name: 'name',
      message:
        'Plugin name (can only contain lowercase letters, numbers, hyphens, and underscores)',
      initial: providedName || 'example-plugin',
      validate: (value) => {
        if (!value) return 'Plugin name cannot be empty'
        if (!validatePluginName(value)) {
          return 'Plugin name can only contain lowercase letters, numbers, hyphens, and underscores'
        }
        return true
      }
    },
    {
      type: 'text',
      name: 'description',
      message: 'Plugin description',
      initial: (prev) => `A Vnite plugin: ${prev}`
    },
    {
      type: 'text',
      name: 'author',
      message: 'Author name',
      initial: 'YourName'
    },
    {
      type: 'select',
      name: 'category',
      message: 'Plugin category',
      choices: [
        { title: 'Common', value: 'common' },
        { title: 'Scraper', value: 'scraper' }
      ],
      initial: 0
    },
    {
      type: 'text',
      name: 'license',
      message: 'License',
      initial: 'GPL-3.0-only'
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Confirm plugin creation?',
      initial: true
    }
  ]

  try {
    const response = await prompts(questions, {
      onCancel: () => {
        console.log(colors.yellow('\nPlugin creation cancelled'))
        process.exit(0)
      }
    })

    if (!response.confirm) {
      console.log(colors.yellow('\nPlugin creation cancelled'))
      process.exit(0)
    }

    // Automatically generate keywords instead of asking the user
    response.keywords = ['vnite-plugin', response.category, response.name]

    return response
  } catch (error) {
    console.error(colors.red('Input error:'), error.message)
    process.exit(1)
  }
}

async function createPlugin(pluginInfo) {
  const { name: pluginName, description, author, category, keywords, license } = pluginInfo
  const targetDir = path.resolve(process.cwd(), pluginName)
  const templateDir = path.join(__dirname, `template/${category}`)

  // Check if directory already exists
  if (await fs.pathExists(targetDir)) {
    console.error(colors.red(`Error: Directory "${pluginName}" already exists`))
    process.exit(1)
  }

  // Check if template directory exists
  if (!(await fs.pathExists(templateDir))) {
    console.error(colors.red(`Error: Template directory "${category}" does not exist`))
    console.error(
      colors.yellow(
        `Please confirm that the ${category} template directory exists in ${path.dirname(
          templateDir
        )}`
      )
    )
    process.exit(1)
  }

  console.log(colors.blue(`\nCreating plugin: ${colors.bold(pluginName)}`))
  console.log(colors.blue(`Target directory: ${targetDir}`))

  try {
    // Create target directory
    await fs.ensureDir(targetDir)

    // Copy template files
    await fs.copy(templateDir, targetDir)

    // Update package.json
    const packageJsonPath = path.join(targetDir, 'package.json')

    // Confirm package.json exists
    if (!(await fs.pathExists(packageJsonPath))) {
      throw new Error(`package.json file is missing from template directory`)
    }

    const packageJson = await fs.readJson(packageJsonPath)

    // Format author and pluginName
    const formattedPluginName = formatString(pluginName)

    // Apply user input information
    packageJson.id = formattedPluginName
    packageJson.name = pluginName
    packageJson.description = description
    packageJson.author = author
    packageJson.license = license
    packageJson.category = category
    packageJson.keywords = keywords

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })

    // Create custom README
    const readmePath = path.join(targetDir, 'README.md')
    const readmeContent = `# ${pluginName}

${description}

## Developer

${author}

## Packaging

\`\`\`bash
npm install

npm run pack
\`\`\`

## License

${license}
`

    await fs.writeFile(readmePath, readmeContent)

    console.log(colors.green('\nPlugin created successfully!'))

    // Display created plugin information
    console.log(colors.blue('\nPlugin information:'))
    console.log(colors.yellow(`  Name: ${pluginName}`))
    console.log(colors.yellow(`  Description: ${description}`))
    console.log(colors.yellow(`  Author: ${author}`))
    console.log(colors.yellow(`  Category: ${category}`))
    console.log(colors.yellow(`  Keywords: ${keywords.join(', ')}`))
    console.log(colors.yellow(`  License: ${license}`))

    console.log(colors.blue('\nNext steps:'))
    console.log(colors.yellow(`  cd ${pluginName}`))
    console.log(colors.yellow('  npm install'))

    console.log(colors.blue('\nUseful commands:'))
    console.log(colors.yellow('  npm run pack      # Package as .vnpkg file'))

    console.log(colors.green('\nStart developing your Vnite plugin!'))
  } catch (error) {
    console.error(colors.red('Error creating plugin:'), error.message)
    // Clean up created directory
    if (await fs.pathExists(targetDir)) {
      await fs.remove(targetDir)
    }
    process.exit(1)
  }
}

async function main() {
  const args = process.argv.slice(2)

  // Show help information
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    return
  }

  // Show version information
  if (args.includes('--version') || args.includes('-v')) {
    const packageJson = require(path.join(__dirname, 'package.json'))
    console.log(`create-vnite-plugin v${packageJson.version || '1.0.0'}`)
    return
  }

  // Get possible provided plugin name
  const providedName = args[0] && !args[0].startsWith('-') ? args[0] : null

  // If name is provided but format is incorrect, show error
  if (providedName && !validatePluginName(providedName)) {
    console.error(
      colors.red(
        'Error: Plugin name can only contain lowercase letters, numbers, hyphens, and underscores'
      )
    )
    console.log(
      colors.blue("Tip: You can omit the name, and we'll guide you through interactive creation")
    )
    process.exit(1)
  }

  // Collect plugin information (interactive or using provided name)
  const pluginInfo = await collectPluginInfo(providedName)

  // Create plugin
  await createPlugin(pluginInfo)
}

// Only execute main when run directly
if (require.main === module) {
  main().catch((error) => {
    console.error(colors.red('Unexpected error:'), error.message)
    process.exit(1)
  })
}

// Export functions for testing
module.exports = {
  collectPluginInfo,
  createPlugin,
  validatePluginName
}
