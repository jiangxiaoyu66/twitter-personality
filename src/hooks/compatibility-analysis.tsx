import { useEffect, useRef, useState } from 'react'

import { CompatibilityAnalysis } from '@/components/analysis/compatibility'
import { SelectPair, SelectUser } from '@/drizzle/schema'
import { Steps, useTwitterAnalysis } from '@/hooks/twitter-analysis'
import { parsePartialJson } from '@/lib/parse-partial-json'

export type CompatibilitySteps = {
  user1Steps: Steps
  user2Steps: Steps
  compatibilityAnalysisStarted: boolean
  compatibilityAnalysisCompleted: boolean
}

export const useCompatibilityAnalysis = (user1: SelectUser, user2: SelectUser, pair: SelectPair) => {
  const { steps: user1Steps, result: user1Result } = useTwitterAnalysis(user1, true, pair.unlocked || false)
  const { steps: user2Steps, result: user2Result } = useTwitterAnalysis(user2, true, pair.unlocked || false)
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityAnalysis | undefined>((pair.analysis as CompatibilityAnalysis) || undefined)
  const [steps, setSteps] = useState<CompatibilitySteps>({
    user1Steps,
    user2Steps,
    compatibilityAnalysisStarted: pair.wordwareStarted || false,
    compatibilityAnalysisCompleted: pair.wordwareCompleted || false,
  })
  const effectRan = useRef(false)

  useEffect(() => {
    console.log(9999)

    // if (!pair.unlocked) return

    console.log('user1Steps', user1Steps)
    console.log('user2Steps', user2Steps)

    if (user1Steps.tweetScrapeCompleted && user2Steps.tweetScrapeCompleted && !steps.compatibilityAnalysisCompleted) {
      if (effectRan.current) return
      effectRan.current = true
      ;(async () => {
        setSteps((prev) => ({ ...prev, compatibilityAnalysisStarted: true }))
        const usernames = [user1.username, user2.username].sort()
        await handleCompatibilityAnalysis({ usernames, full: true, user1, user2 })
        setSteps((prev) => ({ ...prev, compatibilityAnalysisCompleted: true }))
      })()
    }
  }, [user1.username, user2.username, user1Steps, user2Steps, steps.compatibilityAnalysisStarted, pair.unlocked])

  const handleCompatibilityAnalysis = async ({user1,user2 }: { usernames: string[]; full: boolean; user1:any; user2: any }) => {
    // const handleCompatibilityAnalysis = async (props: { usernames: string[]; full: boolean; user1:any; user2: any }) => {
    if (steps.compatibilityAnalysisStarted && Date.now() - pair.wordwareStartedTime.getTime() < 2 * 60 * 1000) {
      console.log('Not starting compatibility analysis', steps.compatibilityAnalysisStarted, Date.now() - pair.wordwareStartedTime.getTime())
      return
    }
    // const response = await fetch('/api/wordware/pair', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(props),
    // })

    const res = await fetch(`https://chat.degpt.ai/api/v0/chat/completion`, {
      method: 'POST',
      headers: {
        // Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen2-72B',
        messages: [
          {
            role: 'system',
            content: `请根据以下两个用户的基本信息和他们的10条推文，生成一份详细的关系分析报告。报告应严格按照以下格式输出，并包括指定的内容。不需要其他描述信息，直接返回json数据就好！
            输出的对象中的value，看我待会儿给你的内容原本主要是什么语言，你就返回什么语言。
            给的结果尽量丰富，全面一些。其中，分析 Green Flags和 Red Flags的时候，请分析多个小点，控制在2到6个，具体数量请你看情况而定

            # **Instructions**

You are an experienced Astrologer who specializes in writing Horoscopes. Act like a horoscope teller.

Your job is to read the data provided below. This Twitter data is the only data you get to understand this person. You can make assumptions. Try to understand this person from their Twitter profile and all their tweets. You can sound a little controversial.

After understanding them, answer the following questions. You can make assumptions.  

*   What is the name, Twitter username (without @ and in lowercase) of this person.
    
*   Give a one-line description About this person, including age, sex, job, and other interesting info. This can be drawn from the profile picture. Start the sentence with "Based on our AI agent's analysis of your tweets...."
    

*   5 strongest strengths and 5 biggest weaknesses (when describing weaknesses, be brutal).
    

*   Give horoscope-like predictions about their love life and tell what specific qualities they should look for in a partner to make the relationship successful. Keep this positive and only a single paragraph.
    
*   Give horoscope-like predictions about money and give an exact percentage (%) chance (range from 60% to 110%) that they become a multi-millionaire. You can increment the value by 1%. The percentage doesn't have to end with 5 or 0. Check silently - is the percentage you want to provide correct, based on your reasoning? If yes, produce it. If not, change it.
    
*   Give horoscope-like predictions about health. Keep this optimistic and only a single paragraph.
    
*   After understanding them, tell them what is their biggest goal in life. This should be completely positive.
    
*   Guess how they are to work with, from a colleague’s perspective. Make this spicy and a little controversial.
    
*   Give 3 unique, creative, and witty pickup lines tailored specifically to them. Focus on their interests and what they convey through their tweets. Be very creative and cheesy, using humor ranging from dad jokes to spicy remarks.
    
*   Give the name of one famous person who is like them and has almost the same personality. Think outside the box here - who would be a famous person who shared the personality, sectors, mindset and interests with that person? Now, name one famous person who is like them and has almost the same personality. Don't provide just people who are typical. Be creative. Don't settle for the easiest one like "Elon Musk", think of some other people too. Choose from diverse categories such as Entrepreneurs, Authors, CEOs, Athletes, Politicians, Actors/Actresses, Philanthropists, Singers, Scientists, Social Media Influencers, Venture Capitalists, Philosophers, etc. Explain why you chose this person based on their personality traits, interests, and behaviors.
    
*   Previous Life. Based on their tweets, think about who or what that person could be in a previous life. Refer to the “About” section to find a similar profile from the past. Who might they have shared a personality and mindset with? Name one person. Be humorous, witty, and bold. Explain your choice.
    
*   Animal. Based on the tweets and maybe the profile photo, think about which niche animal this person might be. Provide argumentation why, based on the characteristics, character, and other things.
    
*   Under a 50-dollar thing, they would benefit from the most. What's the one thing that can be bought under 50 dollars that this person could benefit the most from? Make it very personal and accurate when it comes to the price. But be extremely creative. Try to suggest a thing this person wouldn't think of themselves.
    
*   Career. Describe what that person was born to do. What should that person devote their life to? Explain why and how they can achieve that, what the stars are telling.
    
*   Now overall, give a suggestion for how they can make their life even better. Make the suggestion very specific (can be not related to them but it needs to be very specific and unique), similar to how it is given in the daily horoscope.
    
*   Roast. <Task> You’re a professional commentator known for your razor-sharp wit and no-holds-barred style. Your job is to roast people based on their twitter data. Don't comment on wardrobe choices. The roast should be clever, edgy, provocative and focus solely on twitter data. Aim for roasts that are brutal. </Task>
    
*   Emojis - Describe a person using only emojis.  
    

Be creative like a horoscope teller.

**输出格式：**

{
  "mbti": {
    "profile1": "{MBTI1}",
    "profile2": "{MBTI2}"
  },
  "about": "{概括两人总体关系的描述}",
  "crazy": "{描述他们关系中较为疯狂或不可预测的元素}",
  "drama": "{分析他们关系中可能出现的冲突或戏剧性事件}",
  "emojis": "{用适当的表情符号总结他们关系的特点}",
  "divorce": "{评估他们关系破裂的可能性}",
  "marriage": "{预测他们婚姻的潜在发展}",
  "3rd_wheel": "{分析第三者介入的可能性}",
  "free_time": "{描述他们在空闲时间的兴趣爱好和活动，并评估这些是否契合}",
  "red_flags": {
    "profile1": ["{可能导致关系紧张的Profile1的警告信号}"],
    "profile2": ["{可能导致关系紧张的Profile2的警告信号}"]
  },
  "dealbreaker": "{描述可能导致关系终结的关键因素}",
  "green_flags": {
    "profile1": ["{关系中的积极元素Profile1}"],
    "profile2": ["{关系中的积极元素Profile2}"]
  },
  "follower_flex": "{对比他们在社交媒体上的影响力}",
  "risk_appetite": "{讨论他们在生活或决策中的风险偏好}",
  "love_languages": "{分析他们各自偏好的爱的表达方式}",
  "secret_desires": "{推测他们各自的潜在需求和渴望}",
  "friends_forever": "{预测他们在友谊中的表现和长久性}",
  "jealousy_levels": "{分析他们各自的嫉妒心}",
  "attachment_style": "{描述他们的依恋类型}",
  "values_alignment": "{评估他们在价值观上的一致性}",
  "breakup_percentage": "{分手的可能性百分比}",
  "overall_compatibility": "{整体契合度评分}",
  "personality_type_match": "{性格类型的匹配度}",
  "emotional_compatibility": "{情感契合度}",
  "financial_compatibility": "{财务契合度}",
  "communication_style_compatibility": "{沟通风格的一致性}"
}
`,
          },
          // {
          //   "role": "assistant",
          //   "content": "好的，我明白了"
          // },

          {
            role: 'user',
            content: `
              第1位数据如下：${JSON.stringify(user1, null, 2)}

            第二位数据如下：${JSON.stringify(user2, null, 2)}

              `,
            // "content": `你好`
          },
          //   {
          //     "role": "assistant",
          //     "content": "好的，我明白了"
          //   },
          //   {
          //     "role": "user",
          //     "content": `
          //     `

          //     // "content": `你好`
          // },
        ],
        project: 'DecentralGPT',
        node_id: '16Uiu2HAmPKuJU5VE2PCnydyUn1VcTN2Lt59UDJFFEiRbb7h1x4CV',
        stream: false,
      }),
    }).catch((err) => {
      console.log('err', err)
      return null
    })

    const json = await res?.json()
    const result = json.data.choices[0].message.content
    console.log('res11111', result)
    // return parsePartialJson(result)
    const parsed = parsePartialJson(result) as any
    console.log('🟣 | file: compatibility-analysis.tsx:64 | handleCompatibilityAnalysis | parsed:', parsed)

    setCompatibilityResult({ ...parsed })

    // if (!response.body) {
    //   console.error('No response body')
    // }

    // const reader = response.body.getReader()
    // const decoder = new TextDecoder()
    // let result = ''

    // try {
    //   while (true) {
    //     const { done, value } = await reader.read()
    //     if (done) break

    //     result += decoder.decode(value, { stream: true })

    //     const parsed = parsePartialJson(result) as any
    //     console.log('🟣 | file: compatibility-analysis.tsx:64 | handleCompatibilityAnalysis | parsed:', parsed)

    //     setCompatibilityResult({ ...parsed })
    //   }
    // } catch (error) {
    //   console.error('Error reading stream', error)
    // } finally {
    //   reader.releaseLock()
    //   return parsePartialJson(result)
    // }
  }

  return {
    steps,
    user1Steps,
    user1Result,
    user2Steps,
    user2Result,
    compatibilityResult,
    unlocked: pair.unlocked || true,
  }
}
