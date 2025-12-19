"use strict";(()=>{var t={};t.id=713,t.ids=[713],t.modules={145:t=>{t.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},1171:(t,e)=>{Object.defineProperty(e,"l",{enumerable:!0,get:function(){return function t(e,r){return r in e?e[r]:"then"in e&&"function"==typeof e.then?e.then(e=>t(e,r)):"function"==typeof e&&"default"===r?e:void 0}}})},7090:(t,e,r)=>{r.r(e),r.d(e,{config:()=>p,default:()=>c,routeModule:()=>f});var o={};r.r(o),r.d(o,{default:()=>d});var n=r(5762),a=r(2181),i=r(1171);require("dotenv/config");let s=1e3*Number(process.env.GITHUB_CACHE_TTL||60);function u(t,e){globalThis.__GH_CACHE=globalThis.__GH_CACHE||new Map,globalThis.__GH_CACHE.set(t,{value:e,ts:Date.now()})}let l=`
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          description
          url
          stargazerCount
          forkCount
          primaryLanguage { name color }
          updatedAt
        }
      }
    }
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
    repositories(first: 50, orderBy: { field: PUSHED_AT, direction: DESC }) {
      nodes {
        name url description stargazerCount forkCount pushedAt
      }
    }
    projectsV2(first: 10) { nodes { id title url } }
  }
}
`;async function d(t,e){try{let r=process.env.GITHUB_TOKEN,o=t.query?.login||t.body?.login||process.env.GITHUB_USERNAME||"octocat",n=new Date,a=t.query?.to||n.toISOString(),i=Number(t.query?.days||t.query?.daysBack||90),d=t.query?.from||new Date(n.getTime()-864e5*i).toISOString(),c=`${o}:${d}:${a}`,p=function(t){globalThis.__GH_CACHE=globalThis.__GH_CACHE||new Map;let e=globalThis.__GH_CACHE.get(t);return e?Date.now()-e.ts>s?(globalThis.__GH_CACHE.delete(t),null):e.value:null}(c);if(p)return e.status(200).json({cached:!0,...p});if(!r){let t=await fetch(`https://api.github.com/users/${o}/repos?per_page=50&sort=pushed`);if(!t.ok){let r=await t.text().catch(()=>null);return e.status(502).json({error:"Failed to fetch public repos",details:r})}let r=await t.json(),n=Array.isArray(r)?r.map(t=>({name:t.name,url:t.html_url,description:t.description,stars:t.stargazers_count,forks:t.forks_count,pushedAt:t.pushed_at})):[],a={pinned:[],contributions:[],recent:n,projects:[],totals:{totalContributions:0},warning:"MISSING_GITHUB_TOKEN"};return u(c,a),e.status(200).json({cached:!1,...a})}let f=await fetch("https://api.github.com/graphql",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`bearer ${r}`},body:JSON.stringify({query:l,variables:{login:o,from:d,to:a}})});if(!f.ok){let t=await f.text().catch(()=>null);return console.error("GitHub API non-OK response:",f.status,t),e.status(f.status).json({error:"GitHub API error",details:t})}let g=await f.json();if(!g||!g.data||!g.data.user)return e.status(502).json({error:"No user data returned",raw:g});let m=g.data.user,b=(m.pinnedItems?.nodes||[]).filter(Boolean).map(t=>({name:t?.name,description:t?.description,url:t?.url,stars:t?.stargazerCount,forks:t?.forkCount,language:t?.primaryLanguage?.name||null,languageColor:t?.primaryLanguage?.color||null,updatedAt:t?.updatedAt})),C=(m.contributionsCollection?.contributionCalendar?.weeks||[]).flatMap(t=>(t?.contributionDays||[]).map(t=>({date:t.date,count:t.contributionCount}))),_=(m.repositories?.nodes||[]).filter(Boolean).map(t=>({name:t?.name,url:t?.url,description:t?.description,stars:t?.stargazerCount,forks:t?.forkCount,pushedAt:t?.pushedAt})),h=(m.projectsV2?.nodes||[]).filter(Boolean).map(t=>({id:t?.id,title:t?.title,url:t?.url})),A={pinned:b,contributions:C,recent:_,projects:h,totals:{totalContributions:m.contributionsCollection?.contributionCalendar?.totalContributions||0}};return u(c,A),e.status(200).json({cached:!1,...A})}catch(r){console.error("Next /api/github error:",r&&(r.stack||r.message||r));let t=r?.status||500;return e.status(t).json({error:r.message||"Internal error",details:r.body||void 0})}}let c=(0,i.l)(o,"default"),p=(0,i.l)(o,"config"),f=new n.PagesAPIRouteModule({definition:{kind:a.x.PAGES_API,page:"/api/github",pathname:"/api/github",bundlePath:"",filename:""},userland:o})},2181:(t,e)=>{var r;Object.defineProperty(e,"x",{enumerable:!0,get:function(){return r}}),function(t){t.PAGES="PAGES",t.PAGES_API="PAGES_API",t.APP_PAGE="APP_PAGE",t.APP_ROUTE="APP_ROUTE"}(r||(r={}))},5762:(t,e,r)=>{t.exports=r(145)}};var e=require("../../webpack-api-runtime.js");e.C(t);var r=e(e.s=7090);module.exports=r})();