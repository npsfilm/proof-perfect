// Simplified hook - OAuth no longer needed with iCal sync
// Keeping for backwards compatibility with existing components

export function useGoogleCalendarAuth() {
  return {
    user: null,
    isConnected: true, // Always connected with iCal
    isLoadingToken: false,
    isTokenExpired: false,
    tokenData: null,
    initiateOAuth: () => {
      // No longer needed
      console.log('OAuth not needed - using iCal sync');
    },
    handleOAuthSuccess: async () => {
      // No longer needed
    },
    disconnectCalendar: {
      mutate: () => {},
      isPending: false,
    },
  };
}
