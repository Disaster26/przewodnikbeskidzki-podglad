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
  d.addEventListener('keydown',function(e){ if(e.key==='Escape'){ var o=nav&&nav.classList.contains('otw'); zamknij(); zwin(null); if(o&&bur) bur.focus(); } });
  /* 13.11: menu łatwe do zamknięcia - przycisk "Zamknij menu" i dotknięcie poza menu */
  [].forEach.call(d.querySelectorAll('[data-nav-zamknij]'),function(b){ b.addEventListener('click',function(){ zamknij(); if(bur) bur.focus(); }); });
  d.addEventListener('click',function(e){ if(nav && nav.classList.contains('otw') && !nav.contains(e.target) && !(bur&&bur.contains(e.target))) zamknij(); });

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

/* ===== zapis na spacer: formularz przypisany do konkretnego spaceru i terminu (13.11, mail 15:43) =====
   "Zapisz się" przy terminie (kalendarz, karty) ustawia ukryte pola termin + spacer i pokazuje podsumowanie wybranego terminu.
   Działa też po przejściu ze strony głównej: adres /spacery/?t=ID#zapis. */
(function(){
  var d=document, f=d.getElementById('zapis-form'); if(!f) return;
  var sel=d.getElementById('z-termin'), ile=d.getElementById('z-ile'), wo=d.getElementById('z-wolne'), mx=+(ile.getAttribute('data-max')||ile.max)||10;
  var ht=d.getElementById('z-t'), hs=d.getElementById('z-s'), box=d.getElementById('z-wybr'), selP=d.getElementById('z-termin-p'), zm=d.getElementById('z-zmien');
  function miejsc(n){ if(n===1) return 'wolne miejsce'; var a=n%10,b=n%100; return (a>=2&&a<=4&&!(b>=12&&b<=14))?'wolne miejsca':'wolnych miejsc'; }
  function txt(id,t){ var e=d.getElementById(id); if(e){ e.textContent=t; e.hidden=!t; } }
  function upd(){
    var o=sel.options[sel.selectedIndex], ok=o&&o.value&&!o.disabled, w=ok?+o.getAttribute('data-wolne'):0;
    ht.value=ok?o.value:''; hs.value=ok?o.getAttribute('data-spacer'):'';
    if(ok){ ile.max=Math.max(1,Math.min(w,mx)); wo.textContent='Na ten termin: '+w+' '+miejsc(w)+'.'; if(+ile.value>+ile.max) ile.value=ile.max; }
    else { ile.max=mx; wo.textContent=''; }
    if(ok){
      txt('z-wybr-t',o.getAttribute('data-tytul')); txt('z-wybr-k',o.getAttribute('data-kiedy'));
      txt('z-wybr-z',o.getAttribute('data-zb')?'Zbiórka: '+o.getAttribute('data-zb'):''); txt('z-wybr-c',o.getAttribute('data-cena')?'Cena: '+o.getAttribute('data-cena')+' od osoby':'');
    }
  }
  function tryb(wybrany){ box.hidden=!wybrany; selP.hidden=wybrany; sel.required=!wybrany; }
  function ustaw(id){ var o=sel.querySelector('option[value="'+id+'"]'); if(!o||o.disabled) return false; sel.value=o.value; upd(); tryb(true); return true; }
  sel.addEventListener('change',function(){ upd(); if(sel.value) tryb(true); });
  if(zm) zm.addEventListener('click',function(e){ e.preventDefault(); tryb(false); try{ sel.focus(); }catch(x){} });
  d.addEventListener('click',function(e){ var a=e.target.closest('[data-zapisz]'); if(!a) return; if(!ustaw(a.getAttribute('data-zapisz'))) return; e.preventDefault();
    try{ history.replaceState(null,'','?t='+a.getAttribute('data-zapisz')+'#zapis'); }catch(x){}
    d.getElementById('zapis').scrollIntoView({behavior:'smooth'}); setTimeout(function(){ try{ d.getElementById('z-kto').focus({preventScroll:true}); }catch(x){} },500); });
  f.addEventListener('submit',function(){ upd(); var b=f.querySelector('button[type=submit]'); if(b){ setTimeout(function(){ b.disabled=true; b.classList.add('wysyla'); },0); } });
  var q=null; try{ q=new URLSearchParams(location.search).get('t'); }catch(x){}
  if(q && ustaw(q)){ /* termin z adresu (np. ze strony głównej) */ }
  else if(ht.value){ upd(); tryb(true); }
  else { upd(); tryb(false); }
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

/* ===== 13.11: kalendarz miesięczny terminów. Dane = karty terminów w <template> (z panelu), nic nie wpisuje się ręcznie ===== */
(function(){
  var d=document;
  var MIES=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
  var MIES_W=['styczniu','lutym','marcu','kwietniu','maju','czerwcu','lipcu','sierpniu','wrześniu','październiku','listopadzie','grudniu'];
  var MIES_D=['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
  var DNI=['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
  function terminy(n){ var a=n%10,b=n%100; return n===1?'termin':(a>=2&&a<=4&&!(b>=12&&b<=14))?'terminy':'terminów'; }
  function dwa(n){ return (n<10?'0':'')+n; }
  [].forEach.call(d.querySelectorAll('[data-kalm]'),function(k){
    var tpl=k.querySelector('.kalm-tpl'); if(!tpl) return;
    var teraz=new Date(), dni={}, klucze=[];
    [].forEach.call(tpl.content.querySelectorAll('.kalm-k'),function(c){
      var s=c.getAttribute('data-start').split(/[-T:]/);
      if(new Date(+s[0],s[1]-1,+s[2],+s[3],+s[4])<=teraz) return; /* termin minął: nie pokazujemy */
      var dz=c.getAttribute('data-dzien');
      if(!dni[dz]){ dni[dz]=[]; klucze.push(dz); }
      dni[dz].push(c);
    });
    klucze.sort();
    var siatka=k.querySelector('.kalm-dni'), tyt=k.querySelector('.kalm-mies'), wyn=k.querySelector('.kalm-wyn'),
        bp=k.querySelector('[data-kalm-p]'), bn=k.querySelector('[data-kalm-n]');
    var dzis=teraz.getFullYear()+'-'+dwa(teraz.getMonth()+1)+'-'+dwa(teraz.getDate());
    var min=teraz.getFullYear()*12+teraz.getMonth(), max=min, akt=min, wybr='';
    if(klucze.length){ var f=klucze[0].split('-'), l=klucze[klucze.length-1].split('-'); akt=f[0]*12+(f[1]-1); max=Math.max(min,l[0]*12+(l[1]-1)); }
    function ym(m){ return Math.floor(m/12)+'-'+dwa(m%12+1); }
    function wMies(m){ var p=ym(m); return klucze.filter(function(x){ return x.indexOf(p)===0; }); }
    function podpowiedz(){
      var w=wMies(akt), n=0; w.forEach(function(x){ n+=dni[x].length; });
      if(n){ wyn.innerHTML='<p class="kalm-pod">W '+MIES_W[akt%12]+' '+Math.floor(akt/12)+': <b>'+n+' '+terminy(n)+'</b>. Kliknij wyróżniony dzień w kalendarzu, aby zobaczyć szczegóły i zapisać się.</p>'; return; }
      var dalej=klucze.filter(function(x){ return x>ym(akt)+'-31'; })[0];
      wyn.innerHTML='<p class="kalm-pod">W tym miesiącu nie ma jeszcze zaplanowanych terminów.'+(dalej?'<br><button type="button" class="btn-2" data-kalm-idz="'+dalej+'">Najbliższy termin: '+(+dalej.slice(8))+' '+MIES_D[dalej.slice(5,7)-1]+'</button>':'')+'</p>';
    }
    function pokaz(dz){
      wybr=dz;
      var p=dz.split('-'), dt=new Date(+p[0],p[1]-1,+p[2]), h='<h4 class="kalm-dz">'+DNI[dt.getDay()]+', '+(+p[2])+' '+MIES_D[p[1]-1]+' '+p[0]+'</h4><div class="kalm-l"></div>';
      wyn.innerHTML=h;
      var l=wyn.querySelector('.kalm-l');
      dni[dz].forEach(function(c){ l.appendChild(c.cloneNode(true)); });
      [].forEach.call(siatka.querySelectorAll('.kalm-d.ma'),function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-d')===dz?'true':'false'); });
      if(window.matchMedia('(max-width:900px)').matches){ var r=wyn.getBoundingClientRect(); if(r.top>window.innerHeight-120) wyn.scrollIntoView({behavior:'smooth',block:'start'}); }
    }
    function rysuj(){
      var r=Math.floor(akt/12), m=akt%12, start=(new Date(r,m,1).getDay()+6)%7, ile=new Date(r,m+1,0).getDate(), h='';
      tyt.textContent=MIES[m]+' '+r;
      for(var i=0;i<start;i++) h+='<span class="kalm-d" aria-hidden="true"></span>';
      for(var j=1;j<=ile;j++){
        var dz=r+'-'+dwa(m+1)+'-'+dwa(j), cl='kalm-d'+(dz===dzis?' dzis':'')+(dz<dzis?' min':'');
        if(dni[dz]){
          var n=dni[dz].length, wolne=dni[dz].some(function(c){ return c.getAttribute('data-wolne')==='1'; });
          h+='<button type="button" class="'+cl+' ma '+(wolne?'w':'p')+'" data-d="'+dz+'" aria-pressed="false" aria-label="'+j+' '+MIES_D[m]+': '+n+' '+terminy(n)+(wolne?', wolne miejsca':', komplet')+'"><span>'+j+'</span>'+(n>1?'<span class="kalm-n" aria-hidden="true">'+n+'</span>':'')+'</button>';
        } else h+='<span class="'+cl+'"><span>'+j+'</span></span>';
      }
      siatka.innerHTML=h;
      bp.disabled=akt<=min; bn.disabled=akt>=max;
      if(wybr && wybr.indexOf(ym(akt))===0) pokaz(wybr); else podpowiedz();
    }
    siatka.addEventListener('click',function(e){ var b=e.target.closest('.kalm-d.ma'); if(b) pokaz(b.getAttribute('data-d')); });
    wyn.addEventListener('click',function(e){ var b=e.target.closest('[data-kalm-idz]'); if(!b) return; var x=b.getAttribute('data-kalm-idz'); akt=x.slice(0,4)*12+(x.slice(5,7)-1); wybr=''; rysuj(); pokaz(x); });
    bp.addEventListener('click',function(){ if(akt>min){ akt--; rysuj(); } });
    bn.addEventListener('click',function(){ if(akt<max){ akt++; rysuj(); } });
    rysuj();
  });
})();

/* ===== 13.11 (mail 15:43): Informator turystyczny - podmenu w pasku (komputer), akordeon w menu (telefon) i w stopce.
   Wszystkie trzy menu powstają z jednej struktury (inc/nawigacja.php), skrypt tylko rozwija i zwija. ===== */
(function(){
  var d=document, w=window;
  function otworz(b,o){ var l=d.getElementById(b.getAttribute('aria-controls')); b.setAttribute('aria-expanded',o?'true':'false'); if(l) l.hidden=!o; b.parentNode.classList.toggle('otw',o); }
  [].forEach.call(d.querySelectorAll('[data-infm]'),function(m){
    var tryb=m.getAttribute('data-infm'), bb=[].slice.call(m.querySelectorAll('.infm-b'));
    function tylko(b){ bb.forEach(function(x){ otworz(x,x===b); }); }
    bb.forEach(function(b){
      b.addEventListener('click',function(e){
        e.stopPropagation();
        var o=b.getAttribute('aria-expanded')!=='true';
        if(tryb==='top'){ tylko(b); return; }          /* podmenu w pasku: zawsze jedna kategoria widoczna */
        if(tryb==='nav'){ if(o) tylko(b); else otworz(b,false); return; } /* telefon: jedna rozwinięta naraz, krótsza lista */
        otworz(b,o);                                      /* stopka: niezależnie */
      });
      if(tryb==='top'){
        b.addEventListener('mouseenter',function(){ if(w.matchMedia('(hover:hover)').matches) tylko(b); });
        b.addEventListener('focus',function(){ tylko(b); });
      }
    });
    var akt=m.querySelector('.infm-kat.akt .infm-b');
    if(tryb==='top') tylko(akt||bb[0]);
    else if(akt && tryb==='nav') otworz(akt,true);
  });
  var t=d.getElementById('tinf'); if(!t) return;
  var tb=t.querySelector('.tinf-b'), tp=d.getElementById('tinf-p'), tm, otwT=0, hov=w.matchMedia('(hover:hover) and (pointer:fine)');
  function pokaz(o){ clearTimeout(tm); if(o&&tp.hidden) otwT=Date.now(); tp.hidden=!o; tb.setAttribute('aria-expanded',o?'true':'false'); t.classList.toggle('otw',o); }
  tb.addEventListener('click',function(e){ e.stopPropagation(); if(tp.hidden) pokaz(true); else if(Date.now()-otwT>450) pokaz(false); });
  t.addEventListener('mouseenter',function(){ if(hov.matches) pokaz(true); });
  t.addEventListener('mouseleave',function(){ if(hov.matches){ clearTimeout(tm); tm=setTimeout(function(){ pokaz(false); },300); } });
  d.addEventListener('click',function(e){ if(!tp.hidden && !t.contains(e.target)) pokaz(false); });
  d.addEventListener('keydown',function(e){ if(e.key==='Escape' && !tp.hidden){ pokaz(false); tb.focus(); } });
  t.addEventListener('focusout',function(e){ if(e.relatedTarget && !t.contains(e.relatedTarget)) pokaz(false); });
  var bur=d.getElementById('burger'); if(bur) bur.addEventListener('click',function(){ pokaz(false); });
})();

/* ===== 13.11 (mail 15:43): objaśnienia pól formularza pod ikonką "i" =====
   komputer: najechanie na ikonkę; telefon: dotknięcie; klawiatura: Tab + Enter/Spacja; zamykanie: krzyżyk, Esc, kliknięcie obok. */
(function(){
  var d=document, w=window, tipy=[].slice.call(d.querySelectorAll('.tip')); if(!tipy.length) return;
  var hov=w.matchMedia('(hover:hover) and (pointer:fine)'), otw=null;
  function el(t){ return { b:t.querySelector('.tip-b'), p:t.querySelector('.tip-t') }; }
  function nazwij(t){ var p=t.closest('.pole'), l=p&&p.querySelector('label, .zakres-h'); if(l){ el(t).b.setAttribute('aria-label','Wyjaśnienie: '+l.textContent.replace(/\*/g,'').replace(/\s+/g,' ').trim()); } }
  function pokaz(t,o,przypnij){
    var e=el(t);
    if(o){ if(otw&&otw!==t) pokaz(otw,false); var pole=t.closest('.pole'); if(pole){ var r=pole.getBoundingClientRect(), rb=e.b.getBoundingClientRect(); e.p.style.setProperty('--x',Math.max(10,Math.round(rb.left-r.left+rb.width/2-6))+'px'); } otw=t; }
    else if(otw===t) otw=null;
    e.p.hidden=!o; e.b.setAttribute('aria-expanded',o?'true':'false'); t.classList.toggle('przyp',!!(o&&przypnij));
  }
  tipy.forEach(function(t){
    var e=el(t), tm; nazwij(t);
    e.b.addEventListener('click',function(ev){ ev.preventDefault(); ev.stopPropagation(); var o=e.p.hidden||!t.classList.contains('przyp'); pokaz(t,o,o); });
    t.querySelector('.tip-x').addEventListener('click',function(ev){ ev.preventDefault(); ev.stopPropagation(); pokaz(t,false); e.b.focus(); });
    e.b.addEventListener('mouseenter',function(){ if(hov.matches){ clearTimeout(tm); if(e.p.hidden) pokaz(t,true,false); } });
    t.addEventListener('mouseleave',function(){ if(hov.matches && !t.classList.contains('przyp')){ tm=setTimeout(function(){ pokaz(t,false); },200); } });
    t.addEventListener('mouseenter',function(){ clearTimeout(tm); });
  });
  d.addEventListener('click',function(ev){ if(otw && !otw.contains(ev.target)) pokaz(otw,false); });
  d.addEventListener('keydown',function(ev){ if(ev.key==='Escape' && otw){ var t=otw; pokaz(t,false); el(t).b.focus(); } });
})();
