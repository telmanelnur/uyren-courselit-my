// Import NiceModal for re-export
import NiceModal from "./modal-context";

// Main NiceModal exports
export { default as NiceModal } from "./modal-context";
export {
    useModal,
    create,
    register,
    unregister,
    show,
    hide,
    remove,
    reducer,
    Provider,
    ModalDef,
    ModalHolder,
    createModalHandler,
} from "./modal-context";

// Utility functions
export {
    showComponentNiceDialog,
} from "./utils";

// Re-export types for convenience
export type {
    NiceModalHandler,
    NiceModalState,
    NiceModalStore,
    NiceModalAction,
    NiceModalHocProps,
    NiceModalHocPropsExtended,
    NiceModalArgs,
} from "./modal-context";

// Default export for backward compatibility
export default NiceModal;
