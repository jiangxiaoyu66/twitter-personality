import { useEffect, useRef, useState } from 'react'
import { updatePair } from '@/actions/actions'

import { CompatibilityAnalysis } from '@/components/analysis/compatibility'
import { SelectPair, SelectUser } from '@/drizzle/schema'
import { Steps, useTwitterAnalysis } from '@/hooks/twitter-analysis'
import { parsePartialJson } from '@/lib/parse-partial-json'
import { ParePrompt } from '@/lib/config'

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

    // const res = await fetch(`https://chat.degpt.ai/api/v0/chat/completion`, {
    //   method: 'POST',
    //   headers: {
    //     // Authorization: `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: 'Qwen2-72B',
    //     messages: [
    //       {
    //         role: 'system',
    //         content: ParePrompt,
    //       },
    //       // {
    //       //   "role": "assistant",
    //       //   "content": "好的，我明白了"
    //       // },

    //       {
    //         role: 'user',
    //         content: `
    //           第1位数据如下：${JSON.stringify(user1, null, 2)}

    //         第二位数据如下：${JSON.stringify(user2, null, 2)}

    //           `,
    //         // "content": `你好`
    //       },
    //       //   {
    //       //     "role": "assistant",
    //       //     "content": "好的，我明白了"
    //       //   },
    //       //   {
    //       //     "role": "user",
    //       //     "content": `
    //       //     `

    //       //     // "content": `你好`
    //       // },
    //     ],
    //     project: 'DecentralGPT',
    //     node_id: '16Uiu2HAmPKuJU5VE2PCnydyUn1VcTN2Lt59UDJFFEiRbb7h1x4CV',
    //     stream: false,
    //   }),
    // }).catch((err) => {
    //   console.log('err', err)
    //   return null
    // })

    // const json = await res?.json()
    // const result = json.data.choices[0].message.content
    // console.log('res11111', result)
    // // return parsePartialJson(result)


    const models = [

      {
        name: "Meta LLM (Llama-3.1-405B)",
        model: "Llama-3.1-405B",
        nodeList: ["16Uiu2HAmBcP2Zv51z4VA8UnHRNRjatyHcv4TSuU6pXixLELP1U7F"],
      },
      {
        name: "Ali LLM (Qwen2-72B)",
        model: "Qwen2-72B",
        nodeList: ["16Uiu2HAmPKuJU5VE2PCnydyUn1VcTN2Lt59UDJFFEiRbb7h1x4CV"],
      },
      {
        name: "Google LLM (Gemma-2-27B)",
        model: "Gemma-2-27B",
        nodeList: ["16Uiu2HAmPKuJU5VE2PCnydyUn1VcTN2Lt59UDJFFEiRbb7h1x4CV"],
      },
    ];
    
    async function tryModels(models: any, ParePrompt: any, user1: any, user2: any) {
      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        try {
          const res = await fetch(`https://chat.degpt.ai/api/v0/chat/completion`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model.model,
              messages: [
                {
                  role: 'system',
                  content: ParePrompt,
                },
                {
                  role: 'user',
                  content: `
                 第1位数据如下：${JSON.stringify(user1, null, 2)}

   第二位数据如下：${JSON.stringify(user2, null, 2)}

                  `,
                },
              ],
              project: 'DecentralGPT',
              node_id: model.nodeList[0],
              stream: false,
            }),
          });
          
          if (res.ok) {
            const datares = await res.json();
            if( datares.data.choices[0].message.content ) {
              return datares.data.choices[0].message.content; // 成功返回数据
            }
            else {

            }
          } else {
            console.log(`Model ${model.name} failed with status ${res.status}`);
          }
        } catch (err) {
          console.log(`Model ${model.name} encountered an error:`, err);
        }
      }
      
      return null; // 如果所有模型都失败，则返回null
    }
    
    // 使用方法
    const result = await tryModels(models, ParePrompt, user1, user2);
    
    if (result) {
      console.log('成功获取结果:', result);
    } else {
      console.log('所有模型都失败了');
      return 
    }
    


    const parsed = parsePartialJson(result) as any

    await updatePair({
      pair: {
        ...pair,
        wordwareStarted: true,
        wordwareCompleted: true,
        analysis: parsed,
      },
    })


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
