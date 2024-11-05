"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Asset, EnsureOperation } from "@/types"

// Define a base config type
interface OperationConfig {
  title: string;
  description: string;
  actionButton: string;
  comingSoonMessage: string;
  isDangerous?: boolean;
  isCaution?: boolean;
  cautionMessage?: string;
}

interface EnsureModalProps {
  asset: Asset;
  address: string;
  isOpen: boolean;
  onClose: () => void;
  operation: EnsureOperation;
  isTokenbound?: boolean;
  onAction: (params: any) => Promise<{ hash: string; isCrossChain?: boolean }>;
}

export function EnsureModal({ 
  asset, 
  address, 
  isOpen, 
  onClose, 
  operation,
  isTokenbound = true
}: EnsureModalProps) {
  const operationConfig: Record<EnsureOperation, OperationConfig> = {
    ensure: {
      title: 'Ensure Asset',
      description: 'Mint a certificate of ensurance for this asset',
      actionButton: 'Ensure',
      comingSoonMessage: 'Ensurance minting coming soon'
    },
    send: {
      title: 'Send Asset',
      description: 'Transfer this asset to another address',
      actionButton: 'Send',
      comingSoonMessage: 'Send functionality coming soon'
    },
    convert: {
      title: 'Convert Asset',
      description: 'Convert this asset to another type',
      actionButton: 'Convert',
      comingSoonMessage: 'Convert functionality coming soon'
    },
    buy: {
      title: 'Buy Asset',
      description: 'Purchase this asset',
      actionButton: 'Buy',
      comingSoonMessage: 'Buy functionality coming soon'
    },
    sell: {
      title: 'Sell Asset',
      description: 'List this asset for sale',
      actionButton: 'Sell',
      comingSoonMessage: 'Sell functionality coming soon'
    },
    swap: {
      title: 'Swap Currency',
      description: 'Swap this currency for another',
      actionButton: 'Swap',
      comingSoonMessage: 'Swap functionality coming soon'
    },
    hide: {
      title: 'Hide Asset',
      description: 'Hide this asset from your view',
      actionButton: 'Hide',
      comingSoonMessage: 'Hide functionality coming soon',
      isCaution: true,
      cautionMessage: "Does this look like spam? Help us improve by reporting it."
    },
    burn: {
      title: 'Burn Asset',
      description: 'Permanently destroy this asset',
      actionButton: 'Burn',
      comingSoonMessage: 'Burn functionality coming soon',
      isDangerous: true
    }
  };

  const currentConfig = operationConfig[operation];

  const handleClose = () => {
    onClose();
    // Reset pointer events
    setTimeout(() => {
      document.body.style.pointerEvents = 'auto';
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border border-gray-800 shadow-lg max-w-md">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-100">
            {currentConfig.title}
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-1">
            {currentConfig.description}
          </p>
        </DialogHeader>
        
        {/* Asset/Currency Preview */}
        <div className="py-4">
          <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg">
            <div className="w-16 h-16 flex items-center justify-center bg-gray-700 rounded-lg">
              {asset?.symbol ? (
                <span className="text-2xl font-bold text-gray-100">
                  {asset.symbol}
                </span>
              ) : asset?.image_url ? (
                <img 
                  src={asset.image_url} 
                  alt={asset.name || 'Asset'} 
                  className="object-cover w-full h-full rounded-lg"
                />
              ) : (
                <span className="text-xl text-gray-400">?</span>
              )}
            </div>
            <div>
              {/* Only show collection name or chain info here */}
              {asset?.collection?.name && (
                <p className="text-sm text-gray-400">
                  {asset.collection.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Caution Warning for Hide */}
        {currentConfig.isCaution && (
          <div className="my-4 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
            <h3 className="text-yellow-500 font-bold text-lg mb-2">⚠️ CAUTION</h3>
            <p className="text-yellow-400">
              {currentConfig.cautionMessage}
            </p>
          </div>
        )}

        {/* Danger Warning for Burn */}
        {currentConfig.isDangerous && (
          <div className="my-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <h3 className="text-red-500 font-bold text-lg mb-2">⚠️ DANGER!</h3>
            <p className="text-red-400">
              Burning an asset is permanent and irreversible. 
              This action cannot be undone.
            </p>
          </div>
        )}

        {/* Coming Soon Message */}
        <div className="py-6 text-center">
          <p className="text-lg text-amber-400 font-semibold">
            {currentConfig.comingSoonMessage}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-800">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 