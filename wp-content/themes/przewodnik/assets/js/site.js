(function(){
  var d=document, w=window;
    var mq=w.matchMedia('all'); /* 12.11 wieczór: menu rozwijane ikoną na każdej szerokości ekranu */

  /* ===== menu: grupy rozwijane + menu mobilne ===== */
  var bur=d.getElementById('burger'), nav=d.getElementById('nav'), top=d.querySelector('.top');
  var grupy=[].slice.call(d.querySelectorAll('.gr'));
  function zwin(wyj){ grupy.forEach(function(g){ if(g!==wyj){ g.classList.remove('otw'); g.querySelector('.gr-b').setAttribute('aria-expanded','false'); } }); }
  grupy.forEach(function(g){
    var b=g.querySelector('.gr-b');
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var o=!g.classList.contains('otw');
      if(!mq.matches) zwin(g);
      g.classList.toggle('otw',o); b.setAttribute('aria-expanded',o?'true':'false');
    });
  });
  d.addEventListener('click',function(e){ if(!mq.matches && !e.target.closest('.gr')) zwin(null); });
  function wysokosc(){ if(!nav) return; var r=top.getBoundingClientRect(); nav.style.maxHeight=(w.innerHeight-r.bottom)+'px'; }
  function zamknij(){
    if(!nav) return;
    nav.classList.remove('otw'); d.body.classList.remove('menu-otw');
    bur.setAttribute('aria-expanded','false'); bur.setAttribute('aria-label','Otwórz menu');
    zwin(null);
  }
  if(bur && nav){
    bur.addEventListener('click',function(){
      var o=nav.classList.toggle('otw');
      d.body.classList.toggle('menu-otw',o);
      bur.setAttribute('aria-expanded',o?'true':'false');
      bur.setAttribute('aria-label',o?'Zamknij menu':'Otwórz menu');
      if(o){ wysokosc(); grupy.forEach(function(g){ if(g.classList.contains('akt')){ g.classList.add('otw'); g.querySelector('.gr-b').setAttribute('aria-expanded','true'); } }); nav.scrollTop=0; }
      else zwin(null);
    });
    nav.addEventListener('click',function(e){ var a=e.target.closest('a'); if(a && a.getAttribute('href').charAt(0)==='#') zamknij(); });
    w.addEventListener('resize',function(){ if(!mq.matches && nav.classList.contains('otw')) zamknij(); else if(nav.classList.contains('otw')) wysokosc(); });
  }
  d.addEventListener('keydown',function(e){ if(e.key==='Escape'){ zamknij(); zwin(null); } });

  /* ===== dolny pasek na telefonie ===== */
  var mob=d.getElementById('mob'), cel=d.querySelector('.hero .btn, [data-cta]'), koniec=d.getElementById('zapis')||d.getElementById('zapytanie')||d.getElementById('kontakt');
  if(mob && cel && 'IntersectionObserver' in w){
    var zaCel=false, wKoncu=false;
    function pasek(){ var v=zaCel&&!wKoncu; mob.classList.toggle('widac',v); mob.setAttribute('aria-hidden',v?'false':'true'); [].forEach.call(mob.querySelectorAll('a'),function(a){a.tabIndex=v?0:-1;}); }
    new IntersectionObserver(function(e){ zaCel=!e[0].isIntersecting && e[0].boundingClientRect.top<0; pasek(); }).observe(cel);
    if(koniec) new IntersectionObserver(function(e){ wKoncu=e[0].isIntersecting; pasek(); },{rootMargin:'0px 0px -30% 0px'}).observe(koniec);
  }

  /* ===== karuzele zdjęć: palec, mysz, strzałki, licznik ===== */
  var strz='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  [].forEach.call(d.querySelectorAll('[data-sw]'),function(sw){
    var tor=sw.querySelector('.sw-tor'), n=tor.querySelectorAll('img').length;
    if(n<2) return;
    tor.setAttribute('tabindex','0'); tor.setAttribute('aria-label','Zdjęcia, przewiń w bok');
    var p=d.createElement('button'), nx=d.createElement('button'), lic=d.createElement('span');
    p.className='sw-btn p'; nx.className='sw-btn n'; p.type=nx.type='button';
    p.innerHTML=strz; nx.innerHTML=strz.replace('M15 5l-7 7 7 7','M9 5l7 7-7 7');
    p.setAttribute('aria-label','Poprzednie zdjęcie'); nx.setAttribute('aria-label','Następne zdjęcie');
    lic.className='sw-lic';
    sw.appendChild(p); sw.appendChild(nx); sw.appendChild(lic);
    function idx(){ return tor.clientWidth?Math.round(tor.scrollLeft/tor.clientWidth):0; }
    function upd(){ var i=idx(); lic.textContent=(i+1)+' / '+n; p.disabled=i<=0; nx.disabled=i>=n-1; }
    function idz(i){ i=Math.max(0,Math.min(n-1,i)); tor.scrollTo({left:i*tor.clientWidth,behavior:'smooth'}); }
    p.addEventListener('click',function(){idz(idx()-1);});
    nx.addEventListener('click',function(){idz(idx()+1);});
    tor.addEventListener('scroll',function(){w.requestAnimationFrame(upd);},{passive:true});
    tor.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){e.preventDefault();idz(idx()+1);} if(e.key==='ArrowLeft'){e.preventDefault();idz(idx()-1);} });
    var start=0, sl=0, ciagnie=false, ruch=false;
    tor.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse') return; ciagnie=true; ruch=false; start=e.clientX; sl=tor.scrollLeft; tor.classList.add('drag'); tor.setPointerCapture(e.pointerId); });
    tor.addEventListener('pointermove',function(e){ if(!ciagnie) return; var dx=e.clientX-start; if(Math.abs(dx)>4) ruch=true; tor.scrollLeft=sl-dx; });
    function kon(e){ if(!ciagnie) return; ciagnie=false; var dx=e.clientX-start, i=Math.round(sl/tor.clientWidth); if(dx<-40) i++; else if(dx>40) i--; tor.classList.remove('drag'); idz(i); }
    tor.addEventListener('pointerup',kon); tor.addEventListener('pointercancel',kon);
    tor.addEventListener('click',function(e){ if(ruch){e.preventDefault();e.stopPropagation();} },true);
    w.addEventListener('resize',upd);
    upd();
  });

  /* przeciąganie myszą rzędów kart na wąskich ekranach */
  [].forEach.call(d.querySelectorAll('[data-rzad]'),function(r){
    var s=0, sl=0, on=false, ruch=false;
    r.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse'||e.target.closest('.sw')||r.scrollWidth<=r.clientWidth) return; on=true; ruch=false; s=e.clientX; sl=r.scrollLeft; });
    r.addEventListener('pointermove',function(e){ if(!on) return; var dx=e.clientX-s; if(Math.abs(dx)>5){ruch=true; e.preventDefault();} r.scrollLeft=sl-dx; });
    ['pointerup','pointerleave'].forEach(function(t){ r.addEventListener(t,function(){ on=false; }); });
    r.addEventListener('click',function(e){ if(ruch){ e.preventDefault(); e.stopPropagation(); ruch=false; } },true);
  });

  /* ===== filtr tras: kilka wartości w jednym filtrze (lub), różne filtry zawężają (i) ===== */
  var lista=d.querySelector('[data-trasy]');
  if(lista){
    var karty=[].slice.call(lista.querySelectorAll('.trasa')), wynik=d.getElementById('filtr-wynik'), brak=d.getElementById('brak'), wyczysc=d.getElementById('filtr-wyczysc');
    /* 13.11: opisy tras i programów filtrowane tymi samymi kryteriami (region, rodzaj, tematyka, grupa) i tekstem */
    var opisy=[].slice.call(d.querySelectorAll('[data-opisy] .op-tr')), opWyn=d.getElementById('opisy-wynik'), opBrak=d.getElementById('opisy-brak'), OPK=['reg','rodz','tem','gr'];
    var typy=[], stan={}, szuk=d.getElementById('filtr-szukaj'), fraza='';
    [].forEach.call(d.querySelectorAll('.fb[data-t]'),function(b){ var t=b.getAttribute('data-t'); if(typy.indexOf(t)<0){ typy.push(t); stan[t]=[]; } });
    try{ var q=new URLSearchParams(w.location.search); typy.forEach(function(t){ if(q.get(t)) stan[t]=q.get(t).split(',').filter(Boolean); }); if(q.get('q')&&szuk){ szuk.value=q.get('q'); } }catch(e){}
    /* 12.11 wieczór: panel dodatkowych filtrów (poziom 2) - otwierany przyciskiem, zostaje otwarty po wyborze */
    var wb=d.getElementById('filtr-wiecej-b'), dod=d.getElementById('filtr-dod'), akt=d.getElementById('filtr-akt');
    function panel(o){ if(!wb||!dod) return; dod.hidden=!o; wb.setAttribute('aria-expanded',o?'true':'false'); wb.textContent=o?'Ukryj dodatkowe filtry':'Pokaż dodatkowe filtry'; }
    if(wb) wb.addEventListener('click',function(){ panel(dod.hidden); });
    if(dod && [].some.call(dod.querySelectorAll('.fb[data-t]'),function(b){ var t=b.getAttribute('data-t'); return stan[t] && stan[t].length; })) panel(true);
    /* rdzeń słowa: odmiana polska (Czerwony Klasztor -> Czerwonego Klasztoru, przyrodnicza -> przyrodnicze) */
    function rdzen(w){ var n=w.length; return n<=4?w:w.slice(0,Math.max(4,n-2)); }
    function norm(x){ x=(x||'').toLowerCase(); return x.normalize?x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l'):x; }
    function odm(n){ return n===1?'wycieczkę':(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'wycieczki':'wycieczek'); }
    function nazwa(t,v){ var b=d.querySelector('.fb[data-t="'+t+'"][data-v="'+v+'"]'); return b?(b.querySelector('span')||b).textContent.trim():v; }
    function filtruj(){
      var ile=0; fraza=szuk?norm(szuk.value.trim()):''; var slowa=fraza?fraza.split(/[^a-z0-9]+/).filter(Boolean).map(rdzen):[];
      karty.forEach(function(k){
        var ok=typy.every(function(t){ if(!stan[t].length) return true; var v=(k.getAttribute('data-'+t)||'').split(' '); return stan[t].some(function(x){ return v.indexOf(x)>-1; }); });
        if(ok && slowa.length){ var tx=norm(k.getAttribute('data-txt')||k.textContent); ok=slowa.every(function(s){ return tx.indexOf(s)>-1; }); }
        k.hidden=!ok; if(ok) ile++;
      });
      var ileOp=0; opisy.forEach(function(o){ var ok=OPK.every(function(t){ if(!stan[t]||!stan[t].length) return true; var v=(o.getAttribute('data-'+t)||'').split(' '); return stan[t].some(function(x){ return v.indexOf(x)>-1; }); }); if(ok && slowa.length){ var tx=norm(o.getAttribute('data-txt')||o.textContent); ok=slowa.every(function(s){ return tx.indexOf(s)>-1; }); } o.hidden=!ok; if(ok) ileOp++; });
      if(opWyn) opWyn.textContent='Opisy tras: '+ileOp+' z '+opisy.length; if(opBrak) opBrak.hidden=ileOp>0||!opisy.length;
      [].forEach.call(d.querySelectorAll('.fb[data-t]'),function(b){ var t=b.getAttribute('data-t'), v=b.getAttribute('data-v'); b.setAttribute('aria-pressed',(v==='all'?!stan[t].length:stan[t].indexOf(v)>-1)?'true':'false'); });
      var aktywne=typy.some(function(t){ return stan[t].length; })||slowa.length>0;
      wynik.textContent=ile?'Znaleziono '+ile+' '+odm(ile):'Nie znaleziono wycieczek';
      if(wyczysc) wyczysc.hidden=!aktywne;
      if(akt){ var h=''; typy.forEach(function(t){ stan[t].forEach(function(v){ var n=nazwa(t,v); h+='<button type="button" class="fa" data-t="'+t+'" data-v="'+v+'" aria-label="Usuń filtr: '+n.replace(/"/g,'')+'">'+n+'<span aria-hidden="true">&times;</span></button>'; }); });
        if(szuk&&szuk.value.trim()) h+='<button type="button" class="fa" data-q="1" aria-label="Usuń wyszukiwanie">„'+szuk.value.trim().replace(/[<>&"]/g,'')+'”<span aria-hidden="true">&times;</span></button>';
        akt.innerHTML=h?h+'<button type="button" class="fa-x">Wyczyść wszystkie</button>':''; akt.hidden=!h; }
      brak.hidden=ile>0;
      try{ var q2=new URLSearchParams(); typy.forEach(function(t){ if(stan[t].length) q2.set(t,stan[t].join(',')); }); if(szuk&&szuk.value.trim()) q2.set('q',szuk.value.trim()); history.replaceState(null,'',(q2.toString()?'?'+q2.toString():w.location.pathname)+w.location.hash); }catch(e){}
    }
    if(szuk){ var tm; szuk.addEventListener('input',function(){ clearTimeout(tm); tm=setTimeout(filtruj,150); }); szuk.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); filtruj(); } }); }
    [].forEach.call(d.querySelectorAll('.fb[data-t]'),function(b){
      b.addEventListener('click',function(){ var t=b.getAttribute('data-t'), v=b.getAttribute('data-v');
        if(v==='all') stan[t]=[]; else { var i=stan[t].indexOf(v); if(i>-1) stan[t].splice(i,1); else stan[t].push(v); }
        filtruj();
      });
    });
    function zeruj(){ typy.forEach(function(t){ stan[t]=[]; }); if(szuk) szuk.value=''; filtruj(); }
    if(akt) akt.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; if(b.classList.contains('fa-x')) return zeruj(); if(b.getAttribute('data-q')){ szuk.value=''; return filtruj(); } var t=b.getAttribute('data-t'), x=stan[t]?stan[t].indexOf(b.getAttribute('data-v')):-1; if(x>-1) stan[t].splice(x,1); filtruj(); });
    [wyczysc,d.getElementById('filtr-zeruj')].forEach(function(x){ if(x) x.addEventListener('click',zeruj); });
    filtruj();
  }

  /* ===== spis treści artykułu: bieżący rozdział ===== */
  var spis=[].slice.call(d.querySelectorAll('.spis a'));
  if(spis.length && 'IntersectionObserver' in w){
    var naglowki=spis.map(function(a){ return d.getElementById(a.getAttribute('href').slice(1)); });
    var io=new IntersectionObserver(function(){
      var y=w.innerHeight*0.3, akt=0;
      naglowki.forEach(function(h,i){ if(h && h.getBoundingClientRect().top<y) akt=i; });
      spis.forEach(function(a,i){ a.classList.toggle('akt',i===akt); });
    },{threshold:[0,1]});
    naglowki.forEach(function(h){ if(h) io.observe(h); });
    w.addEventListener('scroll',function(){ var y=w.innerHeight*0.3, akt=0; naglowki.forEach(function(h,i){ if(h && h.getBoundingClientRect().top<y) akt=i; }); spis.forEach(function(a,i){ a.classList.toggle('akt',i===akt); }); },{passive:true});
  }
})();

/* ===== zapis na spacer: wybór terminu z przycisków, liczba wolnych miejsc ===== */
(function(){
  var d=document, f=d.getElementById('zapis-form'); if(!f) return;
  var sel=d.getElementById('z-termin'), ile=d.getElementById('z-ile'), wo=d.getElementById('z-wolne'), mx=+ile.max||10;
  function miejsc(n){ if(n===1) return 'wolne miejsce'; var a=n%10,b=n%100; return (a>=2&&a<=4&&!(b>=12&&b<=14))?'wolne miejsca':'wolnych miejsc'; }
  function upd(){ var o=sel.options[sel.selectedIndex], w=o&&o.value?+o.getAttribute('data-wolne'):0; if(o&&o.value){ ile.max=Math.max(1,Math.min(w,mx)); wo.textContent='Na ten termin: '+w+' '+miejsc(w)+'.'; if(+ile.value>+ile.max) ile.value=ile.max; } else { ile.max=mx; wo.textContent=''; } }
  sel.addEventListener('change',upd);
  d.addEventListener('click',function(e){ var a=e.target.closest('[data-zapisz]'); if(!a) return; var o=sel.querySelector('option[value="'+a.getAttribute('data-zapisz')+'"]'); if(!o||o.disabled) return; e.preventDefault(); sel.value=o.value; upd(); d.getElementById('zapis').scrollIntoView({behavior:'smooth'}); setTimeout(function(){ try{ d.getElementById('z-kto').focus({preventScroll:true}); }catch(x){} },500); });
  f.addEventListener('submit',function(){ var b=f.querySelector('button[type=submit]'); if(b){ setTimeout(function(){ b.disabled=true; b.classList.add('wysyla'); },0); } });
  upd();
})();
/* ===== formularze: blokada podwójnego kliknięcia ===== */
(function(){
  [].forEach.call(document.querySelectorAll('form.form:not(#zapis-form)'),function(f){ f.addEventListener('submit',function(){ var b=f.querySelector('button[type=submit]'); if(b) setTimeout(function(){ b.disabled=true; b.classList.add('wysyla'); },0); }); });
  var k=document.querySelector('.zap-ok,.zap-blad'); if(k){ k.scrollIntoView({block:'center'}); }
})();
/* ===== powiększanie zdjęć w galeriach ===== */
(function(){
  var d=document, lin=[].slice.call(d.querySelectorAll('a[data-pow], .proza .gal a[href$=".webp"], .proza .gal a[href$=".jpg"], .wp-block-gallery a'));
  if(!lin.length) return;
  var o=d.createElement('div'); o.className='pow'; o.hidden=true; o.setAttribute('role','dialog'); o.setAttribute('aria-label','Powiększone zdjęcie');
  o.innerHTML='<button type="button" class="pow-x" aria-label="Zamknij">&times;</button><button type="button" class="pow-p" aria-label="Poprzednie">&lsaquo;</button><img alt=""><button type="button" class="pow-n" aria-label="Następne">&rsaquo;</button>';
  d.body.appendChild(o); var im=o.querySelector('img'), i=0;
  /* 12.11: przewijanie w obrębie albumu (galeria), poza albumem po wszystkich zdjęciach strony */
  var wsz=lin;
  function pokaz(n){ i=(n+lin.length)%lin.length; im.src=lin[i].href; var m=lin[i].querySelector('img'); im.alt=m?m.alt:''; o.hidden=false; d.body.classList.add('pow-otw'); }
  function zamknij(){ o.hidden=true; d.body.classList.remove('pow-otw'); im.src=''; }
  wsz.forEach(function(a){ a.addEventListener('click',function(e){ e.preventDefault(); var al=a.closest('[data-album]'); lin=al?[].slice.call(al.querySelectorAll('a[data-pow]')):wsz; pokaz(lin.indexOf(a)); }); });
  o.addEventListener('click',function(e){ if(e.target===o||e.target.classList.contains('pow-x')) zamknij(); else if(e.target.classList.contains('pow-p')) pokaz(i-1); else if(e.target.classList.contains('pow-n')) pokaz(i+1); });
  d.addEventListener('keydown',function(e){ if(o.hidden) return; if(e.key==='Escape') zamknij(); if(e.key==='ArrowRight') pokaz(i+1); if(e.key==='ArrowLeft') pokaz(i-1); });
})();
/* ===== podstrona regionu: filtr atrakcji, działy artykułów, "Zapytaj o tę wycieczkę", bieżąca sekcja ===== */
(function(){
  var d=document, w=window;
  var atr=[].slice.call(d.querySelectorAll('.rg-a')), fb=[].slice.call(d.querySelectorAll('[data-rf]'));
  function filtr(v){
    atr.forEach(function(a){ a.hidden=!(v==='all'||a.getAttribute('data-cz')===v); });
    fb.forEach(function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-rf')===v?'true':'false'); });
  }
  fb.forEach(function(b){ b.addEventListener('click',function(){ filtr(b.getAttribute('data-rf')); }); });
  [].forEach.call(d.querySelectorAll('[data-filtr]'),function(a){ a.addEventListener('click',function(){ if(fb.length) filtr(a.getAttribute('data-filtr')); }); });

  var af=[].slice.call(d.querySelectorAll('[data-af]')), ap=[].slice.call(d.querySelectorAll('[data-ap]'));
  af.forEach(function(b){ b.addEventListener('click',function(){
    var v=b.getAttribute('data-af');
    af.forEach(function(x){ x.setAttribute('aria-pressed',x===b?'true':'false'); });
    ap.forEach(function(p){ p.hidden=p.getAttribute('data-ap')!==v; });
  }); });

  var sel=d.getElementById('r-prog'), kon=d.getElementById('zapytanie');
  if(sel && kon){
    d.addEventListener('click',function(e){
      var a=e.target.closest('[data-wyc]'); if(!a) return;
      var v=a.getAttribute('data-wyc'), ok=[].some.call(sel.options,function(o){ return o.value===v||o.text===v; });
      if(!ok) return;
      e.preventDefault(); sel.value=v;
      kon.scrollIntoView({behavior:'smooth'});
      setTimeout(function(){ try{ d.getElementById('r-kto').focus({preventScroll:true}); }catch(x){} },600);
    });
  }

  var nav=[].slice.call(d.querySelectorAll('.rg-nav a'));
  if(nav.length && 'IntersectionObserver' in w){
    var sek=nav.map(function(a){ return d.getElementById(a.getAttribute('href').slice(1)); });
    function akt(){
      var y=w.innerHeight*0.35, i=-1;
      sek.forEach(function(s,n){ if(s && s.getBoundingClientRect().top<y) i=n; });
      nav.forEach(function(a,n){ a.classList.toggle('akt',n===i); });
      if(i>-1){ var a=nav[i], ul=a.parentNode.parentNode; if(a.offsetLeft<ul.scrollLeft||a.offsetLeft+a.offsetWidth>ul.scrollLeft+ul.clientWidth) ul.scrollTo({left:a.offsetLeft-16,behavior:'smooth'}); }
    }
    w.addEventListener('scroll',function(){ w.requestAnimationFrame(akt); },{passive:true});
    akt();
  }
})();

/* ===== galeria: kafle regionów filtrują albumy (12.11) ===== */
(function(){
  var d=document, kafle=[].slice.call(d.querySelectorAll('.gal-reg-k[data-region]')); if(!kafle.length) return;
  var pas=d.querySelector('.gal-filtr'), tx=d.getElementById('gal-filtr-tx'), x=d.getElementById('gal-filtr-x');
  var el=[].slice.call(d.querySelectorAll('.gal-alb-k[data-region], .alb-pelny[data-region]'));
  function filtr(r,nazwa){ el.forEach(function(e){ e.hidden = r && (' '+e.getAttribute('data-region')+' ').indexOf(' '+r+' ')<0; }); if(pas){ pas.hidden=!r; if(tx) tx.textContent = r ? 'Albumy: '+nazwa : ''; } }
  kafle.forEach(function(k){ k.addEventListener('click',function(){ filtr(k.getAttribute('data-region'), k.querySelector('b').textContent); }); });
  if(x) x.addEventListener('click',function(){ filtr('',''); });
})();

/* ===== informator: wyszukiwarka artykułów (region, miejscowość, dział, tekst), 13.11 ===== */
(function(){
  var d=document, lista=d.querySelector('[data-inf-lista]'); if(!lista) return;
  var el=[].slice.call(lista.children), wyn=d.getElementById('inf-wynik'), brak=d.getElementById('inf-brak'), wiecej=d.getElementById('inf-wiecej'), szuk=d.getElementById('inf-szukaj');
  var stan={r:'',m:'',d:''}, limit=12;
  function norm(x){ x=(x||'').toLowerCase(); return x.normalize?x.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l'):x; }
  function odm(n){ return n===1?'artykuł':(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'artykuły':'artykułów'); }
  function filtruj(){
    var slowa=norm(szuk?szuk.value.trim():'').split(/[^a-z0-9]+/).filter(Boolean).map(function(w){ return w.length<=4?w:w.slice(0,Math.max(4,w.length-2)); });
    var ok=el.filter(function(li){
      var t=['r','m','d'].every(function(k){ return !stan[k] || (' '+li.getAttribute('data-'+k)+' ').indexOf(' '+stan[k]+' ')>-1; });
      if(t && slowa.length){ var tx=norm(li.getAttribute('data-txt')); t=slowa.every(function(s){ return tx.indexOf(s)>-1; }); }
      return t;
    });
    el.forEach(function(li){ li.hidden=true; });
    ok.forEach(function(li,i){ li.hidden=i>=limit; });
    wyn.textContent='Znaleziono '+ok.length+' '+odm(ok.length);
    brak.hidden=ok.length>0; wiecej.hidden=ok.length<=limit;
    [].forEach.call(d.querySelectorAll('.fb[data-if]'),function(b){ b.setAttribute('aria-pressed', stan[b.getAttribute('data-if')]===b.getAttribute('data-v')?'true':'false'); });
  }
  [].forEach.call(d.querySelectorAll('.fb[data-if]'),function(b){ b.addEventListener('click',function(){ stan[b.getAttribute('data-if')]=b.getAttribute('data-v'); limit=12; filtruj(); }); });
  if(szuk){ var tm; szuk.addEventListener('input',function(){ clearTimeout(tm); tm=setTimeout(function(){ limit=12; filtruj(); },150); }); }
  wiecej.addEventListener('click',function(){ limit+=24; filtruj(); });
  filtruj();
})();
