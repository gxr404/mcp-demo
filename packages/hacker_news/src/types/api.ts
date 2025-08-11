
export type WebUrl = `${'https://' | 'http://' | '/'}${string}`
export type Simplify<T> = {
  [P in keyof T]: T[P]
}

export interface CommonItem {
  /** item唯一的id */
  id: number
  /** 该item作者的用户名 */
  by: string
  /** item 创建日期（以 Unix 时间表示）*/
  time: number
  /** 如果item已 被删除 则为true  */
  deleted?:boolean
  /** 如果item已dead则为true */
  dead?: boolean
  // type:	'job'| 'story'| 'comment' | 'poll' | 'pollopt'
}

export const enum ItemType {
  /** 工作 */
  JOB = 'job',
  /** 故事 */
  STORY = 'story',
  /** 评论 */
  COMMENT = 'comment',
  /** 投票帖 */
  POLL = 'poll',
  /** 投票帖中的一个选项 */
  POLLOPT = 'pollopt'
}

/** 投票选项的Item */
export type PolloptItem = Simplify<CommonItem & {
  type: ItemType.POLLOPT
  /** 这个投票选项（pollopt）所关联的投票（poll）*/
  poll: number
  /** comment、story 或者 poll中的item文本(HTML格式) */
  text: string
  /** 故事贴(story)中的得分，或者 投票选项(pollopt)的投票数 */
  score: number
}>


/** 投票贴的Item */
export type PollItem = Simplify<CommonItem & {
  type: ItemType.POLL
  /** comment、story 或者 poll中的item文本(HTML格式) */
  text: string
  /** story, poll 或者 job的标题(HTML格式) */
  title: string
  /** 故事贴(story)中的得分，或者 投票选项(pollopt)的投票数 */
  score: number
  /** story, poll 中的总评论数 */
  descendants: number
  /** 该item的评论ID, 按排名显示顺序 */
  kids: number[]
  /**  关联的投票选项(pollopts)列表, 按显示顺序排列 */
  parts: number[]
}>

/** 找工作贴的Item */
export type JobItem = Simplify<CommonItem & {
  type: ItemType.JOB
  /** story的URL */
  url: WebUrl
  /** story, poll 或者 job的标题(HTML格式) */
  title: string
  /** comment、story 或者 poll中的item文本(HTML格式) */
  text: string
  /** 故事贴(story)中的得分，或者 投票选项(pollopt)的投票数 */
  score: number
}>

/** 故事贴的Item */
export type StoryItem = Simplify<CommonItem & {
  type: ItemType.STORY
  /** story, poll 中的总评论数 */
  descendants: number
  /** 该item的评论ID, 按排名显示顺序 */
  kids: number[]
  /** 故事贴(story)中的得分，或者 投票选项(pollopt)的投票数 */
  score: number
  /** story, poll 或者 job的标题(HTML格式) */
  title: string
  /** comment、story 或者 poll中的item文本(HTML格式) */
  text: string
  /** story的URL */
  url: WebUrl
}>

/** 评论的Item */
export type CommentItem = Simplify<CommonItem & {
  type: ItemType.COMMENT
    /** 该item的评论ID, 按排名显示顺序 */
  kids: number[]
 /** comment、story 或者 poll中的item文本(HTML格式) */
  text: string
  /**  评论的父级: 对应另一条评论 或者 相关 story的id  */
  parent: string
}>

export type AllTypeItem = PolloptItem | PollItem | JobItem | StoryItem | CommentItem

/** 用户信息 */
export interface UserInfo {
  /** 用户的唯一用户名 区分大小写 */
  id: string
  /** 用户可选的自我描述(HTML格式) */
  about: string
  /** 用户的创建日期（以 Unix 时间表示）*/
  create: number
  /** Karma 值，表示他们在社区中获得的声望或积分 */
  karma: number
  /** 用户提交过的的story、poll和comment的列表 id */
  submitted: number[]
}
