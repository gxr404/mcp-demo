# hacker-news-client

```bash
node ./dist/index.js
```

## 实现

1. 采用 本地通信 标准输入输出`StdioClientTransport` 调用 `npx -y hacker-news-server`
2. client通过`client.connect(stdioClientTransport)` 链接 mcp server
3. client调用server内的tool
    ```ts
      client.callTool({
        name: 'hacker-news-list',
        arguments: {
          type: 'top'
        }
      })
    ```
4. 如果tool有生成对应的resource, 可readResource保存文件
    ```ts
      // tool 生成 resource
      client.callTool({
        name: 'hacker-news-list-md',
        arguments: {
          type: 'top',
          page: 2
        }
      })
      //
      client.client.readResource({
        uri: `hacker-news-list:///top/1/30/1755050139287`
      })
    ```
