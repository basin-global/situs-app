import PageContent from '@/components/page-content';

interface PageProps {
  params: { situs: string }
}

export default function GenericPage({ params }: PageProps) {
  return <PageContent situs={params.situs} />;
}