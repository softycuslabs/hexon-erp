import { reactive } from "@odoo/owl";
import { registry } from "@web/core/registry";

/**
 * Holds the open/closed state of the full-screen home menu so the navbar,
 * the web client and the overlay component can all share it.
 */
export const slHomeMenuService = {
    dependencies: ["action"],
    start(env, { action }) {
        const state = reactive({ isOpen: false });
        return {
            state,
            /** True when there is an action behind the home menu to go back to. */
            get canClose() {
                return Boolean(action.currentController);
            },
            open() {
                state.isOpen = true;
            },
            close() {
                if (this.canClose) {
                    state.isOpen = false;
                }
            },
            toggle() {
                state.isOpen ? this.close() : this.open();
            },
            forceClose() {
                state.isOpen = false;
            },
        };
    },
};

registry.category("services").add("sl_home_menu", slHomeMenuService);
