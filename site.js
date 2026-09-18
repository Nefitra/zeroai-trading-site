(()=> {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  fetch('status.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(s=>{
    if(!s)return;
    qa('[data-status-field]').forEach(el=>{
      let v=s;
      for(const k of el.dataset.statusField.split('.')) v=v?.[k];
      if(v!==undefined&&v!==null) el.textContent=String(v);
    });
  }).catch(()=>{});

  qa('.visual-grid[data-cells]').forEach(el=>{
    const n=Number(el.dataset.cells||0);
    if(!el.children.length) for(let i=0;i<n;i++) el.appendChild(document.createElement('i'));
  });

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('on');
        if(e.target.classList.contains('timeline-animated')) e.target.classList.add('timeline-live');
      }
    });
  },{threshold:.14});
  qa('.event,.audit-line,.matrix-arm,.timeline-animated').forEach(el=>observer.observe(el));

  const timeline=q('.timeline-animated');
  if(timeline){
    qa('.event',timeline).forEach((el,i)=>{el.style.transitionDelay=(i*110)+'ms'});
    setTimeout(()=>timeline.classList.add('timeline-live'),250);
  }

  const audit=q('[data-audit-console]');
  if(audit){
    qa('.audit-line',audit).forEach((el,i)=>setTimeout(()=>el.classList.add('on'),160+i*115));
  }

  const explorer=q('#freshMatrixExplorer');
  if(explorer){
    const starts=[959,10959,20959,30959,40959,50959,60959,70959,80959,90959,100959,110959];
    const arms=[
      {id:1,exp:'EXP-0012',n:1,role:'CONTROL'},
      {id:2,exp:'EXP-0013',n:2,role:'TREATMENT'},
      {id:3,exp:'EXP-0014',n:3,role:'TREATMENT'}
    ];
    const map=q('#matrixMap'), detail=q('#episodeDetail');
    const armSel=q('#filterArm'), candSel=q('#filterCandidate'), winSel=q('#filterWindow');
    let selected=null;
    arms.forEach(arm=>{
      const wrap=document.createElement('section');wrap.className='matrix-arm';
      wrap.innerHTML='<div class="matrix-arm-head"><h3>'+arm.exp+' · N='+arm.n+'</h3><span class="badge '+(arm.id===1?'info':'good')+'">'+arm.role+'</span></div>';
      const grid=document.createElement('div');grid.className='episode-grid';
      const blank=document.createElement('div');blank.className='episode-head';grid.appendChild(blank);
      for(let w=0;w<12;w++){const h=document.createElement('div');h.className='episode-head';h.textContent='W'+String(w).padStart(2,'0');grid.appendChild(h)}
      for(let c=1;c<=10;c++){
        const lab=document.createElement('div');lab.className='episode-label';lab.textContent='C'+String(c).padStart(2,'0');grid.appendChild(lab);
        for(let w=0;w<12;w++){
          const cell=document.createElement('button');cell.type='button';cell.className='episode-cell';
          cell.dataset.arm=String(arm.id);cell.dataset.candidate=String(c);cell.dataset.window=String(w);
          cell.title=arm.exp+' · candidate '+c+' · W'+String(w).padStart(2,'0')+' · performance sealed';
          cell.addEventListener('click',()=>{
            if(selected) selected.classList.remove('selected');
            selected=cell;cell.classList.add('selected');
            const s=starts[w], actionStart=s+1, actionEnd=s+10000;
            detail.innerHTML='<div class="title"><h3>'+arm.exp+' · Candidate '+String(c).padStart(2,'0')+' · W'+String(w).padStart(2,'0')+'</h3><span class="badge warn">PERFORMANCE SEALED</span></div>'+
              '<div class="episode-detail-grid">'+
              '<div><b>Confirmation threshold</b><span>N = '+arm.n+'</span></div>'+
              '<div><b>Start observation row</b><span>'+s.toLocaleString()+'</span></div>'+
              '<div><b>Action range</b><span>'+actionStart.toLocaleString()+' … '+actionEnd.toLocaleString()+'</span></div>'+
              '<div><b>Terminal observation</b><span>'+actionEnd.toLocaleString()+'</span></div>'+
              '<div><b>Controlled minutes</b><span>10,000</span></div>'+
              '<div><b>Selection authority</b><span>NONE until 360 / 360 complete</span></div>'+
              '</div>';
          });
          grid.appendChild(cell);
        }
      }
      wrap.appendChild(grid);map.appendChild(wrap);observer.observe(wrap);
    });
    const filter=()=>{
      const a=armSel.value,c=candSel.value,w=winSel.value;
      qa('.episode-cell',map).forEach(cell=>{
        const hide=(a!=='all'&&cell.dataset.arm!==a)||(c!=='all'&&cell.dataset.candidate!==c)||(w!=='all'&&cell.dataset.window!==w);
        cell.classList.toggle('filtered',hide);
      });
      const visible=qa('.episode-cell:not(.filtered)',map).length;
      q('#visibleEpisodes').textContent=visible+' / 360 visible';
    };
    [armSel,candSel,winSel].forEach(s=>s.addEventListener('change',filter));
    filter();
  }
})();