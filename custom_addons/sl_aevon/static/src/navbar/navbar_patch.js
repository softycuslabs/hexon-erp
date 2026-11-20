import { useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { patch } from "@web/core/utils/patch";
import { NavBar } from "@web/webclient/navbar/navbar";

patch(NavBar.prototype, {
    setup() {
        super.setup(...arguments);
        this.slHomeMenu = useService("sl_home_menu");
        this.slHomeState = useState(this.slHomeMenu.state);
    },

    onSlHomeMenuToggle() {
        this.slHomeMenu.toggle();
    },

    // Mobile sidebar: "All Apps" opens the home screen instead of a list.
    onAllAppsBtnClick() {
        this._closeAppMenuSidebar();
        this.slHomeMenu.open();
    },
});
