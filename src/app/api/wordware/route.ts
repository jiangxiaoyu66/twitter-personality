import { getUser, updateUser } from '@/actions/actions'
import { TweetType } from '@/actions/types'
import { TwitterAnalysis } from '@/components/analysis/analysis'

/**
 * Maximum duration for the API route execution (in seconds)
 */
export const maxDuration = 300

/**
 * POST handler for the DeGPT API route
 * @param {Request} request - The incoming request object
 * @returns {Promise<Response>} The response object
 */
export async function POST(request: Request) {
  // Extract username from the request body
  const { username, full } = await request.json()

  // Fetch user data and check if DeGPT has already been started
  const user = await getUser({ username })

  if (!user) {
    throw Error(`User not found: ${username}`)
  }

  if (!full) {
    if (user.wordwareCompleted || (user.wordwareStarted && Date.now() - user.createdAt.getTime() < 3 * 60 * 1000)) {
      return Response.json({ error: 'DeGPT already started' })
    }
  }

  if (full) {
    if (user.paidWordwareCompleted || (user.paidWordwareStarted && Date.now() - user.createdAt.getTime() < 3 * 60 * 1000)) {
      return Response.json({ error: 'DeGPT already started' })
    }
  }

  function formatTweet(tweet: TweetType) {
    // console.log('Formatting', tweet)
    const isRetweet = tweet.isRetweet ? 'RT ' : ''
    const author = tweet.author?.userName ?? username
    const createdAt = tweet.createdAt
    const text = tweet.text ?? '' // Ensure text is not undefined
    const formattedText = text
      .split('\n')
      .map((line) => `${line}`)
      .join(`\n> `)
    return `**${isRetweet}@${author} - ${createdAt}**

> ${formattedText}

*retweets: ${tweet.retweetCount ?? 0}, replies: ${tweet.replyCount ?? 0}, likes: ${tweet.likeCount ?? 0}, quotes: ${tweet.quoteCount ?? 0}, views: ${tweet.viewCount ?? 0}*`
  }

  const tweets = user.tweets as TweetType[]

  console.log("tweets", tweets);
  

  const tweetsMarkdown = tweets.map(formatTweet).join('\n---\n\n')

  console.log('tweetsMarkdown', tweetsMarkdown);

  // const promptID = full ? process.env.WORDWARE_FULL_PROMPT_ID : process.env.WORDWARE_ROAST_PROMPT_ID

  // // Make a request to the DeGPT API
  // const runResponse = await fetch(`https://app.wordware.ai/api/released-app/${promptID}/run`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${process.env.WORDWARE_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     inputs: {
  //       tweets: `Tweets: ${tweetsMarkdown}`,
  //       profilePicture: user.profilePicture,
  //       profileInfo: user.fullProfile,
  //       version: '^1.0',
  //     },
  //   }),
  // })


  const runResponse = await fetch(`https://chat.degpt.ai/api/v0/chat/completion`, {
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
           这里面说啥了？

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
      stream: true,
    }),
  }).catch((err) => {
    console.log('err', err)
    return null
  })

  console.log("runResponse", runResponse)


  // console.log('🟣 | file: route.ts:40 | POST | runResponse:', runResponse)
  // Get the reader from the response body
  const reader = runResponse.body?.getReader()
  if (!reader || !runResponse.ok) {
    // console.error('No reader')
    console.log('🟣 | ERROR | file: route.ts:40 | POST | runResponse:', runResponse)
    return Response.json({ error: 'No reader' }, { status: 400 })
  }

  // Update user to indicate DeGPT has started
  await updateUser({
    user: {
      ...user,
      wordwareStarted: true,
      wordwareStartedTime: new Date(),
    },
  })

  // Set up decoder and buffer for processing the stream
  const decoder = new TextDecoder()
  let buffer: string[] = []
  let finalOutput = false
  const existingAnalysis = user?.analysis as TwitterAnalysis

  // Create a readable stream to process the response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          console.log("value, done", done, value);
          

          if (done) {
            controller.close()
            return
          }

          const chunk = decoder.decode(value)
          // console.log('🟣 | file: route.ts:80 | start | chunk:', chunk)

          // Process the chunk character by character
          for (let i = 0, len = chunk.length; i < len; ++i) {
            const isChunkSeparator = chunk[i] === '\n'

            if (!isChunkSeparator) {
              buffer.push(chunk[i])
              continue
            }

            const line = buffer.join('').trimEnd()

            // Parse the JSON content of each line
            const content = JSON.parse(line)
            const value = content.value

            // Handle different types of messages in the stream
            if (value.type === 'generation') {
              if (value.state === 'start') {
                if (value.label === 'output') {
                  finalOutput = true
                }
                // console.log('\nNEW GENERATION -', value.label)
              } else {
                if (value.label === 'output') {
                  finalOutput = false
                }
                // console.log('\nEND GENERATION -', value.label)
              }
            } else if (value.type === 'chunk') {
              if (finalOutput) {
                controller.enqueue(value.value ?? '')
              }
            } else if (value.type === 'outputs') {
              console.log('✨ DeGPT:', value.values.output, '. Now parsing')
              try {
                const statusObject = full
                  ? {
                      paidWordwareStarted: true,
                      paidWordwareCompleted: true,
                    }
                  : { wordwareStarted: true, wordwareCompleted: true }
                // Update user with the analysis from DeGPT
                await updateUser({
                  user: {
                    ...user,
                    ...statusObject,
                    analysis: {
                      ...existingAnalysis,
                      ...value.values.output,
                    },
                  },
                })
                // console.log('Analysis saved to database')
              } catch (error) {
                console.error('Error parsing or saving output:', error)

                const statusObject = full
                  ? {
                      paidWordwareStarted: false,
                      paidWordwareCompleted: false,
                    }
                  : { wordwareStarted: false, wordwareCompleted: false }
                await updateUser({
                  user: {
                    ...user,
                    ...statusObject,
                  },
                })
              }
            }

            // Reset buffer for the next line
            buffer = []
          }
        }
      } finally {
        // Ensure the reader is released when done
        reader.releaseLock()
      }
    },
  })

  // Return the stream as the response
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
