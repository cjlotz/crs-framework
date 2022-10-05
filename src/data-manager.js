class BaseDataManager {
    #dataField;
    #count;

    get count() {
        return this.#count;
    }

    get dataField() {
        return this.#dataField;
    }

    constructor(dataField) {
        this.#dataField = dataField;
    }

    setRecords(records) {
        this.#count = records?.length || 0;
    }

    append(count) {
        this.#count = count;
    }

    removeIndexes(count) {
        this.#count = count;
    }

    removeIds(count) {
        this.#count = count;
    }
}

class MemoryDataManager extends BaseDataManager {
    #records;

    setRecords(records) {
        this.#records = records;
        super.setRecords(records);
    }

    append(...record) {
        this.#records.push(...record);
        super.append(this.#records.length);
    }

    getAll() {
        return this.#records;
    }

    getPage(from, to) {
        return this.#records.slice(from, to);
    }

    getIndex(index) {
        return this.#records[index];
    }

    getId(id) {
        return this.#records.find(item => item[this.dataField] == id);
    }

    removeIndexes(indexes) {
        indexes.sort((a, b) => a > b ? -1 : 1);

        for (const index of indexes) {
            this.#records.splice(index, 1);
        }

        super.removeIndexes(this.#records.length);
    }

    removeIds(ids) {
        for (const id of ids) {
            const index = this.#records.findIndex(item => item[this.dataField] == id);
            this.#records.splice(index, 1);
        }

        super.removeIds(this.#records.length);
    }

    updateIndex(index, changes) {
        const record = this.#records[index];
        const keys = Object.keys(changes);
        for (const key of keys) {
            record[key] = changes[key];
        }
    }

    updateId(id, changes) {
        const record = this.#records.find(item => item[this.dataField] == id);
        const keys = Object.keys(changes);
        for (const key of keys) {
            record[key] = changes[key];
        }
    }
}

class IndexDBDataManager extends BaseDataManager {
    setRecords(records) {
        super.setRecords(records);
    }
}

const managerTypes = Object.freeze({
    "memory": MemoryDataManager,
    "indexdb": IndexDBDataManager
})

class DataManagerStore {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async register(step, context, process, item) {
        const manager = await crs.process.getValue(step.args.manager, context, process, item);
        const dataField = await crs.process.getValue(step.args.id_field || "id", context, process, item);
        const type = await crs.process.getValue(step.args.type || "indexdb", context, process, item);
        const records = await crs.process.getValue(step.args.records || [], context, process, item);

        globalThis.dataManagers ||= {};

        if (globalThis.dataManagers[manager] == null) {
            globalThis.dataManagers[manager] = new managerTypes[type](dataField);
        }

        globalThis.dataManagers[manager].setRecords(records);
        return globalThis.dataManagers[manager];
    }

    static async set_records(step, context, process, item) {
        const manager = await crs.process.getValue(step.args.manager, context, process, item);
        const records = await crs.process.getValue(step.args.records || [], context, process, item);
        globalThis.dataManagers[manager].setRecords(records);
    }

    static async append(step, context, process, item) {
        const manager = await crs.process.getValue(step.args.manager, context, process, item);
        const records = await crs.process.getValue(step.args.records || [], context, process, item);
        globalThis.dataManagers[manager].append(...records);
    }

    static async remove(step, context, process, item) {
        const manager = await crs.process.getValue(step.args.manager, context, process, item);
        const indexes = await crs.process.getValue(step.args.indexes, context, process, item);
        const ids = await crs.process.getValue(step.args.ids, context, process, item);

        if (indexes != null) {
            return globalThis.dataManagers[manager].removeIndexes(indexes);
        }

        globalThis.dataManagers[manager].removeIds(ids);
    }

    static async update(step, context, process, item) {
        const manager = await crs.process.getValue(step.args.manager, context, process, item);
        const index = await crs.process.getValue(step.args.index, context, process, item);
        const id = await crs.process.getValue(step.args.id, context, process, item);
        const changes = await crs.process.getValue(step.args.changes, context, process, item);

        if (index != null) {
            return globalThis.dataManagers[manager].updateIndex(index, changes);
        }

        return globalThis.dataManagers[manager].updateId(id, changes);
    }

    static async update_batch(step, context, process, item) {
        const manager = await crs.process.getValue(step.args.manager, context, process, item);
        const batch = await crs.process.getValue(step.args.batch, context, process, item);

        for (let item of batch) {
            if (item.index != null) {
                globalThis.dataManagers[manager].updateIndex(item.index, item.changes);
            }
            else {
                globalThis.dataManagers[manager].updateId(item.id, item.changes);
            }
        }
    }

    static async get(step, context, process, item) {
        const manager = await crs.process.getValue(step.args.manager, context, process, item);
        const index = await crs.process.getValue(step.args.index, context, process, item);
        const id = await crs.process.getValue(step.args.id, context, process, item);

        if (index != null) {
            return globalThis.dataManagers[manager].getIndex(index);
        }

        return globalThis.dataManagers[manager].getId(id);
    }

    static async get_page(step, context, process, item) {
        const manager = await crs.process.getValue(step.args.manager, context, process, item);
        const from = await crs.process.getValue(step.args.from, context, process, item);
        const to = await crs.process.getValue(step.args.to, context, process, item);

        return globalThis.dataManagers[manager].getPage(from, to);
    }

    static async get_all(step, context, process, item) {
        const manager = await crs.process.getValue(step.args.manager, context, process, item);
        return globalThis.dataManagers[manager].getAll();
    }
}

crs.intent.data_manager = DataManagerStore;