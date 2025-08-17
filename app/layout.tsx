import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://vanowarna.github.io'),
  title: 'Vanodhya Warnasooriya | PhD Applicant | Generative & Interactive Computing',
  description:
    'Portfolio of Vanodhya Warnasooriya, focusing on generative AI, computational imaging, HCI, and on-device machine learning.',
  keywords: [
    'Vanodhya Warnasooriya',
    'PhD Applicant',
    'Computer Vision',
    'Generative Models',
    'Interactive Computing',
    'Computational Imaging',
    'HCI',
    'AR/VR',
    'On-Device ML',
    'University of Peradeniya'
  ],
  openGraph: {
    type: 'profile',
    url: 'https://vanowarna.github.io/',
    title: 'Vanodhya Warnasooriya | PhD Applicant | Generative & Interactive Computing',
    description:
      'A researcher building generative & interactive visual computing systems for human-AI collaboration and remote sensing.',
    images: ['/og-image.jpg'],
    firstName: 'Vanodhya',
    lastName: 'Warnasooriya'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vanowarna',
    title: 'Vanodhya Warnasooriya | PhD Applicant | Generative & Interactive Computing',
    description:
      'A researcher building generative & interactive visual computing systems for human-AI collaboration and remote sensing.',
    images: ['/og-image.jpg']
  },
  icons: { icon: '/favicon.png' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
