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
    // command: "npx",
    // args:  [
    //   "-y",
    //   "hacker-news-server"
    // ]
    command: "node",
    args:  [
      "../server/dist/index.js"
    ]
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

  const result = await client.callTool({
    name: 'hacker-news-list',
    arguments: {
      type: 'top'
    }
  })

  console.log(result)
}

main()
