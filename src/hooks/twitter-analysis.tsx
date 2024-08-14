import { useEffect, useRef, useState } from 'react'
import { updateUser } from '@/actions/actions'

import { processScrapedUser } from '@/actions/actions'
import { TwitterAnalysis } from '@/components/analysis/analysis'
import { SelectUser } from '@/drizzle/schema'
import { PAYWALL , SinglePersonPrompt} from '@/lib/config'
// import { parsePartialJson } from '@/lib/parse-partial-json'
import { toast } from 'sonner'

export type Steps = {
  profileScraped: boolean
  tweetScrapeStarted: boolean
  tweetScrapeCompleted: boolean
  wordwareStarted: boolean
  wordwareCompleted: boolean
  paidWordwareStarted: boolean
  paidWordwareCompleted: boolean
}

/**
 * Custom hook for analyzing Twitter user data.
 *
 * @param {SelectUser} user - The user object containing Twitter profile information.
 * @param {boolean} [disableAnalysis=false] - Flag to disable the analysis process.
 * @returns {Object} An object containing the analysis steps and results.
 */

export const useTwitterAnalysis = (user: SelectUser, disableAnalysis: boolean = false, forceScrape: boolean = false) => {
  const [steps, setSteps] = useState<Steps>(initializeSteps(user))
  const [result, setResult] = useState<TwitterAnalysis | undefined>((user.analysis as TwitterAnalysis) || undefined)
  const effectRan = useRef(false)

  useEffect(() => {
    if (effectRan.current) return
    effectRan.current = true

    const runAnalysis = async () => {
      let tweetScrapeCompleted = user.tweetScrapeCompleted
      if (shouldRunTweetScrape(user)) {
        tweetScrapeCompleted = await runTweetScrape(user, setSteps)
      }
      let currentResult: TwitterAnalysis | undefined = undefined

      if (disableAnalysis) return
      if (shouldRunWordwareAnalysis(user, tweetScrapeCompleted || false)) {
        currentResult = (await runWordwareAnalysis(user, setSteps)) as TwitterAnalysis

        console.log("currentResult", currentResult);
        setResult(currentResult)
        
      }

      // if (shouldRunPaidWordwareAnalysis(user, result)) {
      //   await runPaidWordwareAnalysis(user, setSteps, currentResult)
      // }
    }

    runAnalysis()
  }, [])

  function initializeSteps(user: SelectUser): Steps {
    return {
      profileScraped: user.profileScraped || false,
      tweetScrapeStarted: user.tweetScrapeStarted || false,
      tweetScrapeCompleted: user.tweetScrapeCompleted || false,
      wordwareStarted: user.wordwareStarted || false,
      wordwareCompleted: user.wordwareCompleted || false,
      paidWordwareStarted: user.paidWordwareStarted || false,
      paidWordwareCompleted: user.paidWordwareCompleted || false,
    }
  }

  // const handleTweetAnalysis = async (props: { username: string; full: boolean; currentAnalysis?: TwitterAnalysis | undefined }) => {
  //   const response = await fetch('/api/wordware', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(props),
  //   })

  //   if (!response.body) {
  //     console.error('No response body')
  //     return
  //   }

  //   const reader = response.body.getReader()
  //   const decoder = new TextDecoder()
  //   let result = ''

  //   try {
  //     while (true) {
  //       const { done, value } = await reader.read()
  //       if (done) break

  //       result += decoder.decode(value, { stream: true })

  //       const parsed = parsePartialJson(result) as TwitterAnalysis

  //       const existingAnalysis = {
  //         ...(user.analysis as TwitterAnalysis),
  //         ...props.currentAnalysis,
  //       }

  //       setResult({ ...existingAnalysis, ...parsed })
  //     }
  //   } catch (error) {
  //     console.error('Error reading stream', error)
  //   } finally {
  //     reader.releaseLock()
  //     return parsePartialJson(result)
  //   }
  // }

  const shouldRunTweetScrape = (user: SelectUser): boolean => {
    // const isUnlocked = PAYWALL ? user.unlocked || false : true
    const isUnlocked = true
    return (
      (forceScrape || isUnlocked) &&
      (!user.tweetScrapeStarted || (!user.tweetScrapeCompleted && Date.now() - user.tweetScrapeStartedTime.getTime() > 1 * 60 * 1000))
    )
  }

  const shouldRunWordwareAnalysis = (user: SelectUser, tweetScrapeCompleted: boolean): boolean => {
    const unlockedCheck = PAYWALL ? user.unlocked || false : true
    return (
      (unlockedCheck && tweetScrapeCompleted && !user.wordwareStarted) ||
      (unlockedCheck && tweetScrapeCompleted && !user.wordwareCompleted && Date.now() - user.wordwareStartedTime.getTime() > 60 * 1000)
    )
  }

  // const shouldRunPaidWordwareAnalysis = (user: SelectUser, result: TwitterAnalysis | undefined): boolean => {
  //   return (
  //     (!user.paidWordwareCompleted &&
  //       (!result || !result.loveLife) &&
  //       ((user.unlocked && !user.paidWordwareStarted) ||
  //         (user.unlocked && !user.paidWordwareCompleted && Date.now() - user.paidWordwareStartedTime.getTime() > 60 * 1000))) ||
  //     false
  //   )
  // }

  const runTweetScrape = async (user: SelectUser, setSteps: React.Dispatch<React.SetStateAction<Steps>>): Promise<boolean> => {
    setSteps((prev) => ({ ...prev, tweetScrapeStarted: true }))
    try {
      await processScrapedUser({ username: user.username })
      setSteps((prev) => ({ ...prev, tweetScrapeCompleted: true }))
      return true
    } catch (error) {
      console.error('Error processing scraped user:', error)
      if (error) {
        toast.error('Error processing scraped user:', error)
      }
      // window.location.href = 'https://tally.so/r/3lRoOp'
      return false
    }
  }

  const runWordwareAnalysis = async (user: SelectUser, setSteps: React.Dispatch<React.SetStateAction<Steps>>) => {
    setSteps((prev) => ({ ...prev, wordwareStarted: true }))


    // const result = await handleTweetAnalysis({ username: user.username, full: false })

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
    //         content: SinglePersonPrompt,
    //       },
    //       {
    //         role: 'user',
    //         content: `
    //           数据如下：${JSON.stringify(user, null, 2)}
    //           `,
    //       },
     
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
    // const resultString = json.data.choices[0].message.content

    // const result = JSON.parse(resultString)
    // console.log('res11111', result)
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
    
    async function tryModels(models: any, SinglePersonPrompt: any, user: any) {
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
                  content: SinglePersonPrompt,
                },
                {
                  role: 'user',
                  content: `
                    数据如下：${JSON.stringify(user, null, 2)}
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
              return JSON.parse(datares.data.choices[0].message.content); // 成功返回数据
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
    const result = await tryModels(models, SinglePersonPrompt, user);
    
    if (result) {
      console.log('成功获取结果:', result);
    } else {
      console.log('所有模型都失败了');
    }
    




    // const result = {
    //   "name": "Raullen",
    //   "twitter_username": "raullen",
    //   "about": "Based on our AI agent's analysis of your tweets, Raullen is a male tech entrepreneur in his late 30s to early 40s. As the co-founder of IoTeX, a blockchain and IoT-focused company, Raullen has a deep interest in decentralized physical infrastructure (DEPIN). He has a Stoic philosophy and a PhD from the University of Waterloo. Before his current venture, he worked at tech giants Google and Uber. His profile picture suggests a professional, tech-savvy individual.",
    //   "strengths": [
    //     "Innovative thinker with a visionary mindset for DEPIN",
    //     "Strong leadership skills demonstrated by co-founding IoTeX",
    //     "Extensive knowledge and experience in tech, specifically IoT and blockchain",
    //     "PhD-level education, indicating high intelligence and analytical skills",
    //     "Proven track record of success in previous roles at Google and Uber"
    //   ],
    //   "weaknesses": [
    //     "Potential over-reliance on technology as a solution to all problems",
    //     "May struggle with balancing work and personal life due to intense focus on DEPIN",
    //     "Could be perceived as too forward-thinking, alienating those who are less tech-savvy",
    //     "Risk of burnout due to the intensity of his work in the tech industry",
    //     "Might have difficulty delegating tasks, wanting to control all aspects of projects"
    //   ],
    //   "love_life": "In terms of love, Raullen’s innovative spirit and analytical mind will thrive with a partner who shares a passion for technology and the future. He should seek someone who can keep up with his fast-paced lifestyle and is equally driven. A partner with a Stoic mindset, who understands his dedication to work, and can provide a grounding influence will ensure a harmonious relationship. It’s important for Raullen to find a balance between his professional ambitions and personal connections, ensuring he makes time for the growth and nurturing of his romantic relationship.",
    //   "multi_millionaire_percentage": "87%",
    //   "health": "Looking at the stars, Raullen’s health is forecast to be robust and energetic, well-suited to the demands of his active lifestyle. His resilience, both mental and physical, is likely to keep him in good health. However, he should remain vigilant about the potential for stress-related issues due to his intense work habits. Regular exercise, a balanced diet, and mindfulness practices like Stoicism will serve him well in maintaining his health over the long term.",
    //   "biggest_goal": "Raullen’s biggest goal in life is to pioneer the future of decentralized physical infrastructure (DEPIN), revolutionizing how the world operates. His vision is to create a global movement that integrates real-world devices with blockchain technology, fundamentally changing industries and improving people's lives.",
    //   "colleague_perspective": "Working with Raullen, a colleague might find him to be an inspiring leader with a brilliant mind, deeply committed to his work. However, his intensity can sometimes mean he expects high standards from those around him, which can lead to pressure. He values efficiency and innovation, but his forward-thinking approach might sometimes clash with more traditional methods, making him a challenging but rewarding colleague to work alongside.",
    //   "pickup_lines": [
    //     "Are you an IoT device? Because you've just connected to my heart.",
    //     "Is your name IoTeX? Because you're the network I want to be on.",
    //     "Do you believe in DEPIN, or should I just decentralize your heart now?"
    //   ],
    //   "famous_personality": {
    //     "name": "Elon Musk",
    //     "reason": "Raullen shares a similar entrepreneurial spirit and a visionary mindset with Elon Musk, particularly in his dedication to pushing boundaries and shaping the future through technology. Both are deeply involved in cutting-edge sectors and have a strong background in tech companies, with a focus on innovation and disruption."
    //   },
    //   "previous_life": {
    //     "name": "Leonardo da Vinci",
    //     "reason": "In a previous life, Raullen might have been a Renaissance man like Leonardo da Vinci, known for his innovation, curiosity, and multidisciplinary pursuits. Da Vinci’s forward-thinking and wide-ranging interests mirror Raullen’s focus on tech and his aim to revolutionize the industry, making them kindred spirits across time."
    //   },
    //   "animal": {
    //     "name": "Phoenix",
    //     "reason": "Just as the mythical Phoenix rises from its ashes, Raullen’s career continuously evolves and transforms, symbolizing his resilience and ability to overcome challenges. His spirit is reborn with each new project, much like the Phoenix, making him a visionary leader in the tech industry."
    //   },
    //   "under_50_dollar_thing": {
    //     "name": "A high-quality ergonomic mouse",
    //     "reason": "Given his intense work in the tech industry, a high-quality ergonomic mouse can prevent strain and injury from long hours at the computer. This small investment under $50 will enhance his productivity and comfort, allowing him to focus on his ambitious projects without physical discomfort."
    //   },
    //   "career": {
    //     "path": "Raullen was born to lead the technological revolution, specifically in the realm of decentralized physical infrastructure (DEPIN). His stars indicate a path paved with innovation and leadership in this field. To achieve his full potential, he should continue to invest in his skills, surround himself with a talented team, and remain adaptable to market changes. The stars suggest that by focusing on collaboration and maintaining a Stoic mindset, he can overcome any obstacles and realize his vision for a DEPIN-powered world."
    //   },
    //   "life_improvement_suggestion": "To make his life even better, Raullen should prioritize work-life balance. Incorporating regular breaks, quality time with loved ones, and leisure activities will ensure that his personal life thrives alongside his professional success. This alignment will not only enhance his well-being but also improve his productivity and creativity in his work.",
    //   "roast": "Raullen, you’re so tech-savvy that you probably have a blockchain for your breakfast. Your tweets are so innovative, they’re giving the future a run for its money. But, don’t forget, even a Phoenix needs to rest from time to time!",
    //   "emojis": "🚀👨‍💻🌐⚡⚡"
    // }

    if(result) {
      const statusObject = false
      ? {
          paidWordwareStarted: true,
          paidWordwareCompleted: true,
        }
      : { wordwareStarted: true, wordwareCompleted: true }
      await updateUser({
        user: {
          ...user,
          ...statusObject,
          analysis: result,
        },
      })
    }

  // Update user with the analysis from DeGPT
  

    setSteps((prev) => ({ ...prev, wordwareCompleted: true }))
    
    return result as TwitterAnalysis
  }

  // const runPaidWordwareAnalysis = async (user: SelectUser, setSteps: React.Dispatch<React.SetStateAction<Steps>>, result: TwitterAnalysis | undefined) => {
  //   setSteps((prev) => ({ ...prev, paidWordwareStarted: true }))
  //   await handleTweetAnalysis({ username: user.username, full: true, currentAnalysis: result })
  //   setSteps((prev) => ({ ...prev, paidWordwareCompleted: true }))
  // }

  return { steps, result }
}
