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

  const handleCompatibilityAnalysis = async (props: { usernames: string[]; full: boolean; user1; user2 }) => {
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
            content: `请根据以下两个用户的基本信息和他们的10条推文，生成一份详细的关系分析报告。报告应严格按照以下格式输出，并包括指定的内容。不需要其他描述信息，直接返回json数据就好！返回数据统一用英文

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
