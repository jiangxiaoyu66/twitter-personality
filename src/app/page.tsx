import { Suspense } from 'react'
import { PiXLogo } from 'react-icons/pi'

import Quote from '@/app/quote'
import WordwareLogo from '@/components/logo'
import NewPairFormBothNames from '@/components/new-pair-form-both-names'
import NewUsernameForm from '@/components/new-username-form'
import TopList from './top-list'

export const maxDuration = 181

const Page = () => {
  return (
    <section>
      <div className="flex flex-col md:flex-row">
        <div className="relative flex min-h-screen flex-col justify-center bg-[#F9FAFB] p-8 sm:p-12 md:w-1/2 md:p-16 lg:p-24">
          <h2 className="flex items-center justify-start ">
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
          <h2 className="flex items-center justify-start gap-4 pb-8">
            GPU Support From 

            <a className='flex items-center'  href="https://www.deepbrainchain.org/"
              target="_blank">
            <img src='/deepchain.png' alt="" className='w-[22px]' />
            <span className=' ml-[6px] text-gray-850 self-center text-sm font-medium dark:text-white'>DeepBrainChain</span>

            </a>
            
   
          </h2>
          <div className="grow" />

          <div>
            <div>
              <h1 className="mb-8 text-4xl md:text-5xl 2xl:text-6xl">
                discover your <br />
                <span
                  className="bg-clip-text text-transparent"
                  // background-clip: text;
                  // -webkit-background-clip: text;
              
                  style={{ backgroundColor: '#CB9F9F', backgroundClip: 'text',WebkitBackgroundClip : 'text'  }}>
                  {' '}
                  twitter{' '}
                </span>
                personality 🔥
              </h1>

              <div className="mb-8 flex w-full flex-col pt-2">
                <div className="flex w-full items-center">
                  <Suspense>
                    <NewUsernameForm />
                  </Suspense>
                </div>
              </div>
            </div>
            <div className="pt-8">
              <h1 className="mb-8 text-4xl md:text-5xl 2xl:text-6xl">
                check your{' '}
                <span className="inline-flex items-center align-middle">
                  <PiXLogo />
                  <PiXLogo />
                  <PiXLogo />
                </span>
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundColor: '#6DB1BF', backgroundClip: 'text',WebkitBackgroundClip : 'text'  }}>
                  {' '}
                  compatibility
                </span>{' '}
                💞
              </h1>

              <div className="mb-8 flex w-full flex-col pt-2">
                <div className="flex w-full items-center">
                  <Suspense>
                    <NewPairFormBothNames />
                  </Suspense>
                </div>
              </div>
            </div>

            <div className="mb-8 pt-8 text-base 2xl:text-lg">
              These are AI Agents built with{' '}
              <a
                className="font-medium underline-offset-4 hover:underline"
                target="_blank"
                href="https://www.decentralgpt.org">
                DecentralGPT
              </a>
              , it will:
              <ul className="mt-2 list-disc space-y-1 pl-8">
                <li>find Twitter accounts online</li>
                <li>will read your profile and tweets</li>
                <li>then it will use Large Language Models - like the ones in DecentralGPT - to analyse your personality</li>
                <li>finally, it&apos;ll create a website with the analysis of your personality or compatibility</li>
              </ul>
            </div>
          </div>
          <div className="grow" />

          <div className="bottom-6 space-y-3 border-t">
            <div className="flex flex-col gap-2">
              <p className="mt-8 text-sm">
                <span
                  className="bg-clip-text font-bold text-transparent"
                  style={{ backgroundColor: '#CB9F9F' , backgroundClip: 'text',WebkitBackgroundClip : 'text' }}>
                  support the DeGPT  launch! <br />GPU From DeepBrainChain AI Public Chain
                </span>
              </p>
              {/* <div className="flex flex-wrap gap-2">
                <PHButton />
                <Button
                  variant={'outline'}
                  asChild>
                  <a
                    href="https://github.com/wordware-ai/twitter"
                    target="_blank"
                    className="flex-center gap-2">
                    <PiGithubLogo />
                    GitHub Repo
                  </a>
                </Button>
                <Button
                  asChild
                  variant={'outline'}>
                  <Link
                    href="/open"
                    className="flex items-center gap-2">
                    <PiBrain />
                    Stats
                  </Link>
                </Button>
              </div> */}
            </div>
          </div>
        </div>
        <div className="flex h-full w-full items-center justify-center bg-[#F6F0F0] md:h-auto md:w-1/2">
          <div className="hidden md:block">
            <Quote />
          </div>
        </div>
      </div>
      <TopList />
    </section>
  )
}

export default Page
