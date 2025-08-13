import fs from 'node:fs/promises'
import path from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js'

async function main() {
  const client = new Client({
    name: 'hacker-news-client',
    version: '0.0.1'
  }, {
    capabilities: {}
  })

  const stdioTransport= new StdioClientTransport({
    command: "npx",
    args:  [
      "-y",
      "hacker-news-server"
    ]
    // command: "node",
    // args:  [
    //   "../server/dist/index.js"
    // ]
  })
  await client.connect(stdioTransport)

  // 获取该mcp 支持的所有tool
  const { tools } = await client.request(
    { method: "tools/list" },
    ListToolsResultSchema
  );

  console.log('可用工具列表:');
  tools.forEach(tool => {
    console.log(`- 工具名称: ${tool.name}`);
    console.log(`  描述: ${tool.description}`);
    console.log('————————————————————————————————');
  });

  console.log('Call Tool:')

  const page1 = await client.callTool({
    name: 'hacker-news-list-md',
    arguments: {
      type: 'top',
    }
  }).catch(e => {
    console.error(e)
    return {
      isError: true,
      content: ''
    }
  })

  const page2 = await client.callTool({
    name: 'hacker-news-list-md',
    arguments: {
      type: 'top',
      page: 2
    }
  }).catch(e => {
    console.error(e)
    return {
      isError: true,
      content: ''
    }
  })


  await fs.mkdir(path.resolve('./assets'), { recursive: true })

  if (!page1.isError) {
    const page1Resouce = await client.readResource({
      uri: (page1.content as any)?.at(0).text
    })

    if (page1Resouce.contents[0].text) {
      await fs.writeFile(
        path.resolve('./assets/page1-list.md'),
        page1Resouce.contents[0].text as string
      )
      console.log('write success page1')
    }
  }

  if (!page2.isError) {
    const page2Resouce = await client.readResource({
      uri: (page2.content as any)?.at(0).text
    })

    if (page2Resouce.contents[0].text) {
      await fs.writeFile(
        path.resolve('./assets/page2-list.md'),
        page2Resouce.contents[0].text as string
      )
      console.log('write success page2')
    }
  }

  console.log('—————————————— End ——————————————————')
}

main()
