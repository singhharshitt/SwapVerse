import React from 'react';

const WalletModal = ({ isOpen, onClose, onSelectWallet, availableWallets, isConnecting }) => {
  if (!isOpen) return null;

  const getWalletIcon = (walletType) => {
    if (walletType === 'metamask') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.49 1L13.5 8.25L14.75 4.25L21.49 1Z" fill="#E2761B"/>
          <path d="M2.51 1L13.4 8.4L9.25 4.25L2.51 1Z" fill="#E4761B"/>
          <path d="M18.5 17.5L16.5 21L21 22.5L22.5 18L18.5 17.5Z" fill="#E4761B"/>
          <path d="M1.5 18L3 22.5L7.5 21L5.5 17.5L1.5 18Z" fill="#E4761B"/>
          <path d="M6.5 11L5 13L9.5 13.5L9.25 8.5L6.5 11Z" fill="#E4761B"/>
          <path d="M17.5 11L14.75 8.5L14.5 13.5L19 13L17.5 11Z" fill="#E4761B"/>
          <path d="M7.5 21L10.5 19.5L7.75 17L7.5 21Z" fill="#E4761B"/>
          <path d="M13.5 19.5L16.5 21L16.25 17L13.5 19.5Z" fill="#E4761B"/>
        </svg>
      );
    } else if (walletType === 'phantom') {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" fill="#AB9FF2"/>
          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2z" fill="#AB9FF2"/>
          <path d="M12 4C7.589 4 4 7.589 4 12s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8z" fill="#AB9FF2"/>
          <path d="M12 6C8.691 6 6 8.691 6 12s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6z" fill="#AB9FF2"/>
          <path d="M12 8C9.794 8 8 9.794 8 12s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4z" fill="#AB9FF2"/>
          <path d="M12 10C10.896 10 10 10.896 10 12s0.896 2 2 2 2-0.896 2-2-0.896-2-2-2z" fill="#AB9FF2"/>
        </svg>
      );
    }
    return null;
  };

  const getWalletName = (walletType) => {
    return walletType === 'metamask' ? 'MetaMask' : 'Phantom';
  };

  const getWalletDescription = (walletType) => {
    return walletType === 'metamask' 
      ? 'Connect with MetaMask wallet' 
      : 'Connect with Phantom wallet';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-[#332F2F] rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Connect Wallet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isConnecting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {availableWallets.map((walletType) => (
            <button
              key={walletType}
              onClick={() => onSelectWallet(walletType)}
              disabled={isConnecting}
              className="w-full flex items-center space-x-4 p-4 rounded-lg border border-gray-600 hover:border-[#F24333] hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-target"
            >
              <div className="text-[#F24333]">
                {getWalletIcon(walletType)}
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-semibold">
                  {getWalletName(walletType)}
                </div>
                <div className="text-gray-400 text-sm">
                  {getWalletDescription(walletType)}
                </div>
              </div>
              {isConnecting && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#F24333]"></div>
              )}
            </button>
          ))}
        </div>

        {availableWallets.length === 0 && (
          <div className="text-center py-6">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-400">No supported wallets found</p>
            <p className="text-gray-500 text-sm mt-2">
              Please install MetaMask or Phantom to use this app
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletModal; 