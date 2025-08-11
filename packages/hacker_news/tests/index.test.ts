import { describe, expect, expectTypeOf, it } from 'vitest'
import { FetchType, getAskStories, getBestStories, getItem, getItemList, getJobStories, getNewStories, getShowStories, getTopStories, getUserInfo } from '../src'
import { AllTypeItem } from '../src/types/api'

it('getUserInfo', async () => {
  const userInfo = await getUserInfo('gxr1020')
  expect(userInfo).toEqual({
    created: 1664081189,
    id: 'gxr1020',
    karma: 1
  })
})

describe('getItem', () => {
  it('should work', async () => {
    const itemInfo = await getItem('8863')
    expect(itemInfo).toEqual({
      "by" : "dhouston",
      "descendants" : 71,
      "id" : 8863,
      kids: [
        9224, 8917, 8884,  8887, 8952,
        8869, 8873, 8958,  8940, 8908,
        9005, 9671, 9067,  9055, 8865,
        8881, 8872, 8955, 10403, 8903,
        8928, 9125, 8998,  8901, 8902,
        8907, 8894, 8870,  8878, 8980,
        8934, 8943, 8876
      ],
      "score" : 104,
      "time" : 1175714200,
      "title" : "My YC app: Dropbox - Throw away your USB drive",
      "type" : "story",
      "url" : "http://www.getdropbox.com/u/2/screencast.html"
    })
    // expectTypeOf(itemInfo).toEqualTypeOf<AllTypeItem>()
  })
  it('missing parameter', async () => {
    // @ts-ignore
    expect(getItem()).rejects.toThrow('missing parameter')
  })
})

it('getTopstories', async () => {
  const stories = await getTopStories()
  expect(stories).toHaveLength(500)
  expectTypeOf(stories).toEqualTypeOf<number[]>()
})

it('getNewStories', async () => {
  const stories = await getNewStories()
  expect(stories).toHaveLength(500)
  expectTypeOf(stories).toEqualTypeOf<number[]>()
})

it('getBestStories', async () => {
  const stories = await getBestStories()
  expect(stories).toHaveLength(200)
  expectTypeOf(stories).toEqualTypeOf<number[]>()
})

it('getAskStories', async () => {
  const stories = await getAskStories()
  // console.log(stories)
  expectTypeOf(stories).toEqualTypeOf<number[]>()
})


it('getShowStories', async () => {
  const stories = await getShowStories()
  // console.log(stories)
  expectTypeOf(stories).toEqualTypeOf<number[]>()
})

it('getJobStories', async () => {
  const stories = await getJobStories()
  // console.log(stories)
  expectTypeOf(stories).toEqualTypeOf<number[]>()
})

// it('getMaxItem', async () => {
//   const stories = await getMaxItem()
//   // console.log(stories)
//   expectTypeOf(stories).toEqualTypeOf<number>()
// })

describe('getItemList', () => {
  it('should work', async () => {
    const itemInfoList = await getItemList(FetchType.Top)
    // const itemInfoList = await getItemList(FetchType.AskStories)
    // const itemInfoList = await getItemList(FetchType.ShowStories)
    // const itemInfoList = await getItemList(FetchType.BestStories)
    // const itemInfoList = await getItemList(FetchType.NewStories)
    // const itemInfoList = await getItemList(FetchType.MaxItem)
    // const itemInfoList = await getItemList(FetchType.JobStories)
    // console.log(itemInfoList)
    expect(itemInfoList).toHaveLength(10)
    expectTypeOf(itemInfoList).toEqualTypeOf<AllTypeItem[]>()

  })

  it('custom page pageSize', async () => {
    const itemInfoList = await getItemList(FetchType.Top, 2, 4)
    const itemInfoList2 = await getItemList(FetchType.Top, 1, 10)
    // console.log(itemInfoList)
    expect(itemInfoList).toHaveLength(4)
    expect(itemInfoList2.at(4)).toEqual(itemInfoList.at(0))
    expectTypeOf(itemInfoList).toEqualTypeOf<AllTypeItem[]>()
  })

  it('out of range', async () => {
    const itemInfoList = await getItemList(FetchType.Top, 51, 10)
    expect(itemInfoList).toHaveLength(0)
    expect(itemInfoList).toEqual([])
  })
})
