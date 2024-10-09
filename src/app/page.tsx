import fs from 'fs'
import path from 'path'
import AllOGs from '@/components/allOGs'
import NexusSection from '@/components/NexusSection'
import PossibleSection from '@/components/PossibleSection'
import SupportSection from '@/components/SupportSection'

async function getLogos(directory: string) {
  const logoDirectory = path.join(process.cwd(), `public/assets/logos/${directory}`)
  const filenames = fs.readdirSync(logoDirectory)

  return filenames
    .filter(filename => !filename.includes('.DS_Store'))
    .map(filename => {
      const name = path.parse(filename).name
      let size: 'sm' | 'm' | 'lg' | 'xl' = 'm'
      if (name.endsWith('-sm')) size = 'sm'
      if (name.endsWith('-lg')) size = 'lg'
      if (name.endsWith('-xl')) size = 'xl'
      return {
        src: `/assets/logos/${directory}/${filename}`,
        name: name.replace(/-[sm|m|lg|xl]$/, ''), // Remove size suffix from name
        size
      }
    })
}

export default async function Home() {
  const possibleLogos = await getLogos('possible')
  const supportLogos = await getLogos('support')

  return (
    <>
      <AllOGs />
      <NexusSection />
      <PossibleSection logos={possibleLogos} />
      <SupportSection logos={supportLogos} />
    </>
  )
}