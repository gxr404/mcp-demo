import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getItemList, FetchType, fetchFnMap, getUserInfo } from 'hacker-news-fetch'


const enum TOOL_NAME {
  HACKER_NEWS_LIST = 'hacker-news-list',
  HACKER_NEWS_USERINFO = 'hacker-news-userinfo',
}

class HackerNewsServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: 'hacker-news-server',
      version: '0.0.1'
    },
    {
      capabilities: {
        tools: {},
      },
    })
    this.setupTool()
    this.eventListener()
  }

  eventListener() {
    this.server.onerror = (error) => console.error('[MCP Error]', error)
    process.on('SIGINT', async () => {
      await this.server.close()
      process.exit(0)
    })
  }
  setupTool() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: TOOL_NAME.HACKER_NEWS_LIST,
            description: '获取 hacker news 列表',
            inputSchema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'hacker news 列表类型, top/new/best/ask/show/job'
                },
                page: {
                  type: 'number',
                  description: '页码 (default: 1)',
                  minimum: 1,
                },
                pageSize: {
                  type: 'number',
                  description: '每页数据条数 (default: 30)',
                  minimum: 1,
                  maximum: 30
                },
              },
              required: ['type']
            }
          },
          {
          name: TOOL_NAME.HACKER_NEWS_USERINFO,
            description: '获取 hacker news 用户信息',
            inputSchema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  description: 'hacker news 用户ID(用户名)'
                }
              },
              required: ['userId']
            }
          }
        ]
      }
    })
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {

      if (request.params.name === TOOL_NAME.HACKER_NEWS_LIST) {
        const type = request.params.arguments?.type as FetchType
        const page = request.params.arguments?.page as number
        const pageSize = request.params.arguments?.pageSize as number
        if (!fetchFnMap.has(type)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `未知工具: ${request.params.name}`
          );
        }
        const defaultRes = {
          content: [
            {
              type: "text",
              text: '',
              isError: false
            },
          ],
        }
        try {
          const results = await getItemList(type, page, pageSize)
          // console.log('results', results)
          defaultRes.content[0].text = JSON.stringify(results, null, 2)
          return defaultRes
        } catch (e) {
          defaultRes.content[0].text = `失败: ${
            e instanceof Error ? e.message : String(e)
          }`
          defaultRes.content[0].isError = true
          return defaultRes

        }
      }

      if (request.params.name === TOOL_NAME.HACKER_NEWS_USERINFO) {
        const userId = request.params.arguments?.userId as string

        const defaultRes = {
          content: [
            {
              type: "text",
              text: '',
              isError: false
            },
          ],
        }
        try {
          const results = await getUserInfo(userId)
          // console.log('results', results)
          defaultRes.content[0].text = JSON.stringify(results, null, 2)
          return defaultRes
        } catch (e) {
          defaultRes.content[0].text = `失败: ${
            e instanceof Error ? e.message : String(e)
          }`
          defaultRes.content[0].isError = true
          return defaultRes
        }
      }

      throw new McpError(
        ErrorCode.MethodNotFound,
        `未知工具: ${request.params.name}`
      );
    })
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("hacker-news MCP server running on stdio test");
  }
}

const server = new HackerNewsServer()
server.run().catch(console.error)
