import { PiXLogo } from 'react-icons/pi'

import WordwareLogo from '@/components/logo'
import { Button } from '@/components/ui/button'

type ActionButtonsProps = {
  shareActive: boolean
  text?: string
  url?: string
  tags?: string
}

const ActionButtons = ({ shareActive, text, url, tags }: ActionButtonsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex-center flex-wrap gap-4">
        {/* <PHButton text="Support us!" /> */}
        {shareActive && (
          <Button
            size={'sm'}
            asChild>
            <a
              target="_blank"
              className="flex-center gap-2"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text ?? `this is my Twitter Personality analysis by AI Agent, built on @DecentralGPT `)}${tags ? '&hashtags=' + tags : ''}&url=${encodeURIComponent(url ?? `https://x.degpt.ai/`)}`}>
              <PiXLogo /> Share
            </a>
          </Button>
        )}
        <Button
          size={'sm'}
          asChild>
          <a
            className="flex-center gap-2"
            target="_blank"
            href="https://degpt.ai/">
            <WordwareLogo
              emblemOnly
              color="white"
              width={20}
            />
            DeGPT
          </a>
        </Button>
      </div>
      <h2 className="flex items-center justify-start">
        <span className="mr-4">Powered by</span>
        <a
          href="https://www.decentralgpt.org"
          target="_blank">
          <WordwareLogo
            color="black"
            width={20}
            emblemOnly={false}
          />
        </a>
      </h2>
      <h2 className="flex items-center justify-start gap-2">
        GPU Support From 
        <a className='flex items-center'  href="https://www.deepbrainchain.org/"
          target="_blank">
          <img src='/deepchain.png' alt="" className='w-[22px]' />
          <span className=' ml-[6px] text-gray-850 self-center text-sm font-medium dark:text-white'>DeepBrainChain</span>
        </a>   
      </h2>
    </div>
  )
}

export default ActionButtons
