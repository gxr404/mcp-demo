import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getItemList, FetchType, fetchFnMap, getUserInfo, getItem, getItemListMd } from 'hacker-news-fetch'
import z from 'zod';


const enum TOOL_NAME {
  HACKER_NEWS_LIST = 'hacker-news-list',
  HACKER_NEWS_LIST_MD = 'hacker-news-list-md',
  HACKER_NEWS_USERINFO = 'hacker-news-userinfo',
  HACKER_NEWS_ITEM = 'hacker-news-item'
}

class HackerNewsServer {
  private mcpServer: McpServer
  mdResource: Map<string, string> = new Map()
  description = {
    name: 'hacker-news-server',
    version: '0.0.1'
  }
  constructor() {
    this.mcpServer = new McpServer(this.description)
    this.setupTool()
    this.setupPrompt()
    this.setupResource()
    this.eventListener()
  }

  eventListener() {
    this.mcpServer.server.onerror = (error) => console.error('[MCP Error]', error)
    process.on('SIGINT', async () => {
      await this.mcpServer.close()
      process.exit(0)
    })
  }
  setupTool() {

    this.mcpServer.registerTool(
      TOOL_NAME.HACKER_NEWS_LIST,
      {
        title: TOOL_NAME.HACKER_NEWS_LIST,
        description: '获取 Hacker News 列表',
        inputSchema: {
          type: z.string().describe('Hacker News 列表类型, top/new/best/ask/show/job'),
          page: z.number().min(1).describe('页码 (default: 1)').optional(),
          pageSize: z.number().min(1).max(40).describe('每页数据条数 (default: 30)').optional()
        }
      },
      async ({type, page, pageSize}) => {
        if (!fetchFnMap.has(type as FetchType)) {
          throw new McpError(ErrorCode.InvalidParams,`未知类型: ${type}`)
        }
        try {
          const results = await getItemList(type as FetchType, page, pageSize)
          return {
            content: [{
              type: "text",
              text: JSON.stringify(results, null, 2)
            }],
          }
        } catch (e) {
          return {
            content: [{
              type: "text",
              text: `失败: ${
                e instanceof Error ? e.message : String(e)
              }`,
              isError: true
            }],
          }
        }
      }
    )

    this.mcpServer.registerTool(
      TOOL_NAME.HACKER_NEWS_USERINFO,
      {
        title: TOOL_NAME.HACKER_NEWS_USERINFO,
        description: '获取 Hacker News 用户信息',
        inputSchema: {
          userId: z.string().describe('Hacker News 用户ID(用户名)')
        }
      },
      async ({ userId }) => {
        try {
          const results = await getUserInfo(userId)
          return {
            content: [{
              type: "text",
              text: JSON.stringify(results, null, 2)
            }],
          }
        } catch (e) {
          return {
            content: [{
              type: "text",
              text: `失败: ${
                e instanceof Error ? e.message : String(e)
              }`,
              isError: true
            }],
          }
        }
      }
    )

    this.mcpServer.registerTool(
      TOOL_NAME.HACKER_NEWS_ITEM,
      {
        title: TOOL_NAME.HACKER_NEWS_ITEM,
        description: '通过id 获取 Hacker News item 内容',
        inputSchema: {
          id: z.number().describe('Hacker News item id')
        }
      },
      async ({ id }) => {
        try {
          const results = await getItem(String(id))
          return {
            content: [{
              type: "text",
              text: JSON.stringify(results, null, 2)
            }],
          }
        } catch (e) {
          return {
            content: [{
              type: "text",
              text: `失败: ${
                e instanceof Error ? e.message : String(e)
              }`,
              isError: true
            }],
          }
        }
      }
    )

    this.mcpServer.registerTool(
      TOOL_NAME.HACKER_NEWS_LIST_MD,
      {
        title: TOOL_NAME.HACKER_NEWS_LIST_MD,
        description: '获取 Hacker News 列表 生成 mardkown Resource',
        inputSchema: {
          type: z.string().describe('Hacker News 列表类型, top/new/best/ask/show/job'),
          page: z.number().min(1).describe('页码 (default: 1)').optional(),
          pageSize: z.number().min(1).max(40).describe('每页数据条数 (default: 30)').optional()
        }
      },
      async ({type, page, pageSize}) => {
        if (!fetchFnMap.has(type as FetchType)) {
          throw new McpError(ErrorCode.InvalidParams,`未知类型: ${type}`)
        }
        try {
          const results = await getItemListMd(type as FetchType, page, pageSize)
          const resourceUri = this.addMarkdownResource(results, type, page, pageSize)

          return {
            content: [{
              type: "text",
              text: `${resourceUri}`
            }, {
              type: 'text',
              mimeType: 'text/markdown',
              text: results
            }]
          }
        } catch (e) {
          return {
            content: [{
              type: "text",
              text: `失败: ${
                e instanceof Error ? e.message : String(e)
              }`,
              isError: true
            }],
          }
        }
      }
    )
  }

  setupPrompt() {
    this.mcpServer.registerPrompt(
      'review-code',
      {
        title: "Code Review",
        description: "Review code for best practices and potential issues(查看最佳实践和潜在问题的代码)",
        argsSchema: { code: z.string() }
      },
      ({ code }: {code: string}) => ({
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `Please review this code:\n\n${code}`
          }
        }]
      })
    )
  }

  setupResource() {
    this.mcpServer.registerResource(
      'hackernews',
      new ResourceTemplate("hacker-news-list:///{type}/{page}/{pageSize}/{time}", { list: undefined }),
      {
        title: 'hacker news list',
        description: "Hacker News list",
        mimeType: 'text/markdown',
      },
      async (uri, { type, page, pageSize, time }) => {
        const key = `${type}/${page || 1}/${pageSize || 30}/${time}`
        const data = this.mdResource.get(key)
        if (data) {
          return {
            contents: [{
              uri: uri.href,
              text: data,
              mimeType: 'text/markdown'
            }]
          }
        }
        return {
          contents: [{
            uri: uri.href,
            text: `Not Found`
          }],
        }
      }
    )
  }

  addMarkdownResource(data: string, type: string, page?: number, pageSize?: number) {
    const key = `${type}/${page || 1}/${pageSize || 30}/${Date.now()}`
    const resouceUri = `hacker-news-list:///${key}`
    this.mdResource.set(key, data)
    this.mcpServer.registerResource(
      `hackernews: ${key}`,
      resouceUri,
      {
        title: 'hacker news list',
        description: "Hacker News list",
        mimeType: 'text/markdown',
      },
      async (uri) => ({
        contents: [{
          uri: uri.href,
          text: data
        }]
      })
    )
    this.mcpServer.sendResourceListChanged()
    // this.mcpServer.notification({
    //   method: "notifications/resources/list_changed",
    // });
    return resouceUri
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.mcpServer.connect(transport);
    console.error("hacker-news MCP server running on stdio test");
  }
}

const server = new HackerNewsServer()
server.run().catch(console.error)
