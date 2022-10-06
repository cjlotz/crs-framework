import {beforeAll, afterAll, afterEach, beforeEach, describe, it} from "https://deno.land/std@0.157.0/testing/bdd.ts";
import { assertEquals, assertExists, assert } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import {init} from "./../../test/mockups/init.js";

await init();

beforeAll(async () => {
    await import("./../../src/data-manager.js");
})

describe("data manager tests", () => {
    let records;
    let manager;
    let changeArgs;

    beforeEach(async () => {
        records = [
            { id: "1000", code: "code 1" },
            { id: "1001", code: "code 2" }
        ];

        manager = await crs.call("data_manager", "register", {
            manager: "store",
            id_field: "id",
            type: "memory",
            records: records
        })

        await crs.call("data_manager", "on_change", {
            manager: "store",
            callback: async (args) => changeArgs = args
        });
    })

    afterEach(async () => {
        await crs.call("data_manager", "dispose", { manager: "store" });
    })

    it ("initialized", async () => {
        const manager_records = manager.getAll();

        assert(globalThis.dataManagers != null);
        assert(globalThis.dataManagers["store"] != null);
        assertEquals(manager.count, 2);
        assertEquals(manager_records, records);
    })

    it ("set_record", async () => {
        const records = [
            { id: "1002", code: "code 3" },
            { id: "1003", code: "code 4" }
        ];

        await crs.call("data_manager", "set_records", {
            manager: "store",
            records: records
        })

        const manager_records = await crs.call("data_manager", "get_all", { manager: "store" });
        assertEquals(manager_records, records);
        assertEquals(changeArgs.managerId, "store");
        assertEquals(changeArgs.action, "refresh");
        assertEquals(changeArgs.count, 2);
    })

    it ("append", async () => {
        await crs.call("data_manager", "append", {
            manager: "store",
            records: [{ id: "2000", "code":  "2000" }]
        })

        const record = manager.getByIndex(2);
        assertEquals(manager.count, 3);
        assertEquals(record.id, "2000");

        assertEquals(changeArgs.action, "add");
        assertEquals(changeArgs.records.length, 1);
        assertEquals(changeArgs.index, 2);
        assertEquals(changeArgs.count, 1);
    })

    it ("remove - by index", async () => {
        await crs.call("data_manager", "remove", {
            manager: "store",
            indexes: [1]
        })

        assertEquals(manager.count, 1);
        assertEquals(changeArgs.action, "delete");
        assertEquals(changeArgs.ids, ["1001"]);
        assertEquals(changeArgs.indexes, [1]);
    })

    it ("remove - by id", async () => {
        await crs.call("data_manager", "remove", {
            manager: "store",
            ids: ["1000"]
        })

        assertEquals(manager.count, 1);
        assertEquals(changeArgs.action, "delete");
        assertEquals(changeArgs.ids, ["1000"]);
        assertEquals(changeArgs.indexes, [0]);
    })

    it ("update - by index", async () => {
        await crs.call("data_manager", "update", {
            manager: "store",
            index: 0,
            changes: {
                code: "ABC"
            }
        })

        const record = manager.getByIndex(0);
        assertEquals(record.code, "ABC");
        assertEquals(changeArgs.action, "update");
        assertEquals(changeArgs.id, "1000");
        assertEquals(changeArgs.index, 0);
        assertEquals(changeArgs.changes.code, "ABC");
    })

    it ("update - by id", async () => {
        await crs.call("data_manager", "update", {
            manager: "store",
            id: "1000",
            changes: {
                code: "ABC"
            }
        })

        const record = manager.getByIndex(0);
        assertEquals(record.code, "ABC");
        assertEquals(record.code, "ABC");

        assertEquals(changeArgs.action, "update");
        assertEquals(changeArgs.id, "1000");
        assertEquals(changeArgs.index, 0);
        assertEquals(changeArgs.changes.code, "ABC");
    })

    it ("update_batch - indexes", async () => {
        await crs.call("data_manager", "update_batch", {
            manager: "store",
            batch: [
                {
                    index: 0,
                    changes: {
                        code: "C1"
                    }
                },
                {
                    id: "1001",
                    changes: {
                        code: "C2"
                    }
                }
            ]
        })

        assertEquals(manager.getByIndex(0).code, "C1");
        assertEquals(manager.getByIndex(1).code, "C2");
    })

    it ("get - by id and index", async () => {
        const record1 = await crs.call("data_manager", "get", { manager: "store", index: 0 });
        const record2 = await crs.call("data_manager", "get", { manager: "store", id: "1001" });

        assert(record1 != null);
        assert(record2 != null);
    })

    it ("get ids", async () => {
        const idCollection = await crs.call("data_manager", "get_ids", {
            manager: "store",
            indexes: [0, 1]
        })

        assertEquals(idCollection.length, 2);
        assertEquals(idCollection[0], "1000");
        assertEquals(idCollection[1], "1001");
    })

    it ("get_page", async () => {
        const records = [];
        for (let i = 0; i < 10; i++) {
            records.push({ id: i, code: `code ${i}` });
        }

        await crs.call("data_manager", "set_records", {
            manager: "store",
            records: records
        })

        const page = await crs.call("data_manager", "get_page", {
            manager: "store",
            from: 0,
            to: 5
        });

        assertEquals(page.length, 5);
    })

    it ("get_all", async () => {
        const records = [];
        for (let i = 0; i < 10; i++) {
            records.push({ id: i, code: `code ${i}` });
        }

        await crs.call("data_manager", "set_records", {
            manager: "store",
            records: records
        })

        const rows = await crs.call("data_manager", "get_all", { manager: "store" });
        assertEquals(rows.length, 10);
    })

    it ("add / remove change events", async () => {
        assertEquals(manager.eventCount, 1);

        const fn = () => {};
        await crs.call("data_manager", "on_change", {
            manager: "store",
            callback: fn
        })

        assertEquals(manager.eventCount, 2);

        await crs.call("data_manager", "remove_change", {
            manager: "store",
            callback: fn
        })

        assertEquals(manager.eventCount, 1);
    })
})