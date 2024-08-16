'use client'

// import { useSearchParams } from 'next/navigation'
// import posthog from 'posthog-js'

import { SelectPair, SelectUser } from '@/drizzle/schema'
import { useCompatibilityAnalysis } from '@/hooks/compatibility-analysis'

import ActionButtons from './action-buttons'
import Compatibility from './compatibility'
// import { CompatibilityPriceButton } from './compatibility-paywall-card'
import { ProgressIndicator, StepIndicator } from './progress-indicator'

const PairComponent = ({ users, pair }: { users: SelectUser[]; pair: SelectPair }) => {
  console.log("users, pair", users, pair);
  console.log("tweets", users[0].tweets);
  
  const [user1, user2] = users.sort()
  // const searchParams = useSearchParams()
  const { steps, user1Steps, user1Result, user2Steps, user2Result, compatibilityResult, unlocked } = useCompatibilityAnalysis(user1, user2, pair)
  // const paywallFlag = posthog.getFeatureFlag('paywall2') ?? searchParams.get('stripe')


  console.log("compatibilityResult", compatibilityResult);
  
  return (
    <div className="flex-center w-full flex-col gap-8">
      <div className="flex w-full max-w-lg flex-col items-center justify-center gap-2 md:flex-row md:gap-8">
        <div className="w-1/2">
          <ProgressIndicator
            steps={user1Steps}
            result={user1Result}
            disableAnalysis={true}
            userUnlocked={pair.unlocked || false}
          />
        </div>
        <div className="w-1/2">
          <ProgressIndicator
            steps={user2Steps}
            result={user2Result}
            disableAnalysis={true}
            userUnlocked={pair.unlocked || false}
          />
        </div>
      </div>
      {!steps.compatibilityAnalysisCompleted && (
        <StepIndicator
          started={steps.compatibilityAnalysisStarted}
          completed={steps.compatibilityAnalysisCompleted}
          premium={!unlocked}
          text="Compatibility Analysis(About 1-5 minutes)"
        />
      )}
      {/* {!unlocked && <CompatibilityPriceButton price={paywallFlag as string} />} */}
      <ActionButtons
        shareActive={!!compatibilityResult?.about}
        text={`this is my and ${user2.username}'s Compatibility analysis by AI Agent, built on @DecentralGPT`}
        url={`https://x.degpt.ai/${user1.username}/${user2.username}`}
      />


      <Compatibility
        names={[user1.name || user1.username, user2.name || user2.username]}
        pairAnalysis={compatibilityResult}
        // pairAnalysis={{
        //   "mbti": {
        //     "profile1": "INTJ",
        //     "profile2": "ENFP"
        //   },
        //   "about": "两个人性格截然不同，却能互相吸引。INTJ理智而冷静，ENFP热情而有趣。",
        //   "crazy": "ENFP的疯狂想法和INTJ的严谨规划产生了有趣的化学反应。",
        //   "drama": "虽然偶尔会有小摩擦，但整体关系稳定。",
        //   "emojis": "🤔💡🧠✨",
        //   "divorce": "两人都认为婚姻需要谨慎对待，因此离婚的可能性较低。",
        //   "marriage": "如果彼此相互理解，他们的婚姻会很稳固。",
        //   "3rd_wheel": "他们的关系紧密，很少有第三者插足的机会。",
        //   "free_time": "INTJ喜欢独处思考，ENFP则喜欢与朋友社交。彼此的爱好和习惯有时会冲突。",
        //   "red_flags": {
        //     "profile1": ["过度理性", "情感表达不够"],
        //     "profile2": ["过度情绪化", "容易分心"]
        //   },
        //   "dealbreaker": "如果ENFP觉得INTJ太冷漠，或者INTJ觉得ENFP太不稳定，可能会导致分手。",
        //   "green_flags": {
        //     "profile1": ["忠诚", "有规划"],
        //     "profile2": ["善于沟通", "富有创意"]
        //   },
        //   "follower_flex": "ENFP在社交平台上更活跃，粉丝更多。",
        //   "risk_appetite": "ENFP更愿意冒险，而INTJ更喜欢稳健的选择。",
        //   "love_languages": "ENFP倾向于言语肯定，INTJ则更倾向于行动支持。",
        //   "secret_desires": "ENFP渴望被理解和认可，INTJ渴望在事业上取得成功。",
        //   "friends_forever": "如果双方能够理解对方的需求，友谊会长久维持。",
        //   "jealousy_levels": "ENFP可能会因为不安全感而产生嫉妒，INTJ则很少表现出嫉妒。",
        //   "attachment_style": "ENFP偏向焦虑型依恋，INTJ偏向回避型依恋。",
        //   "values_alignment": "他们在价值观上的契合度中等，需要相互妥协。",
        //   "breakup_percentage": "40%",
        //   "overall_compatibility": "60%",
        //   "personality_type_match": "70%",
        //   "emotional_compatibility": "50%",
        //   "financial_compatibility": "70%",
        //   "communication_style_compatibility": "65%"
        // }
        // }
        unlocked={unlocked}
      />
      {/* <pre className="max-w-lg whitespace-pre-wrap">{JSON.stringify(compatibilityResult, null, 2)}</pre> */}
    </div>
  )
}

export default PairComponent
