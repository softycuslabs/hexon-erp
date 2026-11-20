import { patch } from "@web/core/utils/patch";
import { WebClient } from "@web/webclient/webclient";

patch(WebClient.prototype, {
    // With no action in the URL (e.g. right after login), show the home screen
    // instead of opening the first app, like Odoo Enterprise.
    _loadDefaultApp() {
        this.env.services.sl_home_menu.open();
    },
});
