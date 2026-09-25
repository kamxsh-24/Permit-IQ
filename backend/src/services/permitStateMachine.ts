import { PermitStatus } from '../types/index.js';
import { AppError } from '../utils/apiResponse.js';

export const VALID_TRANSITIONS: Record<PermitStatus, PermitStatus[]> = {
  [PermitStatus.DRAFT]: [PermitStatus.PENDING_APPROVAL, PermitStatus.CANCELLED],
  [PermitStatus.PENDING_APPROVAL]: [PermitStatus.APPROVED, PermitStatus.REJECTED, PermitStatus.CANCELLED],
  [PermitStatus.APPROVED]: [PermitStatus.ACTIVE, PermitStatus.CANCELLED],
  [PermitStatus.ACTIVE]: [PermitStatus.SUSPENDED, PermitStatus.EXPIRED, PermitStatus.CLOSED],
  [PermitStatus.SUSPENDED]: [PermitStatus.ACTIVE, PermitStatus.EXPIRED, PermitStatus.CANCELLED],
  [PermitStatus.CLOSED]: [PermitStatus.CLOSED_VERIFIED],
  [PermitStatus.REJECTED]: [], // Terminal state
  [PermitStatus.EXPIRED]: [],  // Terminal state
  [PermitStatus.CLOSED_VERIFIED]: [], // Terminal state
  [PermitStatus.CANCELLED]: [], // Terminal state
};

export const TERMINAL_STATES: PermitStatus[] = [
  PermitStatus.REJECTED,
  PermitStatus.EXPIRED,
  PermitStatus.CLOSED_VERIFIED,
  PermitStatus.CANCELLED,
];

export class PermitStateMachine {
  /**
   * Central validation function for permit state transitions.
   */
  public static canTransition(currentStatus: PermitStatus, requestedStatus: PermitStatus): boolean {
    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(requestedStatus)) {
      return false;
    }
    return true;
  }

  /**
   * Asserts transition validity and throws an AppError with clear business context if invalid.
   */
  public static validateTransition(currentStatus: PermitStatus, requestedStatus: PermitStatus): void {
    if (TERMINAL_STATES.includes(currentStatus)) {
      throw new AppError(
        `Invalid State Transition: Permit is in terminal state '${currentStatus}' and cannot undergo further status transitions`,
        400,
        'TERMINAL_STATE'
      );
    }

    if (!this.canTransition(currentStatus, requestedStatus)) {
      throw new AppError(
        `Invalid State Transition: Cannot transition permit from '${currentStatus}' to '${requestedStatus}'. Allowed transitions from '${currentStatus}': [${VALID_TRANSITIONS[currentStatus]?.join(', ') || 'None'}]`,
        400,
        'INVALID_STATE_TRANSITION'
      );
    }
  }

  /**
   * Validates business rules for activating an APPROVED permit:
   * 1. Must be in APPROVED status
   * 2. Cannot activate before plannedStart
   * 3. Cannot activate after plannedEnd
   */
  public static validateActivationWindow(plannedStart: Date, plannedEnd: Date): void {
    const now = new Date();
    
    if (now < plannedStart) {
      throw new AppError(
        `Activation Denied: Permit cannot become ACTIVE before its planned start time (${plannedStart.toISOString()}). Current time: ${now.toISOString()}`,
        400,
        'PREMATURE_ACTIVATION'
      );
    }

    if (now > plannedEnd) {
      throw new AppError(
        `Activation Denied: Permit validity window has expired (${plannedEnd.toISOString()}). An expired permit cannot be activated.`,
        400,
        'EXPIRED_PERMIT'
      );
    }
  }
}

export default PermitStateMachine;
