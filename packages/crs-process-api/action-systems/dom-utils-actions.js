import{callFunctionOnPath as g}from"./action-actions.js";class o{static async perform(a,t,e,r){await this[a.action]?.(a,t,e,r)}static async call_on_element(a,t,e,r){const n=await crs.dom.get_element(a.args.element,t,e,r),s=await g(n,a,t,e,r);return a.args.target!=null&&await crs.process.setValue(a.args.target,s,t,e,r),s}static async get_property(a,t,e,r){const n=await crs.dom.get_element(a,t,e,r),s=await crsbinding.utils.getValueOnPath(n,a.args.property);return a.args.target!=null&&await crs.process.setValue(a.args.target,s,t,e,r),s}static async set_properties(a,t,e,r){const n=await crs.dom.get_element(a,t,e,r),s=await crs.process.getValue(a.args.properties,t,e,r),c=Object.keys(s);for(let l of c)n[l]=await crs.process.getValue(s[l],t,e,r)}static async open_tab(a,t,e,r){let n=await crs.call("string","inflate",{template:a.args.url,parameters:a.args.parameters},t,e,r);window.open(n,"_blank")}static async get_element_bounds(a,t,e,r){const s=(await crs.dom.get_element(a.args.element,t,e,r)).getBoundingClientRect();return a.args.target!=null&&await crs.process.setValue(a.args.target,s,t,e,r),s}static async find_parent_of_type(a,t,e,r){const n=await crs.dom.get_element(a.args.element,t,e,r),s=await crs.process.getValue(a.args.stopAtNodeName,t,e,r),c=await crs.process.getValue(a.args.stopAtNodeQuery,t,e,r),l=await crs.process.getValue(a.args.nodeName,t,e,r),i=await crs.process.getValue(a.args.nodeQuery,t,e,r);if(n==null||l==null&&i==null)return;const u=await this.#a(n,l,i,s,c);return a.args.target!=null&&await crs.process.setValue(a.args.target,u,t,e,r),u}static async#a(a,t,e,r,n){const s=t!=null||r!=null?a.nodeName.toLowerCase():null;if(!(r!=null&&s===r)&&!(n!=null&&a.matches(n)))return t!=null&&s===t.toLowerCase()||e!=null&&a.matches(e)?a:await this.#a(a.parentElement,t,e,r,n)}}crs.intent.dom_utils=o;export{o as DomUtilsActions};
