Anylang = (function() {
  var tables = {};

  function Anylang(langDestination, langOrigin){
    this.origin = langOrigin;
    this.langDestination = langDestination;
    if (tables[langDestination] && tables[langDestination][langOrigin]) {
      this.table = tables[langDestination][langOrigin];
    } else {
      console.log("Anylang: language not loaded: "+langDestination);
      this.invalid = true;
    }
  };

  Anylang.addLang = function addLang(equivs) {
    var trie = {children: {}, regEquiv: []};
    
    equivs.table.sort(function(a,b){
      return (a.from.length|0) - (b.from.length|0);
    });

    for (var i=0; i<equivs.table.length; i++) {
      var cur = trie;
      var equiv = equivs.table[i];
      var from = equiv.from;

      if (typeof from === "string"){
        for (var pos=0; pos < from.length; pos++) {
          var letter = from[pos];
          cur.children[letter] = cur.children[letter] || {children:{}, replacement:cur.replacement};
          cur = cur.children[letter];
        }
        cur.replacement = equiv;
      } else {
        trie.regEquiv.push(equiv);
      }
    }

    tables[equivs.langDestination] = tables[equivs.langDestination] || {};
    tables[equivs.langDestination][equivs.langOrigin] = trie;
  }

  Anylang.prototype.equiv = function equiv(txt) {
    var res = [];
    for (var pos=0; pos<txt.length;) {
      var cur = this.table;
      if (txt[pos] === '\\' && pos < txt.length-1) {
        // Consider '\' as an escape character
        res.push(txt[pos+1]);
        pos+=2;
        continue;
      } else if (txt[pos] === '#' && txt[pos+1] === '[') {
        // Do not transliterate text that is between brackets
        for(var i=pos+2,count=1; i<txt.length && count>0; i++) {
          switch(txt[i]){
            case '[': count++; break;
            case ']': count--; break;
            case '\\': i++; break;
          }
        }
        if (count === 0) {
          res.push(txt.substring(pos+1,i));
          pos = i;
          continue;
        }
      }
      for (var i=pos; cur.children.hasOwnProperty(txt[i]); i++){
        cur = cur.children[txt[i]];
      }
      if (cur.replacement) {
        var equiv = cur.replacement;
      } else {
        var equiv = {from: txt[pos], to: txt[pos]};
        for (var i=0; i<this.table.regEquiv.length; i++) {
          var reg = this.table.regEquiv[i];
          var matched = txt.substring(pos).match(reg.from); 
          if (matched !== null && matched.index === 0) {
            equiv.from = matched[0];
            equiv.to = reg.to;
            break;
          }
        }
      }
      res.push(equiv.to); 
      pos += equiv.from.length;
    }
    return res.join("");
  }
  
  if (typeof document !== "undefined") {

    function bindToInput(input, target) {
      var data = input.dataset;
      var langs = data.anylangTo + '-' + data.anylangFrom;
      var anylang = new Anylang(data.anylangTo, data.anylangFrom);
      var change = function anylang_change(evt){
        var curlangs = data.anylangTo + '-' + data.anylangFrom;
        if (curlangs !== langs) {
          langs = curlangs;
          anylang = new Anylang(data.anylangTo, data.anylangFrom);
        }
        var trans = (anylang.invalid) ? input.value : anylang.equiv(input.value);
        var printed = (anylang.invalid) ? "" : trans;
        if (target !== null) {
          if (target.value !== void 0) {
            target.value = printed;
          } else {
            target.innerHTML = printed;
          }
        }
        data.anylangEquiv = trans;
      }
      change();
      input._anylang_update_equiv = change;
      input.addEventListener("keyup", change);
      input.addEventListener("change", change);
    }

    Anylang.attach = bindToInput;
    Anylang.detach = function Anylang_detach(input) {
      input.removeEventListener("keyup", input._anylang_update_equiv);
      input.removeEventListener("change", input._anylang_update_equiv);
    }

    document.addEventListener("DOMContentLoaded", function(event) {
      var inputs = document.querySelectorAll("[data-anylang-to]");
      for (var i=0; i<inputs.length; i++) {
        var input = inputs[i];
        var target = document.getElementById(input.dataset.anylangTarget);
        bindToInput(input, target);
      }
    });
  }
  return Anylang;
})();
