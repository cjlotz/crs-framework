/**
 * @class BaseDataManager - This is the base class used to extend data manager implementations.
 * It contains the basic functionality that all data managers should have.
 *
 * Properties:
 * - count: The number of records in the data manager
 * - idField: The name of the field that is used to identify records (primary key)
 * - eventCount: The number of events that are currently registered
 *
 * Methods:
 * - dispose: This method is called when the data manager is no longer needed. It should be used to clean up any resources that are being used.
 * - setRecords: This method is called to set the records in the data manager. It should be used to initialize the data manager.
 * - append: This method is called to add records to the data manager.
 * - removeIndexes: This method is called to remove records from the data manager by index.
 * - removeIds: This method is called to remove records from the data manager by id (based on the idField as the id).
 * - addChangeCallback: This method is called to register a callback that will be called when the data manager changes.
 * - removeChangeCallback: This method is called to remove a callback that was previously registered.
 * - notifyChanges: This method is called to notify all registered callbacks that the data manager has changed.
 *
 * Methods that should be implemented by derived classes:
 * - getAll: This method is called to get all of the records in the data manager.
 * - getPage: This method is called to get a page of records from the data manager.
 * - getByIndex: This method is called to get a record by its index.
 * - getById: This method is called to get a record by its id.
 * - getIds: This method is called to get the ids of all of the records in the data manager.
 * - updateIndex: This method is called to update a record in the data manager by index.
 * - updateId: This method is called to update a record in the data manager by id (based on the idField as the id).
 */
export class BaseDataManager {
    #id;
    #idField;
    #count = 0;
    #selectedCount = 0;
    #events = [];

    /**
     * @property count {number} - The number of records in the data manager
     * @returns {*}
     */
    get count() {
        return this.#count;
    }

    /**
     * @property count {number} - The number of records in the data manager
     * This is for internal use of the data managers only.
     * @param newValue
     */
    set count(newValue) {
        this.#count = newValue;
    }

    /**
     * @property selectedCount {number} - The number of records that are currently selected
     * @returns {number}
     */
    get selectedCount() {
        return this.#selectedCount;
    }

    set selectedCount(newValue) {
        this.#selectedCount = newValue;
    }

    /**
     * @property isAllSelected {boolean} - Indicates if all of the records in the data manager are selected
     * @returns {boolean}
     */
    get isAllSelected() {
        if (this.selectedCount === 0) return false;
        if (this.selectedCount === this.count) return true;
        return "mixed";
    }

    /**
     * @property idField {string} - The name of the field that is used to identify records (primary key)
     * @returns {*}
     */
    get idField() {
        return this.#idField;
    }

    /**
     * @property eventCount {number} - The number of events that are currently registered
     * @returns {number}
     */
    get eventCount() {
        return this.#events.length;
    }

    /**
     * @constructor
     * @param id {string} - The id of the data manager
     * @param idField {string} - The name of the field that is used to identify records (primary key)
     */
    constructor(id, idField) {
        this.#id = id;
        this.#idField = idField;
    }

    /**
     * @method dispose - This method is called when the data manager is no longer needed. It should be used to clean up any resources that are being used.
     */
    dispose() {
        this.#id = null;
        this.#idField = null;
        this.#events = null;
        this.#count = null;
        this.#selectedCount = null;
    }

    /**
     * @method setRecords - This method is called to set the records in the data manager.
     * It should be used to initialize the data manager.
     * @param records {Array} - The records to set in the data manager
     */
    setRecords(records) {
        this.#count = records?.length || 0;

        for(let i = 0; i < records.length; i++) {
            records[i]._index = i;
        }
    }

    /**
     * @method append - This method is called to append records to the data manager.
     * @param record
     */
    append(count) {
        this.#count += count;
    }

    /**
     * @method removeIndexes - This method is called to remove records from the data manager by index.
     * @param count
     */
    removeIndexes(count) {
        this.#count -= count;
    }

    /**
     * @method removeIds - This method is called to remove records from the data manager by id (based on the idField as the id).
     * @param count
     */
    removeIds(count) {
        this.#count -= count;
    }

    /**
     * @method addChangeCallback - This method is called to register a callback that will be called when the data manager changes.
     * @param callback {function} - The callback to register
     */
    addChangeCallback(callback) {
        const index = this.#events.indexOf(callback);
        if (index == -1) {
            this.#events.push(callback);
        }
    }

    /**
     * @method removeChangeCallback - This method is called to remove a callback that was previously registered.
     * @param callback {function} - The callback to remove
     */
    removeChangeCallback(callback) {
        const index = this.#events.indexOf(callback);

        if (index != -1) {
            this.#events.splice(index, 1);
        }
    }

    /**
     * @method notifyChanges - This method is called to notify all registered callbacks that the data manager has changed.
     * @param args {object} - The arguments to pass to the callback
     * @returns {Promise<void>}
     */
    async notifyChanges(args) {
        args.managerId = this.#id;
        for (let event of this.#events) {
            await event(args);
        }
    }

    /**
     * @method beginTransaction - start a transaction if the data manager supports it
     * @returns {null}
     */
    beginTransaction() {
        return null;
    }

    /**
     * @method commit - commit a transaction if the data manager supports it
     * @returns {null}
     */
    commit() {
        return null;
    }

    /**
     * @method rollback - rollback a transaction if the data manager supports it
     */
    rollback() {
        return null;
    }
}