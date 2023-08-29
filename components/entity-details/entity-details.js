/**
 * @const SORT_DIRECTION - this is used to define the sort direction for the entities.
 * @type {Readonly<{ASCENDING: string, DESCENDING: string}>}
 */
const SORT_DIRECTION = Object.freeze({
    ASCENDING: "ascending",
    DESCENDING: "descending"
})

/**
 * @const SORT_ICONS - this is used to define the icons for the sort direction.
 * @type {Readonly<{[p: string]: string}>}
 */
const SORT_ICONS = Object.freeze({
  [SORT_DIRECTION.ASCENDING]: "sort-ascending",
  [SORT_DIRECTION.DESCENDING]: "sort-descending"
})

/**
 * @class EntityDetails - this is the main component that will display the entities and their items.
 */
export default class EntityDetails extends HTMLElement {

    #clickHandler = this.#click.bind(this);
    #sortDirection = SORT_DIRECTION.ASCENDING;
    #entityData = null;

    /**
     * @constructor - this will create the shadow root and attach it to the component.
     */
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    /**
     * @method connectedCallback - this is the main function that will be called when the component is attached to the DOM.
     * @returns {Promise<void>}
     */
    async connectedCallback() {
        const css = `<link rel="stylesheet" href="${import.meta.url.replace(".js", ".css")}">`;
        const html = await fetch(import.meta.url.replace(".js", ".html")).then(result => result.text());
        this.shadowRoot.innerHTML = `${css}${html}`;
        await crsbinding.translations.parseElement(this.shadowRoot.querySelector("header"));
        requestAnimationFrame(() => this.init())
    }

    /**
     * @method init - this function loads resources and sets up the component.
     * @returns {Promise<void>}
     */
    async init() {
        this.addEventListener("click", this.#clickHandler);
        await this.#refresh();
    }

    /**
     * @method disconnectedCallback - this is the main function that will be called when the component is removed from the DOM.
     * @returns {Promise<void>}
     */
    async disconnectedCallback() {
        this.removeEventListener("click", this.#clickHandler);
        this.#sortDirection = null;
        this.#clickHandler = null;
        this.#entityData = null;
    }

    /**
     * @method #click - this is the click handler for the component
     * Look for data-action attributes that will affect what is being done.
     * @param event
     */
    #click(event) {
        const target = event.composedPath()[0];
        const action = target.dataset.action;

        if (this[action] != null) {
            this[action](event);
        }
    }

    /**
     * @method refresh - this is the main function that starts the drawing process.
     * This is used both internally and externally to refresh the component.
     * This function will request via event for the initial data to be loaded if the data parameter is not defined
     *
     * @returns {Promise<void>}
     * @param {Object} data - the data to be used to draw the component if this is empty it will request it from the server
     * using a event
     */
    async #refresh() {
        this.#entityData = null;
        this.dispatchEvent(new CustomEvent("get_entities", {}));
    }


    /**
     * @method drawEntities - this will take the data and draw the entities on the screen.
     * The entity UI is by default collapsed and will expand when clicked.
     * @param data
     * @returns {Promise<void>}
     */
    async #drawEntities(data) {
        this.#entityData = data;

        const itemsContainer = this.shadowRoot.querySelector(".items");
        itemsContainer.innerHTML = "";

        const entityTemplate = this.shadowRoot.querySelector("#entity-template");

        const fragment = document.createDocumentFragment()
        for (const entity of data) {
            const clone = createEntityItem(entityTemplate, entity);
            fragment.appendChild(clone);
        }
        itemsContainer.appendChild(fragment);

        requestAnimationFrame(async () => {
            if (this.dataset.ready !== "true") {
                await crs.call("component", "notify_ready", { element: this });
            }
        })
    }

    /**
     * @method #drawEntityItems - this will take the data and draw the entity items on the screen.
     * @param target {HTMLElement} - this is the target element that will be used to draw the entity items.
     * @param data {Array} - this is the data that will be used to draw the entity items.
     * @returns {Promise<void>}
     */
    async #drawEntityItems(target, data, entityType) {
        const entityItemTemplate = this.shadowRoot.querySelector("#entity-item-template");
        const ruleItemTemplate = this.shadowRoot.querySelector("#rule-item-template");

        const fragment = document.createDocumentFragment();
        for (const entityItem of data) {
            const clone = entityItemTemplate.content.cloneNode(true);

            const li = clone.firstElementChild;

            li.dataset.entityType = entityType;
            li.dataset.id = entityItem.id;

            li.querySelector(".value").textContent = entityItem.value;
            li.querySelector(".description").textContent = entityItem.descriptor || "";
            const container = li.querySelector("ul");
            await this.#drawRules(container, entityItem.rules, ruleItemTemplate, entityType);
            fragment.appendChild(clone);
        }
        target.appendChild(fragment);
    }

    /**
     * @method #drawRules - this will take the data and draw the rules on the screen.
     * @param target {HTMLElement} - this is the target element that will be used to draw the rules.
     * @param data {Array} - this is the data that will be used to draw the rules.
     * @param ruleItemTemplate
     * @returns {Promise<void>}
     */
    async #drawRules(target, data, ruleItemTemplate, entityType) {
        data = sort(data, this.#sortDirection, "code");
        const fragment = document.createDocumentFragment();

        for (const item of data) {
            fragment.appendChild(createRuleItem(ruleItemTemplate, item, entityType));
        }
        target.appendChild(fragment);
    }

    /**
     * @method #collapse - this will collapse the entity and remove the items from the screen.
     * @param target
     * @returns {Promise<void>}
     */
    async #collapse(target) {
        target.querySelector("ul").innerHTML = "";
        target.setAttribute("aria-expanded", "false");
    }

    /**
     * @method collapseAll - this will collapse all the entities on the screen.
     * This is executed from the click event based on a data-action attribute.
     * @returns {Promise<void>}
     */
    async collapseAll(event) {
        const entities = this.shadowRoot.querySelectorAll('.entity-item');

        for (const entity of entities) {
            await this.#collapse(entity);
        }
    }

    /**
     * @method sort - this will change the sort direction so that the next time the entities are drawn they will be sorted.
     * The sorting is not done locally but on the server.
     * @param event
     * @returns {Promise<void>}
     */
    async sort(event) {
        const target = event.composedPath()[0];
        this.#sortDirection = this.#sortDirection == SORT_DIRECTION.ASCENDING ? SORT_DIRECTION.DESCENDING : SORT_DIRECTION.ASCENDING;
        target.textContent = SORT_ICONS[this.#sortDirection];
        await this.#refresh();
    }

    /**
     * @method expand - this will expand the entity and request the items from the server.
     * This is executed from the click event based on a data-action attribute.
     * @param event
     * @returns {Promise<void>}
     */
    async expand(event) {
        const target = event.composedPath()[0];
        const listItem = target.closest("li");

        if (listItem.getAttribute("aria-expanded") == "true") {
            return await this.#collapse(listItem);
        }

        listItem.setAttribute("aria-expanded", "true");

        const entityType = listItem.dataset.entityType;
        const entityIds = this.#entityData.find(item => item.entityType === entityType).entityIds;

        const args = { componentId: this.id, entityType, entityIds }
        this.dispatchEvent(new CustomEvent("get_entity_items", { detail: args }));
    }

    /**
     * @method addEntities - this will take the data and draw the entities on the screen.
     * @param data {Array} - this is the data that will be used to draw the entities.
     * @returns {Promise<void>}
     */
    async addEntities(data) {
        data = sort(data, this.#sortDirection, "entityType");
        await this.#drawEntities(data);
    }

    /**
     * @method addEntityItems - this will take the data and draw the entity items on the screen.
     * @param data {Array} - this is the data that will be used to draw the entity items.
     * @param entityId {any} - this is the id of the entity that the items belong to.
     * @returns {Promise<void>}
     */
    async addEntityItems(data, entityType) {
        data = sort(data, this.#sortDirection, "code");
        const target = this.shadowRoot.querySelector(`[data-entity-type="${entityType}"] ul`);
        await this.#drawEntityItems(target, data, entityType);
    }

    /**
     * @method onMessage - this is the main function that will be called when the component receives a message.
     * @param event
     * @returns {Promise<void>}
     */
    async onMessage(event) {
        this[event.action]?.(event.data, event.entityType);
    }
}

/**
 * @method createEntityItem - this will create the entity item and return it.
 * @param entityTemplate - this is the template that will be used to create the entity item.
 * @param entity - this is the data that will be used to populate the entity item.
 * @returns {*}
 */
function createEntityItem(entityTemplate, entity) {
    const clone = entityTemplate.content.cloneNode(true);
    const entityElement = clone.querySelector("li");
    entityElement.dataset.entityType = entity.entityType;
    entityElement.querySelector(".entity-value").textContent = entity.entityType;
    entityElement.querySelector(".entity-count").textContent = entity.entityIds.length;
    return clone;
}

/**
 * @method createRuleItem - this will create the rule item and return it.
 * @param ruleItemTemplate - this is the template that will be used to create the rule item.
 * @param item - this is the data that will be used to populate the rule item.
 * @returns {*}
 */
function createRuleItem(ruleItemTemplate, item, entityType) {
    const clone = ruleItemTemplate.content.cloneNode(true);
    const li = clone.firstElementChild;
    li.dataset.entityType = entityType;
    li.dataset.id = item.id;
    li.querySelector(".value").textContent = item.value;
    li.querySelector(".description").textContent = item.descriptor || "";
    return clone;
}

/**
 * @method sort - this will sort the data based on the direction.
 * @param data - this is the data that will be sorted.
 * @param direction - this is the direction that will be used to sort the data.
 * @returns {*}
 */
function sort(data, direction, field) {
    if (direction == SORT_DIRECTION.ASCENDING) {
        return data.sort((a, b) => a[field].localeCompare(b[field]));
    }

    return data.sort((a, b) => b[field].localeCompare(a[field]));
}

customElements.define("entity-details", EntityDetails);


// const entities = [
//     {
//         entityType: "RegularAssetTypeTaskSpares", // split this
//         entityIds: [1, 2, 3] // use this length as count (send this as part of event)
//     }
// ]
//
// const entityItemDataStructure = [ // -> dbl click send "parent: entityType" and "my: id"
//     {
//         id: 1,
//         code: "ABC",
//         description: "Hello world",
//         status: "IsActive"
//     }
// ]
// const devStatusLookupTable = {
//     "IsActive": {
//         "icon": "bla",
//         "color": "red"
//     }
// }
// empty state
// at expand use busy thing


