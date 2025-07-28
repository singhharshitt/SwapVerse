class NotificationService {
  constructor() {
    this.notifications = [];
    this.nextId = 1;
  }

  // Create a new notification
  createNotification(type, message, duration = 5000) {
    const id = this.nextId++;
    const notification = {
      id,
      type,
      message,
      timestamp: Date.now(),
      duration
    };

    this.notifications.push(notification);
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
    }

    return id;
  }

  // Remove a notification by ID
  removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
  }

  // Get all notifications
  getNotifications() {
    return this.notifications;
  }

  // Success notification
  success(message, duration = 5000) {
    return this.createNotification('success', message, duration);
  }

  // Error notification
  error(message, duration = 8000) {
    return this.createNotification('error', message, duration);
  }

  // Warning notification
  warning(message, duration = 6000) {
    return this.createNotification('warning', message, duration);
  }

  // Info notification
  info(message, duration = 5000) {
    return this.createNotification('info', message, duration);
  }

  // Network-specific notifications
  networkError(currentNetwork, requiredNetwork = 'Sepolia Testnet') {
    return this.error(
      `Wrong network detected. You are connected to ${currentNetwork}. Please switch to ${requiredNetwork}.`,
      10000
    );
  }

  networkSwitchSuccess() {
    return this.success('Successfully switched to Sepolia testnet!', 3000);
  }

  networkSwitchFailed(error) {
    return this.error(`Failed to switch network: ${error}`, 8000);
  }

  walletConnected(walletType) {
    return this.success(`Connected to ${walletType} successfully!`, 3000);
  }

  walletDisconnected() {
    return this.info('Wallet disconnected', 3000);
  }

  transactionPending() {
    return this.info('Transaction pending... Please wait.', 0); // No auto-remove
  }

  transactionSuccess(txHash) {
    return this.success(`Transaction successful! Hash: ${txHash.slice(0, 10)}...`, 5000);
  }

  transactionFailed(error) {
    return this.error(`Transaction failed: ${error}`, 8000);
  }

  // Get notification type styles
  getNotificationStyles(type) {
    const baseStyles = 'p-4 rounded-lg border-l-4 shadow-lg max-w-md mx-auto mb-4';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`;
    }
  }

  // Get notification icon
  getNotificationIcon(type) {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  }
}

export default new NotificationService(); 