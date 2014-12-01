Anylang = (function() {
  var tables = {};

  function Anylang(langDestination, langOrigin){
    this.origin = langOrigin;
    this.langDestination = langDestination;
    this.table = tables[langDestination][langOrigin];
  };

  Anylang.addLang = function addLang(equivs) {
    tables[equivs.langDestination] = tables[equivs.langDestination] || {};
    tables[equivs.langDestination][equivs.langOrigin] = equivs.table.map(function(eq){
      if (typeof eq.from === "string") {
        eq.from = new RegExp(eq.from, 'g');
        return eq;
      }
      return eq;
    });
  }

  Anylang.prototype.equiv = function equiv(txt) {
    for (var j=0; j<this.table.length; j++) {
        var repl = this.table[j];
        txt = txt.replace(repl.from, repl.to);
    }
    return txt;
  }
  
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function(event) {
      var inputs = document.querySelectorAll("input[data-anylang-to]");
      for (var i=0; i<inputs.length; i++) {
        var input = inputs[i];
        var change = (function (input) {
          var data = input.dataset;
          var anylang = new Anylang(data.anylangTo, data.anylangFrom);
          var target = document.getElementById(data.anylangTarget);
          return function(evt){
            var trans = anylang.equiv(input.value);
            data.anylangEquiv = trans;
            if (target !== null) {
              if (target.value !== void 0) {
                target.value = trans;
              } else {
                target.innerHTML = trans;
              }
            }
          }
        })(input);
        input.addEventListener("keyup", change);
        input.addEventListener("change", change);
      }
    });
  }
  return Anylang;
})();
