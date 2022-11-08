import "./markdown-viewer.js";

export class MarkdownViewerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async set_markdown(step, context, process, item) {
        const element = await crs.dom.get_element(step, context, process, item);
        const markdown = await crs.process.getValue(step.args.markdown, context, process, item);
        const title = await crs.process.getValue(step.args.title, context, process, item);
        const parameters = await crs.process.getValue(step.args.parameters, context, process, item);
        await element.set_markdown(title, markdown, parameters);
    }
}

crs.intent.markdown_viewer = MarkdownViewerActions;