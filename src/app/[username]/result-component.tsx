'use client'

import { useEffect, useRef, useState } from 'react'

import { processScrapedUser } from '@/actions/actions'
import NewPairForm from '@/components/new-pair-form'
import { SelectUser } from '@/drizzle/schema'
import { analysisPlaceholder } from '@/lib/constants'
import { parsePartialJson } from '@/lib/parse-partial-json'

import ActionButtons from './action-buttons'
import { Analysis, TwitterAnalysis } from './analysis'
import { ProgressIndicator, StepIndicator } from './progress-indicator'

export type Steps = {
  profileScraped: boolean
  tweetScrapeStarted: boolean
  tweetScrapeCompleted: boolean
  wordwareStarted: boolean
  wordwareCompleted: boolean
  paidWordwareStarted: boolean
  paidWordwareCompleted: boolean
}

const ResultComponent = ({ user }: { user: SelectUser }) => {
  // State to track the progress of analysis steps
  const [steps, setSteps] = useState<Steps>({
    profileScraped: user.profileScraped || false,
    tweetScrapeStarted: user.tweetScrapeStarted || false,
    tweetScrapeCompleted: user.tweetScrapeCompleted || false,
    wordwareStarted: user.wordwareStarted || false,
    wordwareCompleted: user.wordwareCompleted || false,
    paidWordwareStarted: user.paidWordwareStarted || false,
    paidWordwareCompleted: user.paidWordwareCompleted || false,
  })

  // State to store the result of Twitter analysis
  const [result, setResult] = useState<TwitterAnalysis | undefined>((user.analysis as TwitterAnalysis) || undefined)
  const effectRan = useRef(false)

  useEffect(() => {
    // Prevent the effect from running more than once
    if (effectRan.current) return
    let tweetScrapeCompleted = user.tweetScrapeCompleted
    effectRan.current = true
    ;(async () => {
      // Check if tweet scraping needs to be started or restarted
      if (!user.tweetScrapeStarted || (!user.tweetScrapeCompleted && Date.now() - user.tweetScrapeStartedTime.getTime() > 1 * 60 * 1000)) {
        // Update state to indicate tweet scraping has started
        setSteps((prev) => ({
          ...prev,
          tweetScrapeStarted: true,
        }))
        try {
          // Process the scraped user data
          await processScrapedUser({ username: user.username })
        } catch (error) {
          console.log('🟣 | file: result-component.tsx:59 | ; | error:', error)
          // Redirect to error form if processing fails
          window.location.href = 'https://tally.so/r/3lRoOp'
        }
        // Update state to indicate tweet scraping is completed
        setSteps((prev) => ({
          ...prev,
          tweetScrapeCompleted: true,
        }))
        tweetScrapeCompleted = true
      }

      // Check if Wordware analysis needs to be started or restarted
      if (
        (tweetScrapeCompleted && !user.wordwareStarted) ||
        (tweetScrapeCompleted && !user.wordwareCompleted && Date.now() - user.wordwareStartedTime.getTime() > 60 * 1000)
      ) {
        // Update state to indicate Wordware analysis has started
        setSteps((prev) => ({
          ...prev,
          wordwareStarted: true,
        }))

        // Perform tweet analysis
        await handleTweetAnalysis({
          username: user.username,
          full: false,
        })

        // Update state to indicate Wordware analysis is completed
        setSteps((prev) => ({
          ...prev,
          wordwareCompleted: true,
        }))
      }

      if (
        !user.paidWordwareCompleted &&
        (!result || !result.loveLife) && //checking if love-life exist to prevent re-generation of the previous result
        ((user.unlocked && !user.paidWordwareStarted) ||
          (user.unlocked && !user.paidWordwareCompleted && Date.now() - user.paidWordwareStartedTime.getTime() > 60 * 1000))
      ) {
        console.log('PAID SHOULD BE STARTED, STARTING')
        // Update state to indicate Wordware analysis has started
        setSteps((prev) => ({
          ...prev,
          paidWordwareStarted: true,
        }))

        // Perform tweet analysis
        await handleTweetAnalysis({
          username: user.username,
          full: true,
        })

        // Update state to indicate Wordware analysis is completed
        setSteps((prev) => ({
          ...prev,
          paidWordwareCompleted: true,
        }))
      }
    })()
  }, []) // Effect depends on user data

  const handleTweetAnalysis = async (props: { username: string; full: boolean }) => {
    const response = await fetch('/api/wordware', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
        const existingAnalysis = user.analysis as TwitterAnalysis

        setResult({ ...existingAnalysis, ...parsed })
      }
    } catch (error) {
      console.error('Error reading stream', error)
    } finally {
      reader.releaseLock()
      return parsePartialJson(result)
    }
  }

  // Function to prepare userData for Result component
  const prepareUserData = (result: TwitterAnalysis | undefined, unlocked: boolean): TwitterAnalysis | undefined => {
    if (!result) return undefined
    if (!result.roast) return result

    if (unlocked) return result

    // Merge placeholders with the result if not unlocked
    return {
      ...result,
      ...analysisPlaceholder,
      strengths: analysisPlaceholder.strengths,
      weaknesses: analysisPlaceholder.weaknesses,
      pickupLines: analysisPlaceholder.pickupLines,
    }
  }

  return (
    <div className="flex-center flex-col gap-8">
      <ProgressIndicator
        steps={steps}
        result={result}
        userUnlocked={user.unlocked || false}
      />

      <ActionButtons
        result={result}
        username={user.username}
      />

      <div className="flex-center w-full flex-col gap-4">
        <div className="text-center text-lg font-light">Add new user to find if you are compatible souls</div>
        <NewPairForm />
      </div>

      <Analysis
        unlocked={user.unlocked || false}
        // userData={result}
        userData={prepareUserData(result, user.unlocked || false)}
      />
      {!result?.loveLife && user.unlocked && (
        <StepIndicator
          started={steps.paidWordwareStarted}
          completed={steps.paidWordwareCompleted}
          text="Extending your Personality"
        />
      )}
    </div>
  )
}

export default ResultComponent
