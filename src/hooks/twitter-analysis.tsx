import { useEffect, useRef, useState } from 'react'

import { processScrapedUser } from '@/actions/actions'
import { TwitterAnalysis } from '@/components/analysis/analysis'
import { SelectUser } from '@/drizzle/schema'
import { PAYWALL } from '@/lib/config'
import { parsePartialJson } from '@/lib/parse-partial-json'
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

  const handleTweetAnalysis = async (props: { username: string; full: boolean; currentAnalysis?: TwitterAnalysis | undefined }) => {
    const response = await fetch('/api/wordware', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(props),
    })

    if (!response.body) {
      console.error('No response body')
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let result = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        result += decoder.decode(value, { stream: true })

        const parsed = parsePartialJson(result) as TwitterAnalysis

        const existingAnalysis = {
          ...(user.analysis as TwitterAnalysis),
          ...props.currentAnalysis,
        }

        setResult({ ...existingAnalysis, ...parsed })
      }
    } catch (error) {
      console.error('Error reading stream', error)
    } finally {
      reader.releaseLock()
      return parsePartialJson(result)
    }
  }

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

  const shouldRunPaidWordwareAnalysis = (user: SelectUser, result: TwitterAnalysis | undefined): boolean => {
    return (
      (!user.paidWordwareCompleted &&
        (!result || !result.loveLife) &&
        ((user.unlocked && !user.paidWordwareStarted) ||
          (user.unlocked && !user.paidWordwareCompleted && Date.now() - user.paidWordwareStartedTime.getTime() > 60 * 1000))) ||
      false
    )
  }

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
            content: `# **Instructions**

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

输出的对象中的value，看我待会儿给你的内容原本主要是什么语言，你就返回什么语言

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
              数据如下：${JSON.stringify(user, null, 2)}
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
    const resultString = json.data.choices[0].message.content
    const result = JSON.parse(resultString)
    console.log('res11111', result)


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

    setSteps((prev) => ({ ...prev, wordwareCompleted: true }))
    
    return result as TwitterAnalysis
  }

  const runPaidWordwareAnalysis = async (user: SelectUser, setSteps: React.Dispatch<React.SetStateAction<Steps>>, result: TwitterAnalysis | undefined) => {
    setSteps((prev) => ({ ...prev, paidWordwareStarted: true }))
    await handleTweetAnalysis({ username: user.username, full: true, currentAnalysis: result })
    setSteps((prev) => ({ ...prev, paidWordwareCompleted: true }))
  }

  return { steps, result }
}
