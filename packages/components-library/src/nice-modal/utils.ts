import NiceModal, { NiceModalArgs } from "./modal-context";
import React from "react";

/**
 * Enhanced type-safe wrapper for showing modal components
 * Provides better TypeScript support and consistent return types
 */
export const showComponentNiceDialog = <
    T = unknown,
    C extends React.ComponentType<any> = React.ComponentType<any>,
    P extends Partial<NiceModalArgs<C>> = Partial<NiceModalArgs<C>>
>(
    modal: C,
    args?: P
): Promise<{
    result: T;
    reason?: string;
}> => {
    return NiceModal.show<T, C, P>(modal, args) as Promise<{
        result: T;
        reason?: string;
    }>;
};