'use client';

import React from 'react';
import { Asset } from '@/modules/assets';
import { Card } from "@/components/ui/card";

interface MetadataAssetsWrapperProps {
  children: React.ReactNode;
}

const metadataCardStyles = {
  wrapper: "h-[calc(100%-3rem)] overflow-y-auto bg-green-500/50 border-4 border-green-500",
  content: "p-4 bg-yellow-500/50 border-4 border-yellow-500"
};

export function MetadataAssetsWrapper({ children }: MetadataAssetsWrapperProps) {
  return (
    <div className={metadataCardStyles.wrapper}>
      <div className={metadataCardStyles.content}>
        {children}
      </div>
    </div>
  );
} 