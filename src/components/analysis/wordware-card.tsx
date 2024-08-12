import React from 'react'

import WordwareLogo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export const WordwareCard: React.FC = () => {
  return (
    <Card className={cn(`relative w-full overflow-hidden rounded-2xl border bg-opacity-5 px-4 pb-4`)}>
      <CardHeader className="flex w-full flex-col items-start">
        <CardTitle className="flex w-full items-center justify-between py-2 pb-4 text-2xl">
          <div className="flex items-center gap-3">
            <WordwareLogo
              emblemOnly
              color={'black'}
              width={32}
            />
            <span className={`text-xl font-light text-gray-900`}>DecentralGPT = DePIN+AI + AGI</span>
          </div>
        </CardTitle>
        <div className="w-full border-b border-gray-300" />
      </CardHeader>
      <CardContent className="flex flex-col space-y-2 text-gray-700">
        DecentralGPT is Decentralized LLM AI Inference Network.
        <br />
        <p>DecentralGPT supports a variety of open-source large language models.</p>
        <br />
        <p>It is committed to building a safe, privacy-protective, democratic, transparent, open-source, and universally accessible AGI.</p>
        <div className="mt-8 py-4">
          <Button
            size={'sm'}
            variant={'default'}
            asChild>
            <a
              href="https://www.degpt.ai"
              target="_blank"
              className="flex-center gap-2">
              <WordwareLogo
                emblemOnly
                color={'white'}
                width={12}
              />
              <p>DeGPT</p>
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
