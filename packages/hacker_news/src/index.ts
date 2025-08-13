import type { AllTypeItem, StoryItem, UserInfo } from "./types/api"


const HOST = 'https://hacker-news.firebaseio.com/v0'


export function getUserInfo(userId: string) {
  return fetch(`${HOST}/user/${userId}.json`, {
    method: 'GET'
  }).then((res) => {
    return res.json() as Promise<UserInfo>
  })
}

export function getItem(itemId: string) {
  if (!itemId) {
    return Promise.reject(new Error('missing parameter'))
  }
  return fetch(`${HOST}/item/${itemId}.json`, {
    method: 'GET'
  }).then((res) => {
    return res.json() as Promise<AllTypeItem>
  })
}

/**  最新前500条热门文章(也包含招聘信息) */
export function getTopStories() {
  return fetch(`${HOST}/topstories.json`, {
    method: 'GET'
  }).then((res) => {
    return res.json() as Promise<number[]>
  })
}

/** 500条最新文章 */
export function getNewStories() {
  return fetch(`${HOST}/newstories.json`, {
    method: 'GET'
  }).then((res) => {
    return res.json() as Promise<number[]>
  })
}

/** 500条 历史最热文章 */
export function getBestStories() {
  return fetch(`${HOST}/beststories.json`, {
    method: 'GET'
  }).then((res) => {
    return res.json() as Promise<number[]>
  })
}

export function getAskStories() {
  return fetch(`${HOST}/askstories.json`, {
    method: 'GET'
  }).then((res) => {
    return res.json() as Promise<number[]>
  })
}

export function getShowStories() {
  return fetch(`${HOST}/showstories.json`, {
    method: 'GET'
  }).then((res) => {
    return res.json() as Promise<number[]>
  })
}

export function getJobStories() {
  return fetch(`${HOST}/jobstories.json`, {
    method: 'GET'
  }).then((res) => {
    return res.json() as Promise<number[]>
  })
}

// export function getMaxItem() {
//   console.log(`${HOST}/maxitem.json`)
//   return fetch(`${HOST}/maxitem.json`, {
//     method: 'GET'
//   }).then((res) => {
//     return res.json() as Promise<number[]>
//   })
// }

export const enum FetchType {
  Top = 'top',
  New = 'new',
  Best = 'best',
  Ask = 'ask',
  Show = 'show',
  Job = 'job',
  // MaxItem = 'MaxItem'
}


export const fetchFnMap = new Map([
  [FetchType.Top, getTopStories],
  [FetchType.New, getNewStories],
  [FetchType.Best, getBestStories],
  [FetchType.Ask, getAskStories],
  [FetchType.Show, getShowStories],
  [FetchType.Job, getJobStories],
  // [FetchType.MaxItem, getMaxItem],
])

export async function getItemList(type: FetchType, page = 1, pageSize = 30) {
  if (!type) return []
  const fetchFn = fetchFnMap.get(type)
  if (!fetchFn) return []

  const idList = await fetchFn()
  const chunks = idList.reduce((pre, cur) => {
    if (!Array.isArray(pre.at(-1))) pre.push([])
    const lastItem: number[] = pre.at(-1) || []
    if (lastItem.length < pageSize) {
      lastItem.push(cur)
    } else {
      pre.push([cur])
    }
    return pre
  }, [] as number[][])

  const pageIdList = chunks.at(page - 1)
  if (!pageIdList?.length) return []
  const pList = pageIdList.map((id) => getItem(String(id)))

  return Promise.all(pList)
}


export async function getItemListMd(type: FetchType, page = 1, pageSize = 30) {
  const list = await getItemList(type, page, pageSize)
  const header  = `# ${type} Stories\n\n`
  const content = list.map((item) => {
    return `- [${item.by}]: [${(item as StoryItem)?.title || item?.text}](${(item as StoryItem)?.url})`
  }).join('\n')
  return `${header}${content}\n\n`
}
