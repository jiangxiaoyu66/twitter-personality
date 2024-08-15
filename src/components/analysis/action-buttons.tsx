import { PiXLogo } from 'react-icons/pi'

import WordwareLogo from '@/components/logo'
import { Button } from '@/components/ui/button'

type ActionButtonsProps = {
  shareActive: boolean
  text?: string
  url?: string
  tags?: string
}

const ActionButtons = ({ shareActive, text, url, tags,  }: ActionButtonsProps) => {
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


      {/* {
        !compatibilityResult && (
          <Button
          size={'sm'}
          variant={'default'}
          className='mb-[-24px] cursor-pointer'
          asChild>
          <a
            href={process.env.NEXT_PUBLIC_SHARED_APP_URL}
            target="_blank"
            className="flex-center gap-2">

<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M7.32.029a8 8 0 0 1 7.18 3.307V1.75a.75.75 0 0 1 1.5 0V6h-4.25a.75.75 0 0 1 0-1.5h1.727A6.5 6.5 0 0 0 1.694 6.424A.75.75 0 1 1 .239 6.06A8 8 0 0 1 7.319.03Zm-3.4 14.852A8 8 0 0 0 15.76 9.94a.75.75 0 0 0-1.455-.364A6.5 6.5 0 0 1 2.523 11.5H4.25a.75.75 0 0 0 0-1.5H0v4.25a.75.75 0 0 0 1.5 0v-1.586a8 8 0 0 0 2.42 2.217" clip-rule="evenodd"/></svg>
           
            Re-Check Compatibilit
          </a>
        </Button> 
        )
      } */}
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
