import{callFunctionOnPath as g}from"./action-actions.js";class o{static async perform(a,t,e,r){await this[a.action]?.(a,t,e,r)}static async call_on_element(a,t,e,r){const s=await crs.dom.get_element(a.args.element,t,e,r),n=await g(s,a,t,e,r);return a.args.target!=null&&await crs.process.setValue(a.args.target,n,t,e,r),n}static async get_property(a,t,e,r){const s=await crs.dom.get_element(a,t,e,r),n=await crsbinding.utils.getValueOnPath(s,a.args.property);return a.args.target!=null&&await crs.process.setValue(a.args.target,n,t,e,r),n}static async set_properties(a,t,e,r){const s=await crs.dom.get_element(a,t,e,r),n=await crs.process.getValue(a.args.properties,t,e,r),i=Object.keys(n);for(let l of i)s[l]=await crs.process.getValue(n[l],t,e,r)}static async open_tab(a,t,e,r){let s=await crs.call("string","inflate",{template:a.args.url,parameters:a.args.parameters},t,e,r);window.open(s,"_blank")}static async get_element_bounds(a,t,e,r){const n=(await crs.dom.get_element(a.args.element,t,e,r)).getBoundingClientRect();return a.args.target!=null&&await crs.process.setValue(a.args.target,n,t,e,r),n}static async find_parent_of_type(a,t,e,r){const s=await crs.dom.get_element(a.args.element,t,e,r),n=await crs.process.getValue(a.args.stopAtNodeName,t,e,r),i=await crs.process.getValue(a.args.stopAtNodeQuery,t,e,r),l=await crs.process.getValue(a.args.nodeName,t,e,r),c=await crs.process.getValue(a.args.nodeQuery,t,e,r);if(s==null||l==null&&c==null)return;const u=await this.#a(s,l,c,n,i);return a.args.target!=null&&await crs.process.setValue(a.args.target,u,t,e,r),u}static async#a(a,t,e,r,s){const n=t!=null||r!=null?a.nodeName.toLowerCase():null;if(!(r!=null&&n===r)&&!(s!=null&&a.matches(s))){if(t!=null&&n===t.toLowerCase()||e!=null&&a.matches(e))return a;if(a.parentElement!=null)return await this.#a(a.parentElement,t,e,r,s)}}}crs.intent.dom_utils=o;export{o as DomUtilsActions};
