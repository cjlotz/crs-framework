class d{static async perform(a,r,t,s){await this[a.action]?.(a,r,t,s)}static async inflate(a,r,t,s){if(a.args.parameters==null)return a.args.template;let l=a.args.template,n=a.args.parameters,e=await _(l,n,r,t,s);return e.indexOf("&{")!=-1&&(e=o(e)),a.args.target!=null&&await crs.process.setValue(a.args.target,e,r,t,s),e}static async translate(a,r,t,s){let n=await crs.process.getValue(a.args.template,r,t,s);return n.indexOf("&{")!=-1&&(n=o(n)),a.args.target!=null&&await crs.process.setValue(a.args.target,n,r,t,s),n}static async to_array(a,r,t,s){let n=(await crs.process.getValue(a.args.source,r,t,s)).split(a.args.pattern);return a.args.target!=null&&await crs.process.setValue(a.args.target,n,r,t,s),n}static async from_array(a,r,t,s){let l=await crs.process.getValue(a.args.source,r,t,s),n=a.args.separator||"",e=l.join(n);return a.args.target!=null&&await crs.process.setValue(a.args.target,e,r,t,s),e}static async replace(a,r,t,s){let l=await crs.process.getValue(a.args.source,r,t,s);const n=await crs.process.getValue(a.args.pattern,r,t,s),e=await crs.process.getValue(a.args.value,r,t,s);let u=l.split(n).join(e);return a.args.target!=null&&await crs.process.setValue(a.args.target,u,r,t,s),u}static async get_query_string(a,r,t,s){const l=await crs.process.getValue(a.args.source,r,t,s),n=await crs.process.getValue(a.args.complex_parameters,r,t,s);if((l||"").trim()==="")return;let e;const u=l.includes("?")?l.split("?")[1]:l,w=new URLSearchParams(u);for(const[c,g]of w)if(!((c||"").trim()===""||(g||"").trim()==="")){if((n||[]).includes(c)){const y=g.split(";");for(const V of y){const f=await this.get_query_string({args:{source:V}});f!=null&&(e=e||{},e[c]=e[c]||{},Object.assign(e[c],f))}continue}e=e||{},e[c]=g}return a.args.target!=null&&e!=null&&await crs.process.setValue(a.args.target,e,r,t,s),e}}async function _(i,a,r,t,s){i=i.split("${").join("${context."),a=await m(a,r,t,s);let l=new Function("context",["return `",i,"`;"].join("")),n=l(a);return l=null,n}async function m(i,a,r,t){const s=Object.keys(i);for(let l of s){let n=i[l];i[l]=await crs.process.getValue(n,a,r,t)}return i}async function o(i){const a=i.indexOf("&{"),r=i.indexOf("}",a+1),t=i.substring(a+2,r),s=await crsbinding.translations.get(t);return i=i.split(`&{${t}}`).join(s),i.indexOf("&{")!=-1?o(i):i}crs.intent.string=d;export{d as StringActions};
