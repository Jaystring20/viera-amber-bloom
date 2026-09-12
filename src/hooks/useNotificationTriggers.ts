/**
 * Hook for triggering notifications from React components
 * Makes it easy to call notification triggers from any component
 */

import { useCallback } from "react";
import { NotificationService } from "@/services/notificationService";

export const useNotificationTriggers = () => {
  /**
   * Trigger low inventory alert when pads fall below threshold
   */
  const onLowInventory = useCallback(
    async (schoolId: string, padCount: number, threshold?: number) => {
      return await NotificationService.triggerLowInventoryAlert(
        schoolId,
        padCount,
        threshold
      );
    },
    []
  );

  /**
   * Trigger payment reminder
   */
  const onPaymentDue = useCallback(
    async (schoolId: string, amount: number, daysOverdue?: number) => {
      return await NotificationService.triggerPaymentReminder(
        schoolId,
        amount,
        daysOverdue
      );
    },
    []
  );

  /**
   * Trigger cycle completion notification
   */
  const onCycleComplete = useCallback(
    async (
      schoolId: string,
      girlsParticipated: number,
      startDate: string,
      endDate: string
    ) => {
      return await NotificationService.triggerCycleCompletion(
        schoolId,
        girlsParticipated,
        startDate,
        endDate
      );
    },
    []
  );

  /**
   * Trigger payment received notification
   */
  const onPaymentReceived = useCallback(
    async (schoolId: string, amount: number, paymentMethod: string) => {
      return await NotificationService.triggerPaymentReceived(
        schoolId,
        amount,
        paymentMethod
      );
    },
    []
  );

  /**
   * Trigger distribution complete notification
   */
  const onDistributionComplete = useCallback(
    async (schoolId: string, girlsCount: number, padsDistributed: number) => {
      return await NotificationService.triggerDistributionComplete(
        schoolId,
        girlsCount,
        padsDistributed
      );
    },
    []
  );

  /**
   * Trigger system alert
   */
  const onSystemAlert = useCallback(
    async (
      title: string,
      message: string,
      severity?: "low" | "medium" | "high"
    ) => {
      return await NotificationService.triggerSystemAlert(
        title,
        message,
        severity
      );
    },
    []
  );

  return {
    onLowInventory,
    onPaymentDue,
    onCycleComplete,
    onPaymentReceived,
    onDistributionComplete,
    onSystemAlert,
  };
};
