# hacker-news-fetch

- `getUserInfo`: 获取用户信息
- `getItem`: 根据item id 获取对应内容
- `getTopStories`: 最新前500条热门文章id
- `getNewStories`: 500条最新文章id
- `getBestStories`: 500条 历史最热文章id
- `getAskStories`:
- `getShowStories`:
- `getJobStories`:
- `getItemList`: 根据type 返回 内容列表
  - 内部调用`getTopStories`/`getNewStories`/`getBestStories`/`getAskStories`/`getShowStories`/`getJobStories`
- `getItemListMd`: 与 getItemList一致 额外添加对应 resource

