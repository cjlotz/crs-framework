var u = class {
    constructor() {
        this._schemas = {}, crsbinding.events.emitter.on("run-process", this._runProcess.bind(this))
    }

    _runProcess(t) {
        return new Promise(async (a, e) => {
            let i = t.step.action, n = t.step.args.schema, d = this._schemas[n];
            if (d == null && crs.process.fetch != null && (d = await crs.process.fetch(t.step), this.add(d)), d == null) throw new Error(`process "${n}" not in registry and not loaded.`);
            let c = d[i];
            c.name = i, await g(c, t.parameters);
            let l = await crs.process.run(t.context, c, t.item, null, t.prefixes).catch(o => {
                let $ = c.aborted == !0 ? "crs-process-aborted" : "crs-process-error";
                crsbinding.events.emitter.emit($, {step: c.currentStep, error: o}), t.step.aborted = !0
            }), r = t.step.args?.target;
            r != null && await crs.process.setValue(r, l, t.context, t.process, t.item), a(l)
        })
    }

    add(t) {
        this._schemas[t.id] = t
    }

    remove(t) {
        delete this._schemas[t.id]
    }
};

async function g(s, t) {
    if (t != null) {
        s.parameters = s.parameters || {};
        for (let [a, e] of Object.entries(t)) s.parameters[a] = e
    }
}

var m = class {
    static run(t, a, e, i, n) {
        return new Promise(async (d, c) => {
            a = JSON.parse(JSON.stringify(a)), a.data = a.data || {}, a.context = t, a.functions = {}, a.text = i, a.expCache = {}, f(n, a), a.bindable == !0 && (crs.intent.binding == null && await crs.modules.get("binding"), await crs.intent.binding.create_context(null, t, a, null)), await crsbinding.events.emitter.emit("process-starting", a), crsbinding.idleTaskManager.add(async () => {
                let l;
                await b(t, a, e).catch(r => {
                    a.aborted = !0, c({process: a.name, step: a.currentStep, error: r})
                }), await this.runStep(a.steps.start, t, a, e).then(async () => {
                    l = a.result, await this.cleanProcess(a)
                }).then(() => d(l)).catch(r => {
                    a.aborted = !0, c({process: a.name, step: a.currentStep, error: r})
                })
            })
        })
    }

    static async runStep(t, a = null, e = null, i = null, n = null) {
        if (t == null) return;
        await y("binding_before", t, a, e, i);
        let d;
        if (t.type != null) {
            if (crs.intent[t.type] == null && await crs.modules.get(t.type), crs.intent[t.type] == null) throw new Error(`Process API module "${t.type}" not found.`);
            d = await crs.intent[t.type].perform(t, a, e, i, n)
        }
        if (t.args?.log != null) {
            let c = await this.getValue(t.args.log, a, e, i);
            console.log(c)
        }
        if (await y("binding_after", t, a, e, i), e?.aborted !== !0 && t.aborted !== !0) {
            n ||= e?.steps;
            let c = n?.[t.alt_next_step || t.next_step];
            if (e != null && (e.currentStep = t.next_step), c != null) return await this.runStep(c, a, e, i, n)
        }
        return d
    }

    static async getValue(t, a = null, e = null, i = null) {
        if (typeof t != "string" || t.indexOf("${") == 0 || t.indexOf("$template") != -1) return t;
        if (t == "$context") return a;
        if (t == "$process") return e;
        if (t == "$item") return i;
        if (t.indexOf("$") == -1) return t;
        if (t.indexOf("$") > -1) {
            let c = t.split(".")[0];
            if (crs.process.reservedWords[c] == null && e?.prefixes[c] == null) return t
        }
        if (t.indexOf("$binding") != -1) return crsbinding.data.getValue(e.parameters.bId, t.replace("$binding.", ""));
        if (t.indexOf("$fn") != -1 && (t = t.split("$fn").join("")), t = e?.expCache == null ? t : w(t, e), t.indexOf("rgb(") != -1) return t;
        let n = e?.functions?.[t];
        if (n == null) {
            let d = t.split("$").join("");
            n = new Function("context", "process", "item", `return ${d};`), e != null && e.functions != null && (e.functions[t] = n)
        }
        return n(a, e, i)
    }

    static async setValue(t, a, e, i, n) {
        let d;
        if (t = i?.expCache == null ? t : w(t, i), t.indexOf("$binding") != -1) {
            let l = i.parameters?.bId, r = t.split(".")[1];
            return crsbinding.data.setProperty(l, r, a)
        }
        t.indexOf("$item") != -1 ? (d = n, t = t.replace("$item.", "")) : t.indexOf("$process") != -1 ? (d = i, t = t.replace("$process.", "")) : (d = e, t = t.replace("$context.", ""));
        let c = d;
        if (t.indexOf(".") == -1) c[t] = await this.getValue(a, e, i, n); else {
            let l = t.split(".");
            for (let r = 0; r < l.length - 1; r++) {
                let o = l[r];
                c = c[o] = c[o] || {}
            }
            a = await this.getValue(a, e, i, n), c[l[l.length - 1]] = a
        }
    }

    static async cleanProcess(t) {
        t.bindable == !0 && crsbinding.data.removeObject(t.parameters.bId), await this.cleanObject(t.data), await this.cleanObject(t.functions), delete t.context, delete t.functions, delete t.parameters, delete t.result, delete t.data, delete t.steps, delete t.text, delete t.prefixes, delete t.expCache, await crsbinding.events.emitter.emit("process-ended", t)
    }

    static async cleanObject(t) {
        if (t == null) return;
        let a = Object.keys(t);
        for (let e of a) delete t[e];
        return null
    }
};

async function y(s, t, a, e, i) {
    crs.intent.binding == null && await crs.modules.get("binding");
    let n = t[s];
    if (n == null || e.parameters?.bId == null) return;
    let d = Object.keys(n);
    for (let c of d) await crs.intent.binding.set_property({args: {property: c, value: n[c]}}, a, e, i)
}

async function b(s, t, a) {
    if (t.parameters_def == null) return;
    t.parameters = t.parameters || {};
    let e = !0;
    for (let [i, n] of Object.entries(t.parameters_def)) if (n.required === !0 && (t.parameters[i] == null && n.default != null && (t.parameters[i] = await crs.process.getValue(n.default, s, t, a)), e = t.parameters[i] != null), e === !1) throw t.aborted = !0, t.currentStep = "validate process parameters", new Error(`required parameter "${i}" not set or is null`)
}

function f(s, t) {
    t.prefixes = t.prefixes || {}, s != null && Object.assign(t.prefixes, s), t.prefixes.$text = "$process.text", t.prefixes.$data = "$process.data", t.prefixes.$parameters = "$process.parameters", t.prefixes.$bId = "$process.parameters.bId", t.prefixes.$global = "globalThis", t.prefixes.$translation = 'crsbinding.translations.get("$0")'
}

function w(s, t) {
    if (t == null) return s;
    if (t.expCache[s] != null) return t.expCache[s];
    let a = s, e = s.split("."), i = e[0];
    if (t?.prefixes[i] == null) return s;
    e.splice(0, 1);
    let n = t.prefixes[i];
    if (n.indexOf("$0") != -1) {
        let d = e.join(".");
        s = n.replace("$0", d)
    } else s = s.split(i).join(n);
    return t.expCache[a] = s, s
}

async function v(s) {
    await crs.modules.add("action", `${s}/action-systems/action-actions.js`), await crs.modules.add("array", `${s}/action-systems/array-actions.js`), await crs.modules.add("binding", `${s}/action-systems/binding-actions.js`), await crs.modules.add("colors", `${s}/action-systems/colors-actions.js`), await crs.modules.add("compile", `${s}/action-systems/compile-actions.js`), await crs.modules.add("component", `${s}/action-systems/component-actions.js`), await crs.modules.add("condition", `${s}/action-systems/condition-actions.js`), await crs.modules.add("contingent", `${s}/action-systems/contingent-actions`), await crs.modules.add("console", `${s}/action-systems/console-actions.js`), await crs.modules.add("cssgrid", `${s}/action-systems/css-grid-actions.js`), await crs.modules.add("data", `${s}/action-systems/data-actions.js`), await crs.modules.add("data_processing", `${s}/action-systems/data-processing-actions.js`), await crs.modules.add("date", `${s}/action-systems/date-actions.js`), await crs.modules.add("debug", `${s}/action-systems/debug-actions.js`), await crs.modules.add("dom", `${s}/action-systems/dom-actions.js`), await crs.modules.add("dom_binding", `${s}/action-systems/dom-binding-actions.js`), await crs.modules.add("dom_collection", `${s}/action-systems/dom-collection-actions.js`), await crs.modules.add("dom_interactive", `${s}/action-systems/dom-interactive-actions.js`), await crs.modules.add("dom_observer", `${s}/action-systems/dom-observer-actions.js`), await crs.modules.add("dom_utils", `${s}/action-systems/dom-utils-actions.js`), await crs.modules.add("dom_widget", `${s}/action-systems/dom-widgets-actions.js`), await crs.modules.add("events", `${s}/action-systems/events-actions.js`), await crs.modules.add("files", `${s}/action-systems/files-actions.js`), await crs.modules.add("fs", `${s}/action-systems/fs-actions.js`), await crs.modules.add("fixed_layout", `${s}/action-systems/fixed-layout-actions.js`), await crs.modules.add("fixed_position", `${s}/action-systems/fixed-position-actions.js`), await crs.modules.add("fs", `${s}/action-systems/fs-actions.js`), await crs.modules.add("html", `${s}/action-systems/html-actions.js`), await crs.modules.add("local_storage", `${s}/action-systems/local-storage-actions.js`), await crs.modules.add("loop", `${s}/action-systems/loop-actions.js`), await crs.modules.add("markdown", `${s}/action-systems/markdown-actions.js`), await crs.modules.add("math", `${s}/action-systems/math-actions.js`), await crs.modules.add("media", `${s}/action-systems/media-actions.js`), await crs.modules.add("module", `${s}/action-systems/module-actions.js`), await crs.modules.add("no_content", `${s}/action-systems/no-content-actions.js`), await crs.modules.add("object", `${s}/action-systems/object-actions.js`), await crs.modules.add("process", `${s}/action-systems/process-actions.js`), await crs.modules.add("random", `${s}/action-systems/random-actions.js`), await crs.modules.add("rest_services", `${s}/action-systems/rest-services-actions.js`), await crs.modules.add("route", `${s}/action-systems/route-actions.js`), await crs.modules.add("schema", `${s}/action-systems/schema-actions.js`), await crs.modules.add("scripts", `${s}/action-systems/scripts-actions.js`), await crs.modules.add("session_storage", `${s}/action-systems/session-storage-actions.js`), await crs.modules.add("string", `${s}/action-systems/string-actions.js`), await crs.modules.add("styles", `${s}/action-systems/styles-actions.js`), await crs.modules.add("system", `${s}/action-systems/system-actions.js`), await crs.modules.add("switch", `${s}/action-systems/switch-actions.js`), await crs.modules.add("translations", `${s}/action-systems/translations-actions.js`), await crs.modules.add("validate", `${s}/action-systems/validate-actions.js`), crs.dom = (await crs.modules.get("dom")).DomActions, globalThis.isMobile = await crs.call("system", "is_mobile")
}

globalThis.crs = globalThis.crs || {};
globalThis.crs.intent = {};
globalThis.crs.processSchemaRegistry = new u;
globalThis.crs.process = m;
globalThis.crs.AsyncFunction = Object.getPrototypeOf(async function () {
}).constructor;
globalThis.crs.call = async (s, t, a, e, i, n, d = null) => {
    crs.intent[s] == null && await crs.modules.get(s), i == null && (i = {expCache: {}, functions: {}}, f(d, i));
    let c = crs.intent[s];
    return c[t] == null ? await c.perform({action: t, args: a}, e, i, n) : await c[t]({args: a}, e, i, n)
};
globalThis.crs.getNextStep = (s, t, a) => (a ||= s?.steps, typeof t == "object" ? t : crsbinding.utils.getValueOnPath(a, t));
globalThis.crs.process.reservedWords ||= {$context: !0, $process: !0, $item: !0, $fn: !0, $binding: !0};
crsbinding.events.emitter.on("crs-process-error", s => {
    console.error(s.error)
});
export {v as initialize};
