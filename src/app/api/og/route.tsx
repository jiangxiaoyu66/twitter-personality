import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { PiRobot } from 'react-icons/pi'

import { cardData } from '@/lib/wordware-config'

export const runtime = 'edge'
const light = fetch(new URL('./Inter-Light.ttf', import.meta.url)).then((res) => res.arrayBuffer())
const bold = fetch(new URL('./Inter-SemiBold.ttf', import.meta.url)).then((res) => res.arrayBuffer())

/**
 * Handles GET requests to generate Open Graph images.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<ImageResponse|Response>} The generated image or an error response.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const picture = searchParams.get('picture') || ''
  const name = searchParams.get('name') || ''
  const username = searchParams.get('username') || ''
  const content = searchParams.get('content') || ''
  const section = searchParams.get('section') || ''

  try {
    return new ImageResponse(
      generateOG({
        picture,
        name,
        username,
        content,
        section,
      }),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Inter', data: await bold, weight: 600 },
          { name: 'Inter', data: await light, weight: 300 },
        ],
      },
    ) as any
  } catch (error) {
    console.error('Failed to generate OG image:', error)
    return new Response(`Failed to generate OG image`, { status: 500 })
  }
}

/**
 * Generates the Open Graph image content.
 * @param {Object} params - The parameters for generating the OG image.
 * @param {string} params.picture - URL of the user's profile picture.
 * @param {string} params.name - User's name.
 * @param {string} params.username - User's username.
 * @param {string} params.content - Content to be displayed in the image.
 * @param {string} params.section - Section identifier for styling.
 * @returns {React.ReactElement} The React element representing the OG image.
 */
function generateOG({
  picture,
  name,
  username,
  content,
  section,
}: {
  picture: string
  name: string
  username: string
  content: string
  section: string
}): React.ReactElement {
  const {
    icon: Icon,
    bg,
    colorClass,
    title,
  } = cardData.find((card) => card.contentKey === section) || {
    icon: PiRobot,
    bg: 'bg-white',
    colorClass: 'text-gray-800',
    title: 'Persona',
  }

  /**
   * Renders the content based on its type and structure.
   * @returns {React.ReactElement} The rendered content.
   */
  const renderContent = () => {
    try {
      const parsedContent = JSON.parse(content)
      if (Array.isArray(parsedContent)) {
        return (
          <div
            tw=" flex"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {parsedContent.slice(0, 3).map((item, index) => (
              <div
                key={index}
                tw="mt-3"
                style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ fontSize: '38px', fontWeight: 300, width: typeof item === 'string' ? '100%' : '25%' }}>
                  {typeof item === 'string' ? item : item.title}
                </div>
                {typeof item !== 'string' && <div style={{ fontSize: '32px', fontWeight: 300, width: '75%' }}>{item.subtitle?.replace(/\*/g, '')}</div>}
              </div>
            ))}
          </div>
        )
      } else if (typeof parsedContent === 'object') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(parsedContent).map(([key, value], index) => (
              <div
                key={index}
                style={{ fontSize: '38px', fontWeight: 300 }}>
                <span>{key}:</span> {typeof value === 'string' ? value.replace(/\*/g, '') : ''}
              </div>
            ))}
          </div>
        )
      }
    } catch (e) {
      console.log('ℹ️ OG content parse error, moving to fallback', e)
    }

    // Fallback for unparseable content
    return (
      <div style={{ fontSize: '38px', fontWeight: 300 }}>
        {content ? (content.length > 300 ? content.slice(0, 300).replace(/\*/g, '') + '...' : content.replace(/\*/g, '')) : ''}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: '48px',
        backgroundColor: '#fafafa',
        fontFamily: 'Inter, sans-serif',
      }}>
      <div
        tw={`${bg === 'bg-white' ? bg : `${bg} bg-opacity-10`} `}
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          padding: '36px',
          // paddingBottom: '44px',
          paddingTop: '36px',
          height: '100%',
          position: 'relative',
          border: '1px solid #e5e7eb',
        }}>
        {/* Header section */}
        <div
          tw="border-b border-gray-300"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            // borderBottom: '1px solid #0d0d0d',
            paddingBottom: '26px',
          }}>
          <div
            tw={`${colorClass}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon size={36} /> <span tw="text-3xl">My {title} by the AI Agent</span>
          </div>
        </div>

        {/* Content section */}
        <div
          tw="items-center font-light"
          style={{ marginTop: '24px', color: '#1a1a1a', display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          {renderContent()}
        </div>

        {/* User info section */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            right: '48px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
          {picture && (
            <img
              src={picture}
              alt="Profile picture"
              style={{ width: '64px', height: '64px', borderRadius: '50%' }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              tw="font-bold"
              style={{ fontWeight: 'bold', fontSize: '20px' }}>
              {name}
            </div>
            <div
              tw="font-bold "
              style={{ display: 'flex', fontSize: '18px', color: '#7e7e7e' }}>
              @{username}
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '48px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            {/* 图片显示不出来 */}
          {/* <img
            alt='degpt-logo'
            src='https://x.degpt.ai/favicon.png'
            width='30'
            height='30'
          /> */}
          <svg
            version="1.1"
            id="Layer_1" 
            xmlns="http://www.w3.org/2000/svg" 
            width="50"
            height="50"
            viewBox="0 0 143 143"
            enable-background="new 0 0 143 143"
          >  
            <img
              id="image0"
              width="50" 
              height="50"
              src="data:image/png;base64,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"
            ></img>
          </svg>
          <span style={{ fontSize: '30px', marginLeft: '6px' }}>DecentralGPT</span>
        </div>
      </div>
    </div>
  )
}
