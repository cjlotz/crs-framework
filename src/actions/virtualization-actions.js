import {VirtualizationManager} from "./../managers/virtualization/virtualization-manager.js";

export class VirtualizationActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    /**
     * @method enable - enable virtualization on a element
     * @param step {object} - The step object.
     * @param context {object} - The context object.
     * @param process {object} - The current process object.
     * @param item {object} - The item object.
     *
     * @param step.args.element {HTMLElement} - Element to enable virtualization on.
     * @param step.args.itemSize {number} - The size of each item.
     * @param step.args.itemCount {number} - The number of items.
     * @returns {Promise<void>}
     */
    static async enable(step, context, process, item) {
        const element = await context.getElement(step, process, item);
        const itemCount = await crs.process.getValue(step.args.itemCount, context, process, item);
        const itemSize = await crs.process.getValue(step.args.itemSize, context, process, item);

        element.__virtualizationManager = new VirtualizationManager(element, itemCount, itemSize);
    }

    static async disable(step, context, process, item) {
        const element = await context.getElement(step, process, item);

        if (element.__virtualizationManager != null) {
            element.__virtualizationManager.dispose();
            delete element.__virtualizationManager;
        }
    }
}