import PageContent from '@/components/page-content'

interface PageProps {
  params: { situs: string }
}

export default function Page({ params }: PageProps) {
  return (
    <PageContent situs={params.situs}>
      <h1>{params.situs} Situs</h1>
      {/* Add more situs-specific content here */}
    </PageContent>
  )
}