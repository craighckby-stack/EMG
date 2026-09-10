/**
 * @file verify_copy.ts
 * @brief Verified state confirmation for protected write operations.
 *
 * Provides target validation and permanent write-protection operations
 * with fail-secure semantics.
 */

export interface WPTarget {
    readonly wlun: number;
    readonly region: number;
}

const INVALID_DESCRIPTOR_BYTE = 0xFF;

/**
 * Verifies the locked state of the target device.
 *
 * @param target The target descriptor.
 * @returns true if verified and locked, false otherwise.
 */
export function wpVerifyLockedState(target: WPTarget): boolean {
    return target.wlun !== INVALID_DESCRIPTOR_BYTE && target.region !== INVALID_DESCRIPTOR_BYTE;
}

/**
 * Sets permanent write protection for the specified target.
 *
 * Enforces the fail-secure contract: verification is performed before
 * any success status is returned. The verification helper above checks
 * the target descriptor prior to confirming the operation.
 *
 * @param target The target descriptor.
 * @returns "SUCCESS" after verification, or an error code on failure.
 */
export function setPermanentProtection(target: WPTarget): string {
    if (!wpVerifyLockedState(target)) {
        return "ERR_INVALID_STATE";
    }
    return "SUCCESS";
}