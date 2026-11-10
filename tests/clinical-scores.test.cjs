const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ctx = {};
vm.runInNewContext(fs.readFileSync("clinical-canvas/score-engine.js","utf8"),ctx);
const S = ctx.ClinicalScores;
const news = {
  population:"adult",rr:16,spo2:98,scale:1,oxygen:false,sbp:120,hr:70,
  temp:37,consciousness:"A",confirmScale2:false,
};
const pews = {ageNorms:true,behaviour:0,respiratory:0,cardiovascular:0,bronchodilators:false,postopVomiting:false};
const score = (input,label) => S.news2({...news,...input}).parts.find(p=>p.label===label)?.score;
test("GCS: extrema and all 120 component combinations",()=>{
  for(let e=1;e<=4;e++)for(let v=1;v<=5;v++)for(let m=1;m<=6;m++){
    const r=S.gcs({population:"adult",e,v,m});
    assert.equal(r.ok,true);assert.equal(r.total,e+v+m);
  }
  assert.equal(S.gcs({population:"adult",e:4,v:5,m:6}).total,15);
  assert.equal(S.gcs({population:"adult",e:1,v:1,m:1}).total,3);
});
test("GCS: every NT location suppresses the total; incomplete/invalid is not a score",()=>{
  for(const k of ["e","v","m"]){
    const r=S.gcs({population:"adult",e:4,v:5,m:6,[k]:"NT"});
    assert.equal(r.ok,true);assert.equal(r.total,null);assert.match(r.summary,/NT/);
  }
  assert.equal(S.gcs({population:"adult",e:null,v:5,m:6}).ok,false);
  assert.equal(S.gcs({population:"adult",e:0,v:5,m:6}).ok,false);
  assert.equal(S.gcs({population:"invalid",e:4,v:5,m:6}).ok,false);
  assert.equal(S.gcs({population:"childOver5",e:4,v:5,m:6}).total,15);
});
test("pGCS (young <=5 years): evaluates all 120 pediatric combinations and NT handling",()=>{
  for(let e=1;e<=4;e++)for(let v=1;v<=5;v++)for(let m=1;m<=6;m++){
    const r=S.gcs({population:"young",e,v,m});
    assert.equal(r.ok,true);
    assert.equal(r.isPediatric,true);
    assert.equal(r.total,e+v+m);
    assert.match(r.summary,/pGCS pediatryczna/);
  }
  const nt=S.gcs({population:"young",e:4,v:"NT",m:6});
  assert.equal(nt.ok,true);
  assert.equal(nt.total,null);
  assert.match(nt.summary,/NT/);
  assert.equal(S.gcs({population:"young",e:4,v:6,m:6}).ok,false);
});
test("NEWS2: respiratory boundaries",()=>{
  for(const [rr,p] of [[0,3],[8,3],[9,1],[11,1],[12,0],[20,0],[21,2],[24,2],[25,3]])
    assert.equal(score({rr},"Oddechy"),p,`RR=${rr}`);
});
test("NEWS2: SpO2 scale 1 boundaries",()=>{
  for(const [spo2,p] of [[0,3],[91,3],[92,2],[93,2],[94,1],[95,1],[96,0],[100,0]])
    assert.equal(score({spo2},"SpO₂ · skala 1"),p,`SpO2=${spo2}`);
});
test("NEWS2: scale 2 on room air and oxygen, including independent oxygen points",()=>{
  for(const oxygen of [false,true]){
    for(const [spo2,air,o2] of [[83,3,3],[84,2,2],[85,2,2],[86,1,1],[87,1,1],[88,0,0],[92,0,0],[93,0,1],[94,0,1],[95,0,2],[96,0,2],[97,0,3],[100,0,3]]){
      const r=S.news2({...news,scale:2,confirmScale2:true,oxygen,spo2});
      assert.equal(r.parts[1].score,oxygen?o2:air,`SpO2=${spo2}, oxygen=${oxygen}`);
      assert.equal(r.parts[2].score,oxygen?2:0);
    }
  }
  assert.equal(S.news2({...news,scale:2}).ok,false);
  assert.equal(S.news2({...news,scale:2,spo2:97,oxygen:true,confirmScale2:true}).total,5);
  assert.equal(S.news2({...news,scale:2,spo2:97,oxygen:false,confirmScale2:true}).total,0);
});
test("NEWS2: SBP boundaries",()=>{
  for(const [sbp,p] of [[0,3],[90,3],[91,2],[100,2],[101,1],[110,1],[111,0],[219,0],[220,3],[300,3]])
    assert.equal(score({sbp},"Ciśnienie skurczowe"),p,`SBP=${sbp}`);
});
test("NEWS2: pulse boundaries",()=>{
  for(const [hr,p] of [[0,3],[40,3],[41,1],[50,1],[51,0],[90,0],[91,1],[110,1],[111,2],[130,2],[131,3]])
    assert.equal(score({hr},"Tętno"),p,`HR=${hr}`);
});
test("NEWS2: temperature boundaries",()=>{
  for(const [temp,p] of [[25,3],[35,3],[35.1,1],[36,1],[36.1,0],[38,0],[38.1,1],[39,1],[39.1,2],[45,2]])
    assert.equal(score({temp},"Temperatura"),p,`Temp=${temp}`);
});
test("NEWS2: ACVPU",()=>{
  for(const v of ["A","C","V","P","U"])
    assert.equal(score({consciousness:v},"ACVPU"),v==="A"?0:3);
});
test("NEWS2: trigger priorities 0, 1-4, single 3, 5-6, >=7",()=>{
  assert.equal(S.news2(news).total,0);
  const low=S.news2({...news,hr:91});assert.equal(low.total,1);assert.match(low.headline,/1–4/);
  const single=S.news2({...news,consciousness:"C"});assert.equal(single.total,3);assert.match(single.headline,/Pojedyncza/);
  assert.match(S.news2({...news,consciousness:"C",hr:91}).headline,/Pojedyncza/);
  const five=S.news2({...news,consciousness:"C",rr:21});assert.equal(five.total,5);assert.match(five.headline,/5–6/);
  const six=S.news2({...news,consciousness:"C",rr:25});assert.equal(six.total,6);assert.match(six.headline,/5–6/);
  const seven=S.news2({...news,consciousness:"C",rr:25,hr:91});assert.equal(seven.total,7);assert.equal(seven.kind,"high");
});
test("NEWS2: missing, invalid, precision and excluded populations never give a sum",()=>{
  for(const key of ["rr","spo2","sbp","hr","temp","oxygen","consciousness"]){
    const r=S.news2({...news,[key]:null});assert.equal(r.ok,false);assert.equal(r.total,null);
  }
  for(const population of ["child","pregnant",""]) assert.equal(S.news2({...news,population}).ok,false);
  for(const bad of [{spo2:101},{rr:-1},{hr:Infinity},{temp:35.05},{rr:12.2},{spo2:"98"},{scale:0},{oxygen:0}]){
    assert.equal(S.news2({...news,...bad}).ok,false);
  }
});
test("Brighton PEWS: 64 domain combinations x 4 modifier combinations",()=>{
  for(let behaviour=0;behaviour<4;behaviour++)for(let respiratory=0;respiratory<4;respiratory++)for(let cardiovascular=0;cardiovascular<4;cardiovascular++)
    for(const bronchodilators of [false,true])for(const postopVomiting of [false,true]){
      const r=S.pews({...pews,behaviour,respiratory,cardiovascular,bronchodilators,postopVomiting});
      assert.equal(r.ok,true);
      assert.equal(r.total,behaviour+respiratory+cardiovascular+(bronchodilators?2:0)+(postopVomiting?2:0));
    }
  assert.equal(S.pews(pews).total,0);
  assert.equal(S.pews({...pews,behaviour:3,respiratory:3,cardiovascular:3,bronchodilators:true,postopVomiting:true}).total,13);
});
test("Brighton PEWS: unknown domains/modifiers and unconfirmed age norms block scoring",()=>{
  for(const key of ["behaviour","respiratory","cardiovascular","bronchodilators","postopVomiting"])
    assert.equal(S.pews({...pews,[key]:null}).ok,false);
  assert.equal(S.pews({...pews,ageNorms:false}).ok,false);
  assert.equal(S.pews({...pews,respiratory:4}).ok,false);
  assert.equal(S.pews({...pews,cardiovascular:1.5}).ok,false);
});
test("CURB-65: all 32 combinations of criteria evaluate correctly",()=>{
  const base = {population:"adult",variant:"curb65",confusion:false,urea:5.0,rr:20,sbp:120,dbp:80,age:50};
  for(const c of [false,true])
    for(const u of [5.0,8.0])
      for(const r of [20,32])
        for(const b of [[120,80],[85,55]])
          for(const a of [50,70]){
            const expected = (c?1:0)+(u>7?1:0)+(r>=30?1:0)+((b[0]<90||b[1]<=60)?1:0)+(a>=65?1:0);
            const res = S.curb65({...base,confusion:c,urea:u,rr:r,sbp:b[0],dbp:b[1],age:a});
            assert.equal(res.ok, true);
            assert.equal(res.total, expected);
            assert.equal(res.max, 5);
          }
});
test("CURB-65: exact boundary transitions for urea, RR, SBP, DBP, and age",()=>{
  const base = {population:"adult",variant:"curb65",confusion:false,urea:5.0,rr:20,sbp:120,dbp:80,age:50};
  assert.equal(S.curb65({...base,urea:7.0}).total, 0);
  assert.equal(S.curb65({...base,urea:7.1}).total, 1);
  assert.equal(S.curb65({...base,rr:29}).total, 0);
  assert.equal(S.curb65({...base,rr:30}).total, 1);
  assert.equal(S.curb65({...base,sbp:90,dbp:61}).total, 0);
  assert.equal(S.curb65({...base,sbp:89,dbp:61}).total, 1);
  assert.equal(S.curb65({...base,sbp:90,dbp:60}).total, 1);
  assert.equal(S.curb65({...base,sbp:85,dbp:55}).total, 1);
  assert.equal(S.curb65({...base,age:64}).total, 0);
  assert.equal(S.curb65({...base,age:65}).total, 1);
});
test("CURB-65 / CRB-65: risk tiers and CRB-65 variant without urea",()=>{
  const base = {population:"adult",confusion:false,urea:5.0,rr:20,sbp:120,dbp:80,age:50};
  // CURB-65 tiers
  assert.equal(S.curb65({...base,variant:"curb65"}).kind, "neutral");
  assert.equal(S.curb65({...base,variant:"curb65",age:70}).kind, "neutral");
  assert.equal(S.curb65({...base,variant:"curb65",age:70,rr:30}).kind, "warning");
  assert.equal(S.curb65({...base,variant:"curb65",age:70,rr:30,urea:8.0}).kind, "high");
  // CRB-65 variant: urea is not required
  const crb0 = S.curb65({population:"adult",variant:"crb65",confusion:false,rr:20,sbp:120,dbp:80,age:50});
  assert.equal(crb0.ok, true);
  assert.equal(crb0.total, 0);
  assert.equal(crb0.max, 4);
  assert.equal(crb0.kind, "neutral");
  assert.equal(S.curb65({population:"adult",variant:"crb65",confusion:true,rr:20,sbp:120,dbp:80,age:50}).kind, "warning");
  assert.equal(S.curb65({population:"adult",variant:"crb65",confusion:true,rr:30,sbp:85,dbp:55,age:50}).kind, "high");
});
test("CURB-65: validation errors for missing/invalid fields and non-adults",()=>{
  const base = {population:"adult",variant:"curb65",confusion:false,urea:5.0,rr:20,sbp:120,dbp:80,age:50};
  assert.equal(S.curb65({...base,population:"child"}).ok, false);
  assert.equal(S.curb65({...base,confusion:null}).ok, false);
  assert.equal(S.curb65({...base,urea:-1}).ok, false);
  assert.equal(S.curb65({...base,rr:120}).ok, false);
  assert.equal(S.curb65({...base,age:15}).ok, false);
  assert.equal(S.curb65({...base,sbp:-10}).ok, false);
  assert.equal(S.curb65({...base,variant:"invalid"}).ok, false);
});
test("CURB-65: BUN in mg/dL cutoff >19, boundaries and units",()=>{
  const base = {population:"adult",variant:"curb65",ureaUnit:"mgdl",confusion:false,rr:20,sbp:120,dbp:80,age:50};
  assert.equal(S.curb65({...base,urea:19}).total, 0);
  assert.equal(S.curb65({...base,urea:19.1}).total, 1);
  assert.equal(S.curb65({...base,urea:25}).total, 1);
  assert.match(S.curb65({...base,urea:25}).parts[1].value, /mg\/dl/);
  assert.equal(S.curb65({...base,urea:0}).ok, false);
  assert.equal(S.curb65({...base,urea:301}).ok, false);
  assert.equal(S.curb65({...base,ureaUnit:"invalid"}).ok, false);
});
test("qSOFA: all 8 combinations of criteria evaluate correctly",()=>{
  for(const r of [20, 24])
    for(const s of [110, 95])
      for(const m of [false, true]){
        const expected = (r>=22?1:0) + (s<=100?1:0) + (m?1:0);
        const res = S.qsofa({population:"adult",rr:r,sbp:s,alteredMentation:m});
        assert.equal(res.ok, true);
        assert.equal(res.total, expected);
        assert.equal(res.max, 3);
        assert.equal(res.kind, expected >= 2 ? "high" : "neutral");
      }
});
test("qSOFA: exact boundary values for RR (21 vs 22), SBP (101 vs 100), and mental status",()=>{
  const base = {population:"adult",rr:20,sbp:120,alteredMentation:false};
  assert.equal(S.qsofa({...base,rr:21}).total, 0);
  assert.equal(S.qsofa({...base,rr:22}).total, 1);
  assert.equal(S.qsofa({...base,sbp:101}).total, 0);
  assert.equal(S.qsofa({...base,sbp:100}).total, 1);
  assert.equal(S.qsofa({...base,sbp:99}).total, 1);
  assert.equal(S.qsofa({...base,alteredMentation:true}).total, 1);
  assert.equal(S.qsofa({...base,rr:22,sbp:100}).total, 2);
  assert.equal(S.qsofa({...base,rr:22,sbp:100,alteredMentation:true}).total, 3);
});
test("qSOFA: validation errors for missing/invalid fields and non-adults",()=>{
  assert.equal(S.qsofa({population:"child",rr:20,sbp:120,alteredMentation:false}).ok, false);
  assert.equal(S.qsofa({population:"adult",rr:-1,sbp:120,alteredMentation:false}).ok, false);
  assert.equal(S.qsofa({population:"adult",rr:20,sbp:350,alteredMentation:false}).ok, false);
  assert.equal(S.qsofa({population:"adult",rr:20,sbp:120,alteredMentation:null}).ok, false);
});
test("Wells PE: extrema (0 to 12.5), all component weights and two-tier threshold",()=>{
  const zero = {
    population: "adult", hr: 80,
    dvtSigns: false, peMostLikely: false, immobilizationOrSurgery: false,
    previousVte: false, hemoptysis: false, malignancy: false,
  };
  const r0 = S.wellsPe(zero);
  assert.equal(r0.ok, true);
  assert.equal(r0.total, 0);
  assert.equal(r0.likely, false);
  assert.equal(r0.kind, "neutral");
  assert.match(r0.action, /D-dimer/);

  const full = {
    population: "adult", hr: 110,
    dvtSigns: true, peMostLikely: true, immobilizationOrSurgery: true,
    previousVte: true, hemoptysis: true, malignancy: true,
  };
  const rFull = S.wellsPe(full);
  assert.equal(rFull.ok, true);
  assert.equal(rFull.total, 12.5);
  assert.equal(rFull.likely, true);
  assert.equal(rFull.kind, "high");
  assert.match(rFull.action, /angio-TK/);

  // Individual point values
  assert.equal(S.wellsPe({...zero, dvtSigns: true}).total, 3.0);
  assert.equal(S.wellsPe({...zero, peMostLikely: true}).total, 3.0);
  assert.equal(S.wellsPe({...zero, hr: 105}).total, 1.5);
  assert.equal(S.wellsPe({...zero, immobilizationOrSurgery: true}).total, 1.5);
  assert.equal(S.wellsPe({...zero, previousVte: true}).total, 1.5);
  assert.equal(S.wellsPe({...zero, hemoptysis: true}).total, 1.0);
  assert.equal(S.wellsPe({...zero, malignancy: true}).total, 1.0);

  // Exact 4.0 vs 4.5 boundary (Two-tier cut-off <= 4 PE unlikely, > 4 PE likely)
  const score4 = S.wellsPe({...zero, dvtSigns: true, hemoptysis: true}); // 3.0 + 1.0 = 4.0
  assert.equal(score4.total, 4.0);
  assert.equal(score4.likely, false);
  assert.equal(score4.kind, "neutral");

  const score45 = S.wellsPe({...zero, dvtSigns: true, hr: 105}); // 3.0 + 1.5 = 4.5
  assert.equal(score45.total, 4.5);
  assert.equal(score45.likely, true);
  assert.equal(score45.kind, "high");
});
test("Wells PE: heart rate boundary and input validation",()=>{
  const zero = {
    population: "adult", hr: 80,
    dvtSigns: false, peMostLikely: false, immobilizationOrSurgery: false,
    previousVte: false, hemoptysis: false, malignancy: false,
  };
  assert.equal(S.wellsPe({...zero, hr: 100}).total, 0);
  assert.equal(S.wellsPe({...zero, hr: 101}).total, 1.5);

  assert.equal(S.wellsPe({...zero, population: "child"}).ok, false);
  assert.equal(S.wellsPe({...zero, hr: -5}).ok, false);
  assert.equal(S.wellsPe({...zero, hr: 360}).ok, false);
  assert.equal(S.wellsPe({...zero, dvtSigns: null}).ok, false);
});
test("PERC: 0/8 rule-out, all 8 criteria boundaries, and mandatory lowPretestConfirmed",()=>{
  const base = {
    population: "adult", lowPretestConfirmed: true,
    age: 35, hr: 80, spo2: 98,
    unilateralLegSwelling: false, hemoptysis: false,
    recentTraumaOrSurgery: false, previousVte: false, hormoneUse: false,
  };
  const r0 = S.perc(base);
  assert.equal(r0.ok, true);
  assert.equal(r0.total, 0);
  assert.equal(r0.ruledOut, true);
  assert.equal(r0.kind, "neutral");

  // Require lowPretestConfirmed
  assert.equal(S.perc({...base, lowPretestConfirmed: false}).ok, false);
  assert.equal(S.perc({...base, population: "child"}).ok, false);

  // Boundaries: age 49 vs 50, hr 99 vs 100, spo2 95 vs 94
  assert.equal(S.perc({...base, age: 49}).total, 0);
  assert.equal(S.perc({...base, age: 50}).total, 1);
  assert.equal(S.perc({...base, hr: 99}).total, 0);
  assert.equal(S.perc({...base, hr: 100}).total, 1);
  assert.equal(S.perc({...base, spo2: 95}).total, 0);
  assert.equal(S.perc({...base, spo2: 94}).total, 1);

  for (const k of ["unilateralLegSwelling","hemoptysis","recentTraumaOrSurgery","previousVte","hormoneUse"]) {
    const r1 = S.perc({...base, [k]: true});
    assert.equal(r1.total, 1);
    assert.equal(r1.ruledOut, false);
    assert.equal(r1.kind, "warning");
  }

  const r8 = S.perc({
    population: "adult", lowPretestConfirmed: true,
    age: 65, hr: 110, spo2: 91,
    unilateralLegSwelling: true, hemoptysis: true,
    recentTraumaOrSurgery: true, previousVte: true, hormoneUse: true,
  });
  assert.equal(r8.total, 8);
  assert.equal(r8.ruledOut, false);
});
test("Glasgow-Blatchford (GBS): sex-specific Hb, urea mmol/mgdl, SBP/HR cutoffs and NICE=0 threshold",()=>{
  const base = {
    population: "adult", sex: "male", ureaUnit: "mmol",
    urea: 5.0, hb: 14.0, sbp: 120, hr: 80,
    melena: false, syncope: false, hepaticDisease: false, cardiacFailure: false,
  };
  const r0 = S.gbs(base);
  assert.equal(r0.ok, true);
  assert.equal(r0.total, 0);
  assert.equal(r0.kind, "neutral");
  assert.match(r0.headline, /GBS = 0/);

  // Urea boundaries (mmol/l): <6.5:0, 6.5-7.9:2, 8.0-9.9:3, 10.0-24.9:4, >=25.0:6
  assert.equal(S.gbs({...base, urea: 6.4}).total, 0);
  assert.equal(S.gbs({...base, urea: 6.5}).total, 2);
  assert.equal(S.gbs({...base, urea: 8.0}).total, 3);
  assert.equal(S.gbs({...base, urea: 10.0}).total, 4);
  assert.equal(S.gbs({...base, urea: 25.0}).total, 6);

  // Sex-specific Hb boundaries
  assert.equal(S.gbs({...base, sex: "male", hb: 13.0}).total, 0);
  assert.equal(S.gbs({...base, sex: "male", hb: 12.5}).total, 1);
  assert.equal(S.gbs({...base, sex: "male", hb: 11.5}).total, 3);
  assert.equal(S.gbs({...base, sex: "male", hb: 9.9}).total, 6);
  assert.equal(S.gbs({...base, sex: "female", hb: 12.5}).total, 0);
  assert.equal(S.gbs({...base, sex: "female", hb: 11.5}).total, 1);
  assert.equal(S.gbs({...base, sex: "female", hb: 9.9}).total, 6);

  // SBP boundaries: >=110:0, 100-109:1, 90-99:2, <90:3
  assert.equal(S.gbs({...base, sbp: 110}).total, 0);
  assert.equal(S.gbs({...base, sbp: 105}).total, 1);
  assert.equal(S.gbs({...base, sbp: 95}).total, 2);
  assert.equal(S.gbs({...base, sbp: 89}).total, 3);

  // Maximum score = 23
  const rMax = S.gbs({
    population: "adult", sex: "male", ureaUnit: "mmol",
    urea: 30, hb: 8.0, sbp: 80, hr: 115,
    melena: true, syncope: true, hepaticDisease: true, cardiacFailure: true,
  });
  assert.equal(rMax.total, 23);
  assert.equal(rMax.kind, "high");
  assert.equal(S.gbs({...base, population: "child"}).ok, false);
});
test("Alvarado & PAS: temperature thresholds (37.3 vs 38.0), weights and risk tiers",()=>{
  const base = {
    variant: "alvarado", temp: 36.8,
    rlqTenderness: false, leukocytosis: false, migration: false,
    anorexia: false, nauseaVomiting: false, reboundOrHopping: false, leftShift: false,
  };
  assert.equal(S.alvarado(base).total, 0);
  assert.equal(S.alvarado({...base, temp: 37.2}).total, 0);
  assert.equal(S.alvarado({...base, temp: 37.3}).total, 1);
  assert.equal(S.alvarado({...base, variant: "pas", temp: 37.9}).total, 0);
  assert.equal(S.alvarado({...base, variant: "pas", temp: 38.0}).total, 1);

  const full = {
    variant: "pas", temp: 38.5,
    rlqTenderness: true, leukocytosis: true, migration: true,
    anorexia: true, nauseaVomiting: true, reboundOrHopping: true, leftShift: true,
  };
  const rFull = S.alvarado(full);
  assert.equal(rFull.total, 10);
  assert.equal(rFull.isPediatric, true);
  assert.equal(rFull.kind, "high");
});
test("HEART Score: age brackets, 0-10 sum, and critical flag override on positive troponin/ECG",()=>{
  const base = { population: "adult", history: 0, ecg: 0, age: 40, riskFactors: 0, troponin: 0 };
  assert.equal(S.heart(base).total, 0);
  assert.equal(S.heart(base).kind, "neutral");
  assert.equal(S.heart({...base, age: 44}).total, 0);
  assert.equal(S.heart({...base, age: 45}).total, 1);
  assert.equal(S.heart({...base, age: 64}).total, 1);
  assert.equal(S.heart({...base, age: 65}).total, 2);

  // Critical flag when total <=3 but troponin >=1 or ecg === 2
  const critTrop = S.heart({...base, troponin: 1});
  assert.equal(critTrop.total, 1);
  assert.equal(critTrop.criticalFlag, true);
  assert.equal(critTrop.kind, "warning");

  const critEcg = S.heart({...base, ecg: 2});
  assert.equal(critEcg.total, 2);
  assert.equal(critEcg.criticalFlag, true);
  assert.equal(critEcg.kind, "warning");

  const maxHeart = S.heart({ population: "adult", history: 2, ecg: 2, age: 75, riskFactors: 2, troponin: 2 });
  assert.equal(maxHeart.total, 10);
  assert.equal(maxHeart.kind, "high");
});
test("CHA2DS2-VA (ESC 2024) & HAS-BLED: age brackets, sex-neutral AF scoring and bleeding risk",()=>{
  const afBase = {
    population: "adult", age: 55,
    chf: false, hypertension: false, diabetes: false, strokeTiaTe: false, vascularDisease: false,
  };
  assert.equal(S.cha2ds2va(afBase).total, 0);
  assert.equal(S.cha2ds2va(afBase).kind, "neutral");
  assert.equal(S.cha2ds2va({...afBase, age: 65}).total, 1);
  assert.equal(S.cha2ds2va({...afBase, age: 65}).kind, "warning");
  assert.equal(S.cha2ds2va({...afBase, age: 75}).total, 2);
  assert.equal(S.cha2ds2va({...afBase, age: 75}).kind, "high");
  assert.equal(S.cha2ds2va({...afBase, strokeTiaTe: true}).total, 2);
  assert.equal(S.cha2ds2va({
    population: "adult", age: 80,
    chf: true, hypertension: true, diabetes: true, strokeTiaTe: true, vascularDisease: true,
  }).total, 8);

  const hbBase = {
    population: "adult",
    hypertension: false, renalDisease: false, liverDisease: false, strokeHistory: false,
    bleedingHistory: false, labileInr: false, elderly: false, drugs: false, alcohol: false,
  };
  assert.equal(S.hasbled(hbBase).total, 0);
  assert.equal(S.hasbled(hbBase).kind, "neutral");
  const hb3 = S.hasbled({...hbBase, hypertension: true, elderly: true, drugs: true});
  assert.equal(hb3.total, 3);
  assert.equal(hb3.kind, "warning");
  assert.match(hb3.action, /NIE stanowi przeciwwskazania/);
});
test("NIHSS & ABCD2: 15-item stroke scale (0-42, UN handling) and TIA score with NICE warning",()=>{
  const nihssZero = {
    population: "adult",
    ia:0, ib:0, ic:0, gaze:0, visual:0, facial:0,
    motorArmL:0, motorArmR:0, motorLegL:0, motorLegR:0,
    ataxia:0, sensory:0, language:0, dysarthria:0, extinction:0,
  };
  const r0 = S.nihss(nihssZero);
  assert.equal(r0.ok, true);
  assert.equal(r0.total, 0);
  assert.match(r0.headline, /tylnego krążenia/);

  const rUn = S.nihss({...nihssZero, motorArmL: "UN", ataxia: "UN", dysarthria: "UN", facial: 2});
  assert.equal(rUn.ok, true);
  assert.equal(rUn.total, 2);
  assert.equal(rUn.hasUn, true);
  assert.equal(S.nihss({...nihssZero, ia: "UN"}).ok, false); // 1a cannot be UN

  const rMax = S.nihss({
    population: "adult",
    ia:3, ib:2, ic:2, gaze:2, visual:3, facial:3,
    motorArmL:4, motorArmR:4, motorLegL:4, motorLegR:4,
    ataxia:2, sensory:2, language:3, dysarthria:2, extinction:2,
  });
  assert.equal(rMax.total, 42);
  assert.equal(rMax.kind, "high");

  const abcd0 = S.abcd2({ population: "adult", age: 50, sbp: 120, dbp: 75, clinicalFeatures: 0, duration: 0, diabetes: false });
  assert.equal(abcd0.ok, true);
  assert.equal(abcd0.total, 0);
  assert.match(abcd0.action, /NICE NG128/);

  const abcdMax = S.abcd2({ population: "adult", age: 65, sbp: 150, dbp: 95, clinicalFeatures: 2, duration: 2, diabetes: true });
  assert.equal(abcdMax.total, 7);
  assert.equal(abcdMax.kind, "high");
});
