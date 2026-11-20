import { Component, useEffect, useExternalListener, useRef, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useBus, useService } from "@web/core/utils/hooks";
import { fuzzyLookup } from "@web/core/utils/search";

/**
 * Full-screen grid of app icons, in the style of the Odoo Enterprise home
 * screen. Mounted once as a main component and shown/hidden through the
 * `sl_home_menu` service.
 */
export class SlHomeMenu extends Component {
    static template = "sl_aevon.HomeMenu";
    static props = {};

    setup() {
        this.menuService = useService("menu");
        this.homeMenu = useService("sl_home_menu");
        this.homeState = useState(this.homeMenu.state);
        this.state = useState({ query: "", focusedIndex: null });
        this.inputRef = useRef("input");
        this.rootRef = useRef("root");

        // Any action loaded (app click, breadcrumb, notification link...) hides the menu.
        // Dialog actions (mode "new") open on top and keep the menu.
        useBus(this.env.bus, "ACTION_MANAGER:UI-UPDATED", ({ detail: mode }) => {
            if (mode !== "new") {
                this.homeMenu.forceClose();
            }
        });
        useBus(this.env.bus, "MENUS:APP-CHANGED", () => this.render());

        useEffect(
            (isOpen) => {
                document.body.classList.toggle("o_sl_home_menu_open", isOpen);
                if (isOpen) {
                    this.state.query = "";
                    this.state.focusedIndex = null;
                    this.inputRef.el?.focus();
                }
            },
            () => [this.homeState.isOpen]
        );
        useExternalListener(window, "keydown", this.onWindowKeydown, { capture: true });
    }

    get apps() {
        return this.menuService.getApps();
    }

    /** Every menu item that opens an action, labelled "App / Section / Item". */
    get menuItems() {
        const items = [];
        const walk = (menu, path) => {
            for (const child of menu.childrenTree || []) {
                const label = [...path, child.name];
                if (child.actionID) {
                    items.push({ menu: child, label: label.join(" / ") });
                }
                walk(child, label);
            }
        };
        for (const app of this.apps) {
            walk(this.menuService.getMenuAsTree(app.id), [app.name]);
        }
        return items;
    }

    get visibleApps() {
        const query = this.state.query.trim();
        if (!query) {
            return this.apps;
        }
        return fuzzyLookup(query, this.apps, (app) => app.name);
    }

    get visibleMenuItems() {
        const query = this.state.query.trim();
        if (!query) {
            return [];
        }
        return fuzzyLookup(query, this.menuItems, (item) => item.label).slice(0, 20);
    }

    /** Apps first, then menu items: one flat list for keyboard navigation. */
    get entries() {
        return [
            ...this.visibleApps.map((app) => ({ menu: app })),
            ...this.visibleMenuItems,
        ];
    }

    getMenuItemHref(menu) {
        return `/odoo/${menu.actionPath || "action-" + menu.actionID}`;
    }

    async openMenu(menu) {
        await this.menuService.selectMenu(menu);
        this.homeMenu.forceClose();
    }

    onClickEntry(ev, menu) {
        if (ev.ctrlKey || ev.metaKey) {
            return; // let the browser open the link in a new tab
        }
        ev.preventDefault();
        this.openMenu(menu);
    }

    onInput(ev) {
        this.state.query = ev.target.value;
        this.state.focusedIndex = this.state.query.trim() ? 0 : null;
    }

    /** Number of app tiles per row, read from the rendered grid. */
    get columnCount() {
        const tiles = this.rootRef.el?.querySelectorAll(".o_sl_app") || [];
        if (!tiles.length) {
            return 1;
        }
        const firstTop = tiles[0].offsetTop;
        let count = 0;
        for (const tile of tiles) {
            if (tile.offsetTop !== firstTop) {
                break;
            }
            count++;
        }
        return count;
    }

    moveFocus(delta) {
        const total = this.entries.length;
        if (!total) {
            return;
        }
        const current = this.state.focusedIndex;
        const next = current === null ? 0 : current + delta;
        this.state.focusedIndex = Math.min(Math.max(next, 0), total - 1);
        this.inputRef.el?.focus();
    }

    onWindowKeydown(ev) {
        if (!this.homeState.isOpen) {
            return;
        }
        // Leave dialogs and other overlays opened on top of the home menu alone.
        if (document.querySelector(".modal.show")) {
            return;
        }
        const appCount = this.visibleApps.length;
        const index = this.state.focusedIndex;
        const inApps = index !== null && index < appCount;
        switch (ev.key) {
            case "Escape":
                if (this.state.query) {
                    this.state.query = "";
                    this.state.focusedIndex = null;
                } else {
                    this.homeMenu.close();
                }
                break;
            case "ArrowRight":
                if (ev.target === this.inputRef.el && this.state.query && !inApps) {
                    return; // move the text cursor
                }
                this.moveFocus(1);
                break;
            case "ArrowLeft":
                if (ev.target === this.inputRef.el && this.state.query && !inApps) {
                    return;
                }
                this.moveFocus(-1);
                break;
            case "ArrowDown":
                this.moveFocus(inApps ? this.columnCount : 1);
                break;
            case "ArrowUp":
                this.moveFocus(inApps ? -this.columnCount : -1);
                break;
            case "Enter": {
                const entry = index !== null && this.entries[index];
                if (!entry) {
                    return;
                }
                this.openMenu(entry.menu);
                break;
            }
            default:
                // Typing anywhere goes to the search box.
                if (
                    ev.key.length === 1 &&
                    !ev.ctrlKey &&
                    !ev.metaKey &&
                    !ev.altKey &&
                    ev.target !== this.inputRef.el
                ) {
                    this.inputRef.el?.focus();
                }
                return;
        }
        ev.preventDefault();
        ev.stopPropagation();
    }
}

registry.category("main_components").add("sl_aevon.HomeMenu", { Component: SlHomeMenu });
