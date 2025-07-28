import React from 'react';
import networkService from '../services/networkService';
import notificationService from '../services/notificationService.jsx';

const NetworkWarningModal = ({ 
  isOpen, 
  onClose, 
  currentNetwork, 
  ethereumProvider, 
  onNetworkSwitch 
}) => {
  if (!isOpen) return null;

  const handleSwitchNetwork = async () => {
    try {
      await networkService.switchToSepolia(ethereumProvider);
      notificationService.networkSwitchSuccess();
      if (onNetworkSwitch) {
        onNetworkSwitch();
      }
      onClose();
    } catch (error) {
      console.error('Network switch failed:', error);
      notificationService.networkSwitchFailed(error.message);
    }
  };

  const handleManualSwitch = () => {
    notificationService.info('Please switch to Sepolia testnet manually in your wallet.', 5000);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-[#332F2F] rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Wrong Network Detected</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">Network Mismatch</span>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="text-gray-300 text-sm mb-2">Current Network:</div>
            <div className="text-white font-semibold">{currentNetwork?.name || 'Unknown Network'}</div>
            <div className="text-gray-400 text-xs">Chain ID: {currentNetwork?.chainId?.toString() || 'Unknown'}</div>
          </div>

          <div className="bg-green-900 bg-opacity-20 border border-green-500 rounded-lg p-4">
            <div className="text-green-300 text-sm mb-2">Required Network:</div>
            <div className="text-green-100 font-semibold">Sepolia Testnet</div>
            <div className="text-green-400 text-xs">Chain ID: 11155111</div>
          </div>
        </div>

        <div className="text-gray-300 text-sm mb-6">
          This dApp only works on Sepolia testnet. Please switch to the correct network to continue.
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSwitchNetwork}
            className="w-full bg-[#F24333] hover:bg-[#BA1B1D] text-white py-3 px-4 rounded-lg font-semibold transition-colors cursor-target"
          >
            Switch to Sepolia Automatically
          </button>
          
          <button
            onClick={handleManualSwitch}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors cursor-target"
          >
            Switch Manually
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 py-3 px-4 rounded-lg font-semibold transition-colors cursor-target"
          >
            Continue Anyway (Not Recommended)
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          Note: Some features may not work correctly on the wrong network.
        </div>
      </div>
    </div>
  );
};

export default NetworkWarningModal; 