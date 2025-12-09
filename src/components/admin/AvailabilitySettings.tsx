import {
  useAvailabilityState,
  WeeklyScheduleCard,
  BlockedDatesCard,
  BookingSettingsCard,
  AvailabilityActionsBar,
} from './availability';

export function AvailabilitySettings() {
  const {
    localSettings,
    blockedDates,
    newBlockedDate,
    isLoading,
    isSyncing,
    isSaving,
    isAddingBlocked,
    isRemovingBlocked,
    setNewBlockedDate,
    handleDayToggle,
    handleTimeChange,
    handleSettingsChange,
    handleSaveSettings,
    handleAddBlockedDate,
    handleRemoveBlockedDate,
    handleSyncToGoogle,
  } = useAvailabilityState();

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <WeeklyScheduleCard
        localSettings={localSettings}
        onDayToggle={handleDayToggle}
        onTimeChange={handleTimeChange}
      />

      <BlockedDatesCard
        blockedDates={blockedDates}
        newBlockedDate={newBlockedDate}
        onNewBlockedDateChange={setNewBlockedDate}
        onAddBlockedDate={handleAddBlockedDate}
        onRemoveBlockedDate={handleRemoveBlockedDate}
        isAdding={isAddingBlocked}
        isRemoving={isRemovingBlocked}
      />

      <BookingSettingsCard
        localSettings={localSettings}
        onSettingsChange={handleSettingsChange}
      />

      <AvailabilityActionsBar
        onSave={handleSaveSettings}
        onSync={handleSyncToGoogle}
        isSaving={isSaving}
        isSyncing={isSyncing}
      />
    </div>
  );
}
