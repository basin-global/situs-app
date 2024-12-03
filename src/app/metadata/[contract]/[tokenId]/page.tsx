import { ModuleView } from '@/modules/metadata/ModuleView';

export default function MetadataViewPage({ params }: { 
  params: { contract: string; tokenId: string } 
}) {
  return (
    <div>
      <ModuleView contract={params.contract} tokenId={params.tokenId} />
    </div>
  );
}
