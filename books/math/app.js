/* ============================================================================
   tex2mml — a compact, dependency-free LaTeX → MathML translator.
   Covers the subset of TeX actually used across this study book: fractions,
   roots, matrices, big operators, accents, delimiters, alphabets and ~400
   symbols. Emits MathML Core, which every current browser renders natively,
   so the book needs no font downloads and no external script.
   ========================================================================= */
(function (global) {
  'use strict';

  /* ---------- symbol tables ------------------------------------------- */

  var GREEK = {
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ϵ', varepsilon: 'ε',
    zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ',
    varkappa: 'ϰ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο',
    pi: 'π', varpi: 'ϖ', rho: 'ρ', varrho: 'ϱ', sigma: 'σ', varsigma: 'ς',
    tau: 'τ', upsilon: 'υ', phi: 'ϕ', varphi: 'φ', chi: 'χ', psi: 'ψ',
    omega: 'ω',
    Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π',
    Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω'
  };

  // Ordinary symbols → <mi> (identifier-ish, non-spacing)
  var ORD = {
    infty: '∞', partial: '∂', nabla: '∇', emptyset: '∅', varnothing: '∅',
    aleph: 'ℵ', beth: 'ℶ', ell: 'ℓ', hbar: 'ℏ', hslash: 'ℏ', wp: '℘',
    Re: 'ℜ', Im: 'ℑ', imath: 'ı', jmath: 'ȷ', angle: '∠', measuredangle: '∡',
    triangle: '△', blacktriangle: '▲', square: '□', blacksquare: '■',
    Box: '□', diamondsuit: '♢', heartsuit: '♡', clubsuit: '♣', spadesuit: '♠',
    flat: '♭', natural: '♮', sharp: '♯', checkmark: '✓', dag: '†', ddag: '‡',
    degree: '°', prime: '′', backprime: '‵', top: '⊤', bot: '⊥',
    forall: '∀', exists: '∃', nexists: '∄', complement: '∁', therefore: '∴',
    because: '∵', surd: '√', eth: 'ð', mho: '℧', circledS: 'Ⓢ',
    dots: '…', ldots: '…', cdots: '⋯', vdots: '⋮', ddots: '⋱', dotsb: '⋯',
    dotsc: '…', dotsm: '⋯', dotsi: '⋯'
  };

  // Binary operators → <mo> with medium spacing
  var BIN = {
    times: '×', div: '÷', pm: '±', mp: '∓', cdot: '⋅', ast: '∗', star: '⋆',
    circ: '∘', bullet: '∙', oplus: '⊕', ominus: '⊖', otimes: '⊗',
    oslash: '⊘', odot: '⊙', circledcirc: '⊚', boxplus: '⊞', boxtimes: '⊠',
    cap: '∩', cup: '∪', uplus: '⊎', sqcap: '⊓', sqcup: '⊔', wedge: '∧',
    vee: '∨', land: '∧', lor: '∨', setminus: '∖', smallsetminus: '∖',
    backslash: '\\', dagger: '†', ddagger: '‡', diamond: '⋄', bigtriangleup: '△',
    bigtriangledown: '▽', triangleleft: '◁', triangleright: '▷',
    lhd: '⊲', rhd: '⊳', unlhd: '⊴', unrhd: '⊵', amalg: '⨿', wr: '≀'
  };

  // Relations → <mo> with thick spacing
  var REL = {
    lt: '<', gt: '>',
    le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', equiv: '≡',
    approx: '≈', approxeq: '≊', cong: '≅', simeq: '≃', sim: '∼', asymp: '≍',
    doteq: '≐', propto: '∝', parallel: '∥', nparallel: '∦', perp: '⊥',
    mid: '∣', nmid: '∤', vdash: '⊢', dashv: '⊣', models: '⊨', vDash: '⊨',
    in: '∈', notin: '∉', ni: '∋', subset: '⊂', supset: '⊃',
    subseteq: '⊆', supseteq: '⊇', subsetneq: '⊊', supsetneq: '⊋',
    nsubseteq: '⊈', sqsubset: '⊏', sqsubseteq: '⊑', sqsupseteq: '⊒',
    prec: '≺', succ: '≻', preceq: '⪯', succeq: '⪰', precsim: '≾', succsim: '≿',
    ll: '≪', gg: '≫', lll: '⋘', ggg: '⋙', lesssim: '≲', gtrsim: '≳',
    leqslant: '⩽', geqslant: '⩾', ngtr: '≯', nless: '≮', nleq: '≰', ngeq: '≱',
    between: '≬', bowtie: '⋈', frown: '⌢', smile: '⌣', triangleq: '≜',
    equivalent: '≡', coloneqq: '≔', eqqcolon: '≕', nsim: '≁', ncong: '≇'
  };

  // Arrows → <mo>
  var ARROW = {
    to: '→', rightarrow: '→', Rightarrow: '⇒', leftarrow: '←', gets: '←',
    Leftarrow: '⇐', leftrightarrow: '↔', Leftrightarrow: '⇔',
    longrightarrow: '⟶', Longrightarrow: '⟹', longleftarrow: '⟵',
    Longleftarrow: '⟸', longleftrightarrow: '⟷', Longleftrightarrow: '⟺',
    implies: '⟹', impliedby: '⟸', iff: '⟺', mapsto: '↦', longmapsto: '⟼',
    uparrow: '↑', downarrow: '↓', updownarrow: '↕', Uparrow: '⇑',
    Downarrow: '⇓', nearrow: '↗', searrow: '↘', swarrow: '↙', nwarrow: '↖',
    hookrightarrow: '↪', hookleftarrow: '↩', rightharpoonup: '⇀',
    rightleftharpoons: '⇌', twoheadrightarrow: '↠', rightsquigarrow: '⇝',
    leadsto: '⇝', overleftrightarrow: '↔', nrightarrow: '↛', leftrightarrows: '⇆'
  };

  // Stretchy delimiters
  var DELIM = {
    lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉',
    langle: '⟨', rangle: '⟩', lvert: '|', rvert: '|', lVert: '‖', rVert: '‖',
    vert: '|', Vert: '‖', '|': '|', '\\|': '‖',
    lbrace: '{', rbrace: '}', lbrack: '[', rbrack: ']',
    ulcorner: '⌜', urcorner: '⌝', llcorner: '⌞', lrcorner: '⌟',
    lgroup: '⟮', rgroup: '⟯'
  };

  // Large operators (get munderover in display style)
  var BIGOP = {
    sum: '∑', prod: '∏', coprod: '∐', bigcup: '⋃', bigcap: '⋂',
    bigsqcup: '⨆', bigvee: '⋁', bigwedge: '⋀', bigoplus: '⨁',
    bigotimes: '⨂', bigodot: '⨀', biguplus: '⨄'
  };

  // Integrals (get msubsup — limits sit beside the sign, TeX convention)
  var INTOP = {
    int: '∫', iint: '∬', iiint: '∭', iiiint: '⨌', oint: '∮', oiint: '∯',
    idotsint: '∫⋯∫'
  };

  // Upright named functions
  var FUNCS = ('sin cos tan cot sec csc sinh cosh tanh coth arcsin arccos ' +
    'arctan arcsec arccsc arccot log ln lg exp det dim ker deg hom arg ' +
    'Pr sgn tr rank span diag erf erfc Var Cov corr plim ess').split(' ');

  // Named functions that take limits underneath
  var LIMFUNCS = ('lim limsup liminf max min sup inf argmax argmin injlim ' +
    'projlim varlimsup varliminf').split(' ');

  var ACCENTS = {
    hat: '^', widehat: '^', check: 'ˇ', widecheck: 'ˇ', tilde: '˜',
    widetilde: '˜', acute: '´', grave: '`', dot: '˙', ddot: '¨', dddot: '⃛',
    breve: '˘', bar: 'ˉ', vec: '→', mathring: '˚'
  };

  var OVER_STRETCH = {
    overline: '‾', overrightarrow: '→', overleftarrow: '←',
    overleftrightarrow: '↔', overbrace: '⏞'
  };
  var UNDER_STRETCH = {
    underline: '_', underbrace: '⏟', underrightarrow: '→', underleftarrow: '←'
  };

  var SPACES = {
    ',': '0.1667em', ':': '0.2222em', ';': '0.2778em', '>': '0.2222em',
    '!': '-0.1667em', ' ': '0.25em', quad: '1em', qquad: '2em',
    thinspace: '0.1667em', medspace: '0.2222em', thickspace: '0.2778em',
    negthinspace: '-0.1667em', enspace: '0.5em', nobreakspace: '0.25em',
    space: '0.25em'
  };

  /* ---------- Unicode math alphabets ---------------------------------- */

  function shift(ch, upperBase, lowerBase, digitBase) {
    var c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90 && upperBase) return cp(upperBase + (c - 65));
    if (c >= 97 && c <= 122 && lowerBase) return cp(lowerBase + (c - 97));
    if (c >= 48 && c <= 57 && digitBase) return cp(digitBase + (c - 48));
    return ch;
  }
  function cp(n) { return String.fromCodePoint(n); }

  // Characters missing from the SMP planes, supplied by legacy BMP letters.
  var HOLES = {
    'double-struck': { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' },
    'script': {
      B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ',
      e: 'ℯ', g: 'ℊ', o: 'ℴ'
    },
    'fraktur': { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' },
    'italic': { h: 'ℎ' }
  };

  var ALPHABETS = {
    'bold':            function (c) { return shift(c, 0x1D400, 0x1D41A, 0x1D7CE); },
    'italic':          function (c) { return shift(c, 0x1D434, 0x1D44E, null); },
    'bold-italic':     function (c) { return shift(c, 0x1D468, 0x1D482, null); },
    'script':          function (c) { return shift(c, 0x1D49C, 0x1D4B6, null); },
    'bold-script':     function (c) { return shift(c, 0x1D4D0, 0x1D4EA, null); },
    'fraktur':         function (c) { return shift(c, 0x1D504, 0x1D51E, null); },
    'double-struck':   function (c) { return shift(c, 0x1D538, 0x1D552, 0x1D7D8); },
    'sans-serif':      function (c) { return shift(c, 0x1D5A0, 0x1D5BA, 0x1D7E2); },
    'bold-sans-serif': function (c) { return shift(c, 0x1D5D4, 0x1D5EE, 0x1D7EC); },
    'monospace':       function (c) { return shift(c, 0x1D670, 0x1D68A, 0x1D7F6); }
  };

  // Greek has its own styled ranges in the Mathematical Alphanumeric block.
  var GREEK_RANGE = {
    'bold':            { up: 0x1D6A8, lo: 0x1D6C2 },
    'italic':          { up: 0x1D6E2, lo: 0x1D6FC },
    'bold-italic':     { up: 0x1D71C, lo: 0x1D736 },
    'bold-sans-serif': { up: 0x1D756, lo: 0x1D770 }
  };

  function toAlphabet(str, name) {
    if (!ALPHABETS[name]) return str;
    var holes = HOLES[name] || {};
    var gr = GREEK_RANGE[name];
    var out = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (holes[ch]) { out += holes[ch]; continue; }
      var code = ch.charCodeAt(0);
      if (gr) {
        if (code >= 0x391 && code <= 0x3A9) { out += cp(gr.up + (code - 0x391)); continue; }
        if (code >= 0x3B1 && code <= 0x3C9) { out += cp(gr.lo + (code - 0x3B1)); continue; }
        if (code === 0x3F5) { out += cp(gr.lo + 25); continue; }   // \epsilon
        if (code === 0x3D5) { out += cp(gr.lo + 29); continue; }   // \phi
      }
      out += ALPHABETS[name](ch);
    }
    return out;
  }

  /* ---------- escaping ------------------------------------------------- */

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- tokenizer ------------------------------------------------ */

  // Commands whose single argument is literal text, not math. The tokenizer
  // grabs the argument verbatim so that spaces inside \text{...} survive.
  var ARGTEXT = {
    text: 1, textup: 1, textrm: 1, textnormal: 1, mbox: 1, textsf: 1,
    textbf: 1, textit: 1, texttt: 1, mathrm: 1, operatorname: 1,
    mathbf: 1, bm: 1, boldsymbol: 1, mathbb: 1, Bbb: 1, mathcal: 1,
    mathscr: 1, mathfrak: 1, mathsf: 1, mathtt: 1, mathit: 1
  };

  function readBalanced(src, i) {
    // src[i] must be '{'. Returns [raw, nextIndex].
    var depth = 0, out = '', n = src.length;
    for (; i < n; i++) {
      var ch = src[i];
      if (ch === '\\' && i + 1 < n) { out += ch + src[i + 1]; i++; continue; }
      if (ch === '{') { depth++; if (depth === 1) continue; }
      if (ch === '}') { depth--; if (depth === 0) return [out, i + 1]; }
      out += ch;
    }
    return [out, n];
  }

  function tokenize(src) {
    var toks = [], i = 0, n = src.length;
    while (i < n) {
      var c = src[i];
      if (c === '\\') {
        var m = /^\\([A-Za-z]+)/.exec(src.slice(i));
        if (m) {
          var name = m[1];
          if (ARGTEXT[name]) {
            var j = i + m[0].length;
            while (j < n && /\s/.test(src[j])) j++;
            if (src[j] === '{') {
              var rb = readBalanced(src, j);
              toks.push({ t: 'argtext', cmd: name, v: rb[0] });
              i = rb[1]; continue;
            }
            if (j < n && /[A-Za-z0-9]/.test(src[j])) {
              toks.push({ t: 'argtext', cmd: name, v: src[j] });
              i = j + 1; continue;
            }
            // Unbraced command argument, e.g. \boldsymbol\mu
            var cm = /^\\[A-Za-z]+/.exec(src.slice(j));
            if (cm) {
              toks.push({ t: 'argtext', cmd: name, v: cm[0] });
              i = j + cm[0].length; continue;
            }
          }
          toks.push({ t: 'cmd', v: name }); i += m[0].length; continue;
        }
        var c2 = src[i + 1];
        if (c2 === undefined) { i++; continue; }
        if (c2 === '\\') { toks.push({ t: 'newline' }); i += 2; continue; }
        toks.push({ t: 'cmd', v: c2, lit: true }); i += 2; continue;
      }
      if (c === '{') { toks.push({ t: '{' }); i++; continue; }
      if (c === '}') { toks.push({ t: '}' }); i++; continue; }
      if (c === '^') { toks.push({ t: '^' }); i++; continue; }
      if (c === '_') { toks.push({ t: '_' }); i++; continue; }
      if (c === '&') { toks.push({ t: '&' }); i++; continue; }
      if (c === '~') { toks.push({ t: 'space', v: '0.25em' }); i++; continue; }
      if (c === "'") {
        var k = 0; while (src[i + k] === "'") k++;
        toks.push({ t: 'prime', v: k }); i += k; continue;
      }
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9]/.test(c)) {
        var mm = /^[0-9]+(?:[.,][0-9]+)*/.exec(src.slice(i));
        toks.push({ t: 'num', v: mm[0] }); i += mm[0].length; continue;
      }
      if (/[A-Za-z]/.test(c)) { toks.push({ t: 'ident', v: c }); i++; continue; }
      toks.push({ t: 'op', v: c }); i++;
    }
    return toks;
  }

  /* ---------- parser --------------------------------------------------- */

  function Parser(toks, opts) {
    this.toks = toks; this.i = 0; this.display = !!(opts && opts.display);
  }
  Parser.prototype.peek = function () { return this.toks[this.i]; };
  Parser.prototype.next = function () { return this.toks[this.i++]; };
  Parser.prototype.eof = function () { return this.i >= this.toks.length; };

  // Parse until one of the stop conditions; returns array of MathML strings.
  Parser.prototype.parseList = function (stop) {
    var out = [];
    while (!this.eof()) {
      var tk = this.peek();
      if (tk.t === '}' && stop !== 'eof') { break; }
      if (stop === 'env' && tk.t === 'cmd' && tk.v === 'end') break;
      if (stop === 'right' && tk.t === 'cmd' && (tk.v === 'right' || tk.v === 'middle')) break;
      if (stop === 'cell' && (tk.t === '&' || tk.t === 'newline')) break;
      if (stop === 'cell' && tk.t === 'cmd' && tk.v === 'end') break;
      var node = this.parseAtomWithScripts();
      if (node) out.push(node);
    }
    return out;
  };

  Parser.prototype.parseGroup = function () {
    // Reads one {...} group or a single atom, returns MathML string (wrapped).
    var tk = this.peek();
    if (!tk) return '<mrow></mrow>';
    if (tk.t === '{') {
      this.next();
      var list = this.parseList('group');
      if (this.peek() && this.peek().t === '}') this.next();
      return wrap(list);
    }
    // An unbraced macro argument is exactly ONE token in TeX, so \tfrac12 is a
    // half - not a fraction with numerator 12 over whatever follows it. The
    // tokenizer groups digit runs, so split one digit off and leave the rest.
    if (tk.t === 'num' && String(tk.v).length > 1) {
      var run = String(tk.v);
      tk.v = run.slice(1);
      return '<mn>' + run.charAt(0) + '</mn>';
    }
    var a = this.parseAtomWithScripts();
    return a || '<mrow></mrow>';
  };

  // Argument of ^ or _ : a braced group, or exactly one atom. Crucially it does
  // NOT absorb a following script, so x_i^2 stays x with sub i and sup 2.
  Parser.prototype.parseScriptArg = function () {
    var tk = this.peek();
    if (!tk) return '<mrow></mrow>';
    if (tk.t === '{') {
      this.next();
      var list = this.parseList('group');
      if (this.peek() && this.peek().t === '}') this.next();
      return wrap(list);
    }
    var a = this.parseAtom();
    return a || '<mrow></mrow>';
  };

  // Reads a raw {...} as plain text (for \text, \operatorname, \begin{})
  Parser.prototype.rawGroup = function () {
    var tk = this.peek();
    if (!tk) return '';
    var out = '', depth = 0;
    if (tk.t === '{') { this.next(); depth = 1; } else {
      this.next();
      return tk.v !== undefined ? String(tk.v) : '';
    }
    while (!this.eof() && depth > 0) {
      var t = this.next();
      if (t.t === '{') { depth++; out += '{'; continue; }
      if (t.t === '}') { depth--; if (depth === 0) break; out += '}'; continue; }
      if (t.t === 'cmd') {
        if (t.v === 'quad') { out += ' '; continue; }
        if (t.v === ',' || t.v === ' ' || t.v === ';' || t.v === ':') { out += ' '; continue; }
        if (t.lit) { out += t.v; continue; }
        if (GREEK[t.v]) { out += GREEK[t.v]; continue; }
        if (ORD[t.v]) { out += ORD[t.v]; continue; }
        if (REL[t.v]) { out += REL[t.v]; continue; }
        if (BIN[t.v]) { out += BIN[t.v]; continue; }
        if (ARROW[t.v]) { out += ARROW[t.v]; continue; }
        out += ' ';
        continue;
      }
      if (t.t === 'space') { out += ' '; continue; }
      if (t.t === 'newline') { out += ' '; continue; }
      if (t.t === '^') { out += '^'; continue; }
      if (t.t === '_') { out += '_'; continue; }
      if (t.t === '&') { out += '&'; continue; }
      if (t.t === 'prime') { out += "'".repeat(t.v); continue; }
      out += (t.v !== undefined ? t.v : '');
    }
    return out;
  };

  function wrap(list) {
    if (list.length === 1) return list[0];
    return '<mrow>' + list.join('') + '</mrow>';
  }

  Parser.prototype.parseAtomWithScripts = function () {
    var base = this.parseAtom();
    if (base === null) return null;
    return this.attachScripts(base, false);
  };

  Parser.prototype.attachScripts = function (base, isBig) {
    var sub = null, sup = null, primes = 0;
    for (;;) {
      var tk = this.peek();
      if (!tk) break;
      if (tk.t === 'prime') { primes += tk.v; this.next(); continue; }
      if (tk.t === '^') { this.next(); sup = this.parseScriptArg(); continue; }
      if (tk.t === '_') { this.next(); sub = this.parseScriptArg(); continue; }
      break;
    }
    if (primes) {
      var p = '<mo lspace="0" rspace="0">' + '′'.repeat(primes) + '</mo>';
      sup = sup ? '<mrow>' + p + sup + '</mrow>' : p;
    }
    if (sub === null && sup === null) return base;
    var under = isBig === 'under' || (isBig === 'big' && this.display);
    if (under) {
      if (sub !== null && sup !== null) return '<munderover>' + base + sub + sup + '</munderover>';
      if (sub !== null) return '<munder>' + base + sub + '</munder>';
      return '<mover>' + base + sup + '</mover>';
    }
    if (sub !== null && sup !== null) return '<msubsup>' + base + sub + sup + '</msubsup>';
    if (sub !== null) return '<msub>' + base + sub + '</msub>';
    return '<msup>' + base + sup + '</msup>';
  };

  var ALPHA_CMD = {
    mathbf: 'bold', bm: 'bold-italic', boldsymbol: 'bold-italic',
    mathbb: 'double-struck', Bbb: 'double-struck',
    mathcal: 'script', mathscr: 'script', mathfrak: 'fraktur',
    mathsf: 'sans-serif', mathtt: 'monospace', mathit: 'italic',
    textbf: 'bold', textit: 'italic', texttt: 'monospace'
  };

  // Flatten the handful of escapes that appear inside textual arguments.
  var DETEX = {
    quad: '  ', qquad: '    ', ',': ' ', ';': ' ', ':': ' ', '%': '%', '$': '$',
    '&': '&', '#': '#', '_': '_', '{': '{', '}': '}', ' ': ' '
  };
  function detex(raw) {
    return raw.replace(/\\([A-Za-z]+|.)/g, function (_, name) {
      if (DETEX[name] !== undefined) return DETEX[name];
      if (GREEK[name]) return GREEK[name];
      if (ORD[name]) return ORD[name];
      if (REL[name]) return REL[name];
      if (BIN[name]) return BIN[name];
      if (ARROW[name]) return ARROW[name];
      return ' ';
    }).replace(/[ \t\n]+/g, ' ');
  }

  // Turn the verbatim argument of a \text{...}-style command into MathML.
  Parser.prototype.renderArgText = function (cmd, raw) {
    var body = detex(raw);
    if (cmd === 'text' || cmd === 'textup' || cmd === 'mbox' || cmd === 'textsf' ||
        cmd === 'textrm' || cmd === 'textnormal') {
      // A leading/trailing space is meaningful inside \text; keep it visible.
      return '<mtext>' + esc(body).replace(/^ /, '\u00a0').replace(/ $/, '\u00a0') + '</mtext>';
    }
    if (cmd === 'mathrm' || cmd === 'operatorname') {
      return '<mi mathvariant="normal">' + esc(body.trim()) + '</mi>';
    }
    var conv = toAlphabet(body, ALPHA_CMD[cmd]);
    if (cmd === 'textbf' || cmd === 'textit' || cmd === 'texttt')
      return '<mtext>' + esc(conv) + '</mtext>';
    // The glyphs already carry their style as Unicode, so pin them upright: a
    // one-character <mi> would otherwise be italicised again by default.
    return '<mi mathvariant="normal">' + esc(conv) + '</mi>';
  };

  var BIGSIZE = { big: '1.2em', Big: '1.8em', bigg: '2.4em', Bigg: '3em' };

  Parser.prototype.parseAtom = function () {
    var tk = this.next();
    if (!tk) return null;

    switch (tk.t) {
      case 'argtext': return this.renderArgText(tk.cmd, tk.v);
      case 'num': return '<mn>' + esc(tk.v) + '</mn>';
      case 'ident': return '<mi>' + esc(tk.v) + '</mi>';
      case 'space': return '<mspace width="' + tk.v + '"/>';
      case 'newline': return '';
      case '&': return '';
      case '{': {
        var list = this.parseList('group');
        if (this.peek() && this.peek().t === '}') this.next();
        return wrap(list);
      }
      case '}': return '';
      case 'prime': return '<mo>' + '′'.repeat(tk.v) + '</mo>';
      case 'op': {
        var v = tk.v;
        if (v === '-') return '<mo>−</mo>';
        if (v === '(' || v === '[') return '<mo stretchy="false">' + esc(v) + '</mo>';
        if (v === ')' || v === ']') return '<mo stretchy="false">' + esc(v) + '</mo>';
        if (v === '|') return '<mo stretchy="false">|</mo>';
        if (v === ',') return '<mo separator="true">,</mo>';
        return '<mo>' + esc(v) + '</mo>';
      }
      case 'cmd': return this.parseCommand(tk);
    }
    return '';
  };

  Parser.prototype.parseCommand = function (tk) {
    var c = tk.v, self = this;

    if (tk.lit) {
      if (c === '{' || c === '}') return '<mo stretchy="false">' + esc(c) + '</mo>';
      if (c === '%' || c === '#' || c === '$') return '<mi>' + esc(c) + '</mi>';
      if (c === '_') return '<mo>_</mo>';
      if (c === '&') return '<mo>&amp;</mo>';
      if (SPACES[c] !== undefined) return '<mspace width="' + SPACES[c] + '"/>';
      if (c === '|') return '<mo stretchy="false">‖</mo>';
      return '<mo>' + esc(c) + '</mo>';
    }

    if (SPACES[c] !== undefined) return '<mspace width="' + SPACES[c] + '"/>';

    /* --- fractions --- */
    if (c === 'frac' || c === 'dfrac' || c === 'tfrac' || c === 'cfrac') {
      var a = this.parseGroup(), b = this.parseGroup();
      var f = '<mfrac>' + a + b + '</mfrac>';
      if (c === 'dfrac' || c === 'cfrac') return '<mstyle displaystyle="true">' + f + '</mstyle>';
      if (c === 'tfrac') return '<mstyle displaystyle="false" scriptlevel="0">' + f + '</mstyle>';
      return f;
    }
    if (c === 'binom' || c === 'dbinom' || c === 'tbinom' || c === 'choose') {
      var n1 = this.parseGroup(), k1 = this.parseGroup();
      return '<mrow><mo stretchy="true">(</mo><mfrac linethickness="0">' + n1 + k1 +
        '</mfrac><mo stretchy="true">)</mo></mrow>';
    }
    if (c === 'over') return '<mo>/</mo>';

    /* --- roots --- */
    if (c === 'sqrt') {
      if (this.peek() && this.peek().t === 'op' && this.peek().v === '[') {
        this.next();
        var idx = [];
        while (!this.eof() && !(this.peek().t === 'op' && this.peek().v === ']')) {
          var nd = this.parseAtomWithScripts(); if (nd) idx.push(nd);
        }
        if (this.peek()) this.next();
        return '<mroot>' + this.parseGroup() + wrap(idx) + '</mroot>';
      }
      return '<msqrt>' + this.parseGroup() + '</msqrt>';
    }

    /* --- accents --- */
    if (ACCENTS[c]) {
      var body = this.parseGroup();
      var stretchy = (c === 'widehat' || c === 'widetilde' || c === 'widecheck');
      return '<mover accent="true">' + body + '<mo stretchy="' + (stretchy ? 'true' : 'false') +
        '">' + esc(ACCENTS[c]) + '</mo></mover>';
    }
    if (OVER_STRETCH[c]) {
      var ob = this.parseGroup();
      var node = '<mover accent="' + (c === 'overbrace' ? 'false' : 'true') + '">' + ob +
        '<mo stretchy="true">' + esc(OVER_STRETCH[c]) + '</mo></mover>';
      if (c === 'overbrace') return this.attachScripts(node, 'under');
      return node;
    }
    if (UNDER_STRETCH[c]) {
      var ub = this.parseGroup();
      var un = '<munder accentunder="' + (c === 'underbrace' ? 'false' : 'true') + '">' + ub +
        '<mo stretchy="true">' + esc(UNDER_STRETCH[c]) + '</mo></munder>';
      if (c === 'underbrace') return this.attachScripts(un, 'under');
      return un;
    }
    if (c === 'overset' || c === 'stackrel') {
      var top = this.parseGroup(), bot = this.parseGroup();
      return '<mover>' + bot + top + '</mover>';
    }
    if (c === 'underset') {
      var u1 = this.parseGroup(), u2 = this.parseGroup();
      return '<munder>' + u2 + u1 + '</munder>';
    }
    if (c === 'boxed' || c === 'fbox') {
      return '<mrow class="tex-boxed">' + this.parseGroup() + '</mrow>';
    }
    if (c === 'phantom') return '<mphantom>' + this.parseGroup() + '</mphantom>';
    if (c === 'hphantom') return '<mphantom>' + this.parseGroup() + '</mphantom>';
    if (c === 'not') {
      var nxt = this.parseAtom();
      return '<mrow class="tex-not">' + nxt + '</mrow>';
    }

    /* --- extensible arrows --- */
    if (/^x(rightarrow|leftarrow|Rightarrow|leftrightarrow|mapsto|hookrightarrow)$/.test(c)) {
      var glyph = { xrightarrow: '⟶', xleftarrow: '⟵', xRightarrow: '⟹',
        xleftrightarrow: '⟷', xmapsto: '⟼', xhookrightarrow: '↪' }[c] || '⟶';
      var below = null;
      if (this.peek() && this.peek().t === 'op' && this.peek().v === '[') {
        this.next(); var bl = [];
        while (!this.eof() && !(this.peek().t === 'op' && this.peek().v === ']')) {
          var b2 = this.parseAtomWithScripts(); if (b2) bl.push(b2);
        }
        if (this.peek()) this.next(); below = wrap(bl);
      }
      var above = this.parseGroup();
      var arr = '<mo stretchy="true">' + glyph + '</mo>';
      if (below) return '<munderover>' + arr + below + above + '</munderover>';
      return '<mover>' + arr + above + '</mover>';
    }

    /* --- delimiters --- */
    if (c === 'left') {
      var open = this.readDelim();
      var inner = this.parseList('right');
      var parts = [open === '' ? '<mo stretchy="true"></mo>' :
        '<mo stretchy="true" fence="true">' + esc(open) + '</mo>'].concat(inner);
      while (this.peek() && this.peek().t === 'cmd' && this.peek().v === 'middle') {
        this.next();
        var md = this.readDelim();
        parts.push('<mo stretchy="true" fence="true">' + esc(md) + '</mo>');
        parts = parts.concat(this.parseList('right'));
      }
      if (this.peek() && this.peek().t === 'cmd' && this.peek().v === 'right') {
        this.next();
        var close = this.readDelim();
        parts.push(close === '' ? '<mo stretchy="true"></mo>' :
          '<mo stretchy="true" fence="true">' + esc(close) + '</mo>');
      }
      return '<mrow>' + parts.join('') + '</mrow>';
    }
    if (c === 'right' || c === 'middle') { this.readDelim(); return ''; }

    var bigm = /^(bigg?|Bigg?)([lrm])?$/.exec(c);
    if (bigm) {
      var size = BIGSIZE[bigm[1]] || '1.2em';
      var d = this.readDelim();
      return '<mo stretchy="false" style="font-size:' + size + ';line-height:1">' + esc(d) + '</mo>';
    }

    if (DELIM[c]) {
      return '<mo stretchy="false" fence="true">' + esc(DELIM[c]) + '</mo>';
    }

    /* --- symbols --- */
    if (GREEK[c]) return '<mi>' + esc(GREEK[c]) + '</mi>';
    if (ORD[c]) return '<mi mathvariant="normal">' + esc(ORD[c]) + '</mi>';
    if (c === 'neg' || c === 'lnot') return '<mo lspace="0" rspace="0.1em">¬</mo>';
    if (BIN[c]) return '<mo>' + esc(BIN[c]) + '</mo>';
    if (REL[c]) return '<mo>' + esc(REL[c]) + '</mo>';
    if (ARROW[c]) return '<mo>' + esc(ARROW[c]) + '</mo>';

    /* --- operators with limits --- */
    if (BIGOP[c]) {
      var op = '<mo largeop="true" movablelimits="true">' + esc(BIGOP[c]) + '</mo>';
      return this.attachScripts(op, 'big');
    }
    if (INTOP[c]) {
      var iop = '<mo largeop="true" stretchy="false">' + esc(INTOP[c]) + '</mo>';
      return this.attachScripts(iop, false);
    }
    if (LIMFUNCS.indexOf(c) >= 0) {
      var lop = '<mo movablelimits="true" lspace="0" rspace="0.1667em">' + esc(c) + '</mo>';
      return this.attachScripts(lop, 'big');
    }
    if (FUNCS.indexOf(c) >= 0) {
      return '<mi mathvariant="normal" class="tex-func">' + esc(c) + '</mi>';
    }
    if (c === 'gcd' || c === 'lcm') {
      var g = '<mo movablelimits="true" lspace="0" rspace="0.1667em">' + c + '</mo>';
      return this.attachScripts(g, 'big');
    }

    /* --- modular arithmetic --- */
    if (c === 'bmod') return '<mo lspace="0.2222em" rspace="0.2222em">mod</mo>';
    if (c === 'pmod') {
      var mv = this.parseGroup();
      return '<mspace width="0.8em"/><mo stretchy="false">(</mo><mi mathvariant="normal">mod</mi>' +
        '<mspace width="0.25em"/>' + mv + '<mo stretchy="false">)</mo>';
    }
    if (c === 'mod') return '<mo lspace="0.2222em" rspace="0.2222em">mod</mo>';

    /* --- style --- */
    if (c === 'displaystyle') {
      var rest = this.parseList('group');
      return '<mstyle displaystyle="true">' + rest.join('') + '</mstyle>';
    }
    if (c === 'textstyle' || c === 'scriptstyle' || c === 'scriptscriptstyle') {
      var lvl = c === 'textstyle' ? 0 : (c === 'scriptstyle' ? 1 : 2);
      var r2 = this.parseList('group');
      return '<mstyle displaystyle="false" scriptlevel="' + lvl + '">' + r2.join('') + '</mstyle>';
    }
    if (c === 'limits' || c === 'nolimits') return '';
    if (c === 'hline' || c === 'nonumber' || c === 'notag' || c === 'label') {
      if (c === 'label') this.rawGroup();
      return '';
    }

    /* --- environments --- */
    if (c === 'begin') return this.parseEnv(this.rawGroup());
    if (c === 'end') { this.rawGroup(); return ''; }

    /* --- small extras: equation tags, colour (ignored), stacked limits --- */
    if (c === 'tag') return '<mspace width="2em"/><mtext>(' + esc(this.rawGroup()) + ')</mtext>';
    if (c === 'color') { this.rawGroup(); return ''; }
    if (c === 'textcolor') { this.rawGroup(); return wrap([this.parseGroup()]); }
    if (c === 'substack') {
      var sraw = this.rawGroup().split('\\\\');
      return '<mtable rowspacing="0.1em">' + sraw.map(function (ln) {
        var q = new Parser(tokenize(ln), { display: false });
        return '<mtr><mtd>' + wrap(q.parseList('eof')) + '</mtd></mtr>';
      }).join('') + '</mtable>';
    }

    /* --- fallback: render the name upright so nothing silently vanishes --- */
    return '<mi mathvariant="normal" class="tex-unknown">' + esc(c) + '</mi>';
  };

  Parser.prototype.readDelim = function () {
    var tk = this.next();
    if (!tk) return '';
    if (tk.t === 'op') {
      if (tk.v === '.') return '';
      if (tk.v === '|') return '|';
      if (tk.v === '<') return '⟨';
      if (tk.v === '>') return '⟩';
      if (tk.v === '/') return '/';
      return tk.v;
    }
    if (tk.t === '{') return '{';
    if (tk.t === '}') return '}';
    if (tk.t === 'cmd') {
      if (tk.lit && (tk.v === '{' || tk.v === '}')) return tk.v;
      if (tk.lit && tk.v === '|') return '‖';
      if (DELIM[tk.v]) return DELIM[tk.v];
      if (ARROW[tk.v]) return ARROW[tk.v];
      if (tk.v === 'vert') return '|';
      return '';
    }
    return '';
  };

  var ENV_FENCE = {
    bmatrix: ['[', ']'], Bmatrix: ['{', '}'], pmatrix: ['(', ')'],
    vmatrix: ['|', '|'], Vmatrix: ['‖', '‖'], matrix: ['', ''],
    smallmatrix: ['', ''], psmallmatrix: ['(', ')'], bsmallmatrix: ['[', ']'],
    array: ['', ''], subarray: ['', '']
  };

  Parser.prototype.parseEnv = function (name) {
    var base = name.replace(/\*$/, '');
    var colAlign = null;

    if (base === 'array' || base === 'subarray') {
      var spec = this.rawGroup();
      colAlign = spec.replace(/[^lcr]/g, '').split('').map(function (x) {
        return x === 'l' ? 'left' : x === 'r' ? 'right' : 'center';
      }).join(' ');
    }

    var rows = [], row = [], guard = 0;
    for (;;) {
      if (this.eof() || guard++ > 6000) break;
      var tkp = this.peek();
      if (tkp.t === 'cmd' && tkp.v === 'end') { this.next(); this.rawGroup(); break; }
      var cell = this.parseList('cell');
      row.push(wrap(cell));
      var nt = this.peek();
      if (!nt) break;
      if (nt.t === '&') { this.next(); continue; }
      if (nt.t === 'newline') { this.next(); rows.push(row); row = []; continue; }
      if (nt.t === 'cmd' && nt.v === 'end') { this.next(); this.rawGroup(); break; }
      break;
    }
    if (row.length && !(row.length === 1 && row[0] === '<mrow></mrow>')) rows.push(row);

    var attrs = '';
    if (base === 'aligned' || base === 'align' || base === 'alignat' || base === 'split') {
      attrs = ' columnalign="right left right left right left" columnspacing="0.15em 1em 0.15em 1em"';
    } else if (base === 'cases' || base === 'dcases') {
      attrs = ' columnalign="left left" columnspacing="1em" rowspacing="0.3em"';
    } else if (colAlign) {
      attrs = ' columnalign="' + colAlign + '"';
    }
    if (base === 'gathered' || base === 'gather') attrs = ' columnalign="center"';

    var small = /smallmatrix/.test(base);
    var body = '<mtable' + attrs + (small ? ' displaystyle="false"' : '') + '>' +
      rows.map(function (r) {
        return '<mtr>' + r.map(function (cc) { return '<mtd>' + cc + '</mtd>'; }).join('') + '</mtr>';
      }).join('') + '</mtable>';
    if (small) body = '<mstyle scriptlevel="1" displaystyle="false">' + body + '</mstyle>';

    if (base === 'cases' || base === 'dcases') {
      return '<mrow><mo stretchy="true" fence="true">{</mo>' + body + '</mrow>';
    }
    var f = ENV_FENCE[base];
    if (f && (f[0] || f[1])) {
      return '<mrow><mo stretchy="true" fence="true">' + esc(f[0]) + '</mo>' + body +
        '<mo stretchy="true" fence="true">' + esc(f[1]) + '</mo></mrow>';
    }
    return body;
  };

  /* ---------- public API ----------------------------------------------- */

  function texToMathML(tex, display) {
    var src = String(tex);
    try {
      var p = new Parser(tokenize(src), { display: !!display });
      var list = p.parseList('eof');
      var inner = list.join('');
      return '<math xmlns="http://www.w3.org/1998/Math/MathML" display="' +
        (display ? 'block' : 'inline') + '"' + (display ? ' class="tex-display"' : '') + '>' +
        '<mstyle displaystyle="' + (display ? 'true' : 'false') + '">' + inner + '</mstyle></math>';
    } catch (e) {
      return '<code class="tex-error" title="' + esc(String(e && e.message)) + '">' + esc(src) + '</code>';
    }
  }

  global.texToMathML = texToMathML;
  if (typeof module !== 'undefined' && module.exports) module.exports = { texToMathML: texToMathML };
})(typeof window !== 'undefined' ? window : globalThis);

/* ---- 10-core.js ---- */
/* Study book reader: shared helpers, icons, storage and the book model. */
(function () {
  'use strict';
  var D = document, root = D.documentElement;

  function $(sel, el) { return (el || D).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || D).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* h('div', {class: 'x', text: 'hi', on: {click: fn}}, [child, 'text']) */
  function h(tag, attrs, kids) {
    var el = D.createElement(tag), k;
    if (attrs) {
      for (k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'on') { for (var ev in v) el.addEventListener(ev, v[ev]); }
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    if (kids) {
      (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
        if (c === null || c === undefined || c === false) return;
        el.appendChild(typeof c === 'string' ? D.createTextNode(c) : c);
      });
    }
    return el;
  }

  /* Icons: Lucide outlines (ISC licence), 24 x 24, drawn with the text colour. */
  var ICONS = {
    panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    updown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    arrowL: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    arrowR: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    map: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    languages: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
    sigma: '<path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/>',
    code: '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
    network: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
    cap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    award: '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
    type: '<path d="M21 14h-5"/><path d="M16 16v-3.5a2.5 2.5 0 0 1 5 0V16"/><path d="M4.5 13h6"/><path d="m3 16 4.5-9 4.5 9"/>',
    list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    focus: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    circleCheck: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
    cards: '<path d="M2 3v18"/><rect width="12" height="18" x="6" y="3" rx="2"/><path d="M22 3v18"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    steps: '<path d="M10 6h11"/><path d="M10 12h11"/><path d="M10 18h11"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
    hash: '<path d="M4 9h16"/><path d="M4 15h16"/><path d="M10 3 8 21"/><path d="m16 3-2 18"/>',
    text: '<path d="M15 12h6"/><path d="M15 6h6"/><path d="m3 13 3.553-7.724a.5.5 0 0 1 .894 0L11 13"/><path d="M3 18h18"/><path d="M3.92 11h6.16"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      (ICONS[name] || ICONS.info) + '</svg>';
  }
  function ic(name, cls) { var s = h('span', { html: icon(name, cls) }); return s.firstChild; }

  /* localStorage can be missing or blocked (private window, file:// rules). Never let it throw. */
  var mem = {};
  var store = {
    get: function (k, def) {
      try { var v = localStorage.getItem('book.' + k); return v === null ? (k in mem ? mem[k] : def) : v; }
      catch (e) { return k in mem ? mem[k] : def; }
    },
    set: function (k, v) {
      mem[k] = v;
      try { if (v === null) localStorage.removeItem('book.' + k); else localStorage.setItem('book.' + k, v); } catch (e) {}
    },
    json: function (k, def) {
      try { var v = store.get(k, null); return v === null ? def : JSON.parse(v); } catch (e) { return def; }
    },
    setJSON: function (k, v) { store.set(k, JSON.stringify(v)); }
  };

  var DATA = { id: root.getAttribute('data-book') || 'book', title: D.title, tagline: '', parts: [], books: [] };
  try { DATA = JSON.parse($('#book-data').textContent); } catch (e) {}

  var LEVELS = { basic: 'Basic', intermediate: 'Intermediate', hard: 'Hard', certified: 'Certified' };
  var HUES = { english: [155, 0.13], math: [22, 0.18], coding: [50, 0.15], ontology: [200, 0.1], 'computer-science': [285, 0.18], cedar: [115, 0.12] };

  /* The model is read from the page itself, so a chapter added by hand shows up in the sidebar. */
  var chapters = [], byId = {}, partById = {};
  (DATA.parts || []).forEach(function (p) { partById[p.id] = p; });
  $$('#main > section.chapter').forEach(function (el, i) {
    var h1 = $('h1', el);
    var pid = el.getAttribute('data-part') || 'part';
    if (!partById[pid]) { partById[pid] = { id: pid, title: pid, level: 'basic', chapters: [] }; DATA.parts.push(partById[pid]); }
    var c = {
      id: el.id, el: el, index: i, n: i + 1,
      title: h1 ? h1.textContent.trim() : el.id,
      part: pid, partTitle: partById[pid].title,
      level: el.getAttribute('data-level') || 'basic',
      min: parseInt(el.getAttribute('data-min'), 10) || 0,
      ready: false
    };
    c.sections = $$('h2[id]', el).map(function (x) { return { id: x.id, text: x.textContent.trim() }; });
    chapters.push(c); byId[c.id] = c;
  });
  var parts = DATA.parts.map(function (p) {
    return { id: p.id, title: p.title, level: p.level, chapters: chapters.filter(function (c) { return c.part === p.id; }) };
  }).filter(function (p) { return p.chapters.length; });

  var key = function (k) { return DATA.id + '.' + k; };
  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function toast(msg) {
    var old = $('.toast'); if (old) old.remove();
    var t = h('div', { class: 'toast', role: 'status', text: msg });
    D.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 1800);
  }

  window.BK = {
    D: D, root: root, $: $, $$: $$, h: h, esc: esc, icon: icon, ic: ic, store: store, key: key,
    data: DATA, LEVELS: LEVELS, HUES: HUES, chapters: chapters, byId: byId, parts: parts,
    enhancers: [],   /* fn(chapterElement): run once, the first time a chapter is shown */
    pages: {},       /* id -> {title, icon, build(el), refresh?(el)} generated pages */
    reduced: reduced, toast: toast
  };
})();

/* ---- 20-layout.js ---- */
/* Sidebar, top bar, routing, chapter tools, search, settings and keyboard. */
(function () {
  'use strict';
  var BK = window.BK, D = BK.D, root = BK.root, $ = BK.$, $$ = BK.$$, h = BK.h, ic = BK.ic;
  var store = BK.store, key = BK.key, DATA = BK.data, chapters = BK.chapters, byId = BK.byId, parts = BK.parts;
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
  var MOD = isMac ? '⌘' : 'Ctrl ';
  var small = window.matchMedia('(max-width: 900px)');

  var state = {
    current: null,
    read: store.json(key('read'), []),
    saved: store.json(key('saved'), []),
    level: store.get(key('level'), 'all'),
    shut: store.json(key('shut'), [])
  };
  var sb = {}, tb = {}, pop = null, cmd = null, index = null, tocLinks = [];

  function iconBtn(name, label, fn) {
    return h('button', { class: 'btn', type: 'button', title: label, 'aria-label': label, html: BK.icon(name), on: { click: fn } });
  }
  function cur() { return state.current && byId[state.current.id]; }

  /* ------------------------------------------------------------ sidebar */
  function buildSidebar() {
    var el = $('#sidebar'); el.textContent = '';
    var me = (DATA.books || []).filter(function (b) { return b.id === DATA.id; })[0] || { icon: 'book' };
    sb.switch = h('button', { class: 'sb-switch', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', on: { click: toggleBooks } }, [
      h('span', { class: 'sb-logo', html: BK.icon(me.icon) }),
      h('span', { class: 'sb-switch-text' }, [h('b', { text: DATA.title }), h('small', { text: chapters.length + ' chapters' })]),
      ic('updown')
    ]);
    sb.menu = h('div', { class: 'menu', role: 'menu', hidden: true, on: { click: function () { toggleBooks(); } } },
      [h('div', { class: 'menu-label', text: 'Study books' })]);
    (DATA.books || []).forEach(function (b) {
      var hue = BK.HUES[b.id] || [250, 0.12];
      var logo = h('span', { class: 'sb-logo', html: BK.icon(b.icon) });
      logo.style.background = 'oklch(0.6 ' + hue[1] + ' ' + hue[0] + ')';
      sb.menu.appendChild(h('a', { class: 'menu-item', role: 'menuitem', href: b.id === DATA.id ? '#home' : '../' + b.id + '/index.html' }, [
        logo, h('span', null, [b.title, h('small', { text: b.tagline })]), b.id === DATA.id ? ic('check') : null
      ]));
    });
    if (/^https?:$/.test(location.protocol)) {
      sb.menu.appendChild(h('a', { class: 'menu-item', role: 'menuitem', href: '../' }, [
        h('span', { class: 'sb-logo', html: BK.icon('list') }), h('span', null, ['All books', h('small', { text: 'Back to the book list' })])
      ]));
    }
    sb.search = h('button', { class: 'sb-search', type: 'button', on: { click: openCmd } },
      [ic('search'), h('span', { text: 'Search this book' }), h('kbd', { text: MOD + 'K' })]);
    sb.levels = h('div', { class: 'tg sb-levels', role: 'group', 'aria-label': 'Show chapters of one level' });
    [['all', 'All'], ['basic', 'Basic'], ['intermediate', 'Mid'], ['hard', 'Hard'], ['certified', 'Cert']].forEach(function (lv) {
      sb.levels.appendChild(h('button', {
        type: 'button', 'data-level': lv[0], 'aria-pressed': String(state.level === lv[0]), text: lv[1],
        title: lv[0] === 'all' ? 'All levels' : BK.LEVELS[lv[0]] + ' chapters only',
        on: { click: function () { setLevel(lv[0]); } }
      }));
    });
    el.appendChild(h('div', { class: 'sb-header' }, [sb.switch, sb.menu, sb.search, sb.levels]));

    sb.content = h('nav', { class: 'sb-content', 'aria-label': 'Chapters' });
    var top = h('ul', { class: 'sb-menu' });
    sb.pageLinks = {};
    Object.keys(BK.pages).forEach(function (id) {
      var p = BK.pages[id];
      if (p.when && !p.when()) return;
      var a = h('a', { class: 'sb-btn', href: '#' + id, 'data-id': id }, [
        ic(p.icon), h('span', { class: 'sb-title', text: p.title }),
        p.count ? h('span', { class: 'sb-badge', text: String(p.count()) }) : null
      ]);
      sb.pageLinks[id] = a;
      top.appendChild(h('li', null, [a]));
    });
    sb.content.appendChild(h('div', { class: 'sb-group' }, [top]));
    sb.links = {}; sb.groups = {};
    parts.forEach(function (p) {
      var open = state.shut.indexOf(p.id) < 0;
      var label = h('button', { class: 'sb-label', type: 'button', 'aria-expanded': String(open), on: { click: function () { toggleGroup(p.id); } } },
        [h('span', { text: p.title }), ic('right')]);
      var ul = h('ul', { class: 'sb-menu' });
      p.chapters.forEach(function (c) {
        var a = h('a', { class: 'sb-btn', href: '#' + c.id, 'data-id': c.id },
          [h('span', { class: 'sb-num', text: String(c.n) }), h('span', { class: 'sb-title', text: c.title })]);
        sb.links[c.id] = a;
        ul.appendChild(h('li', { 'data-level': c.level }, [a]));
      });
      var g = h('div', { class: 'sb-group', 'data-part': p.id }, [label, ul]);
      sb.groups[p.id] = { el: g, label: label, ul: ul };
      sb.content.appendChild(g);
    });
    sb.none = h('p', { class: 'sb-empty', hidden: true, text: 'No chapters at this level.' });
    sb.content.appendChild(sb.none);
    el.appendChild(sb.content);

    sb.progText = h('span');
    sb.progBar = h('i');
    el.appendChild(h('div', { class: 'sb-footer' }, [
      h('div', { class: 'sb-progress-row' }, [h('span', { text: 'Chapters read' }), sb.progText]),
      h('div', { class: 'bar' }, [sb.progBar])
    ]));
    applyLevel(); paintProgress();
  }

  function paintProgress() {
    var n = 0;
    chapters.forEach(function (c) {
      var done = state.read.indexOf(c.id) >= 0, a = sb.links[c.id], mark = a && $('.sb-done', a);
      if (done) n++;
      if (done && a && !mark) a.appendChild(ic('check', 'sb-done'));
      if (!done && mark) mark.remove();
    });
    sb.progText.textContent = n + ' / ' + chapters.length;
    sb.progBar.style.width = (chapters.length ? Math.round(n * 100 / chapters.length) : 0) + '%';
  }
  function setLevel(lv) { state.level = lv; store.set(key('level'), lv); applyLevel(); }
  function applyLevel() {
    var any = false;
    $$('button', sb.levels).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-level') === state.level)); });
    parts.forEach(function (p) {
      var shown = 0, g = sb.groups[p.id];
      $$('li[data-level]', g.ul).forEach(function (li) {
        var ok = state.level === 'all' || li.getAttribute('data-level') === state.level;
        li.hidden = !ok; if (ok) shown++;
      });
      g.el.hidden = !shown; if (shown) any = true;
    });
    sb.none.hidden = any;
  }
  function toggleGroup(id, force) {
    var g = sb.groups[id]; if (!g) return;
    var open = force !== undefined ? force : g.label.getAttribute('aria-expanded') !== 'true';
    g.label.setAttribute('aria-expanded', String(open));
    var i = state.shut.indexOf(id);
    if (open && i >= 0) state.shut.splice(i, 1);
    if (!open && i < 0) state.shut.push(id);
    store.setJSON(key('shut'), state.shut);
  }
  function toggleBooks(e) {
    var open = sb.menu.hidden;
    sb.menu.hidden = !open;
    sb.switch.setAttribute('aria-expanded', String(open));
    if (open) { var first = $('.menu-item', sb.menu); if (first) first.focus(); }
    if (e && e.stopPropagation) e.stopPropagation();
  }
  function paintNav(id) {
    $$('.sb-btn[aria-current]', sb.content).forEach(function (a) { a.removeAttribute('aria-current'); });
    var old = $('.sb-sub', sb.content); if (old) old.remove();
    var a = sb.links[id] || sb.pageLinks[id];
    if (!a) return;
    a.setAttribute('aria-current', 'page');
    var c = byId[id];
    if (c) {
      toggleGroup(c.part, true);
      if (state.level !== 'all' && c.level !== state.level) setLevel('all');
      if (c.sections.length) {
        var ul = h('ul', { class: 'sb-sub' });
        c.sections.forEach(function (s) { ul.appendChild(h('li', null, [h('a', { href: '#' + s.id, 'data-id': s.id, text: s.text })])); });
        a.parentNode.appendChild(ul);
      }
    }
    var box = sb.content, y = a.offsetTop, hgt = box.clientHeight;
    if (y < box.scrollTop + 8) box.scrollTop = Math.max(0, y - 48);
    else if (y + a.offsetHeight > box.scrollTop + hgt - 8) box.scrollTop = y - hgt / 3;
  }
  function toggleSidebar() {
    if (small.matches) { setNav(root.getAttribute('data-nav') !== 'open'); return; }
    var closed = root.getAttribute('data-sidebar') === 'closed';
    if (closed) { root.removeAttribute('data-sidebar'); store.set('sidebar', null); }
    else { root.setAttribute('data-sidebar', 'closed'); store.set('sidebar', 'closed'); }
    syncInert();
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 260);
  }
  function setNav(open) {
    if (open) root.setAttribute('data-nav', 'open'); else root.removeAttribute('data-nav');
    $('#scrim').hidden = !open;
    syncInert();
  }
  function syncInert() {
    var s = $('#sidebar');
    s.inert = small.matches ? root.getAttribute('data-nav') !== 'open' : root.getAttribute('data-sidebar') === 'closed';
  }

  /* ------------------------------------------------------------ top bar */
  function buildTopbar() {
    var el = $('#topbar'); el.textContent = '';
    tb.crumbs = h('nav', { class: 'tb-crumbs', 'aria-label': 'Where you are' });
    tb.theme = iconBtn('moon', 'Light or dark (T)', toggleTheme);
    tb.display = iconBtn('type', 'Reading settings', toggleDisplay);
    tb.bar = h('i');
    el.appendChild(iconBtn('panel', 'Show or hide the sidebar (' + MOD + 'B)', toggleSidebar));
    el.appendChild(h('span', { class: 'sep' }));
    el.appendChild(tb.crumbs);
    el.appendChild(h('div', { class: 'tb-actions' }, [iconBtn('search', 'Search (' + MOD + 'K)', openCmd), tb.display, tb.theme]));
    el.appendChild(h('div', { class: 'tb-progress' }, [tb.bar]));
    paintTheme();
  }
  function paintCrumbs(c, p, id) {
    var el = tb.crumbs; el.textContent = '';
    if (!c && (!p || id === 'home')) { el.appendChild(h('span', { class: 'now', text: DATA.title })); return; }
    el.appendChild(h('a', { class: 'book', href: '#home', text: DATA.title }));
    el.appendChild(ic('right'));
    if (c) {
      el.appendChild(h('span', { class: 'mid', text: c.partTitle }));
      el.appendChild(ic('right'));
      el.appendChild(h('span', { class: 'now', text: c.title }));
    } else {
      el.appendChild(h('span', { class: 'now', text: p.title }));
    }
  }
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function setTheme(t) {
    if (t === 'auto') { root.removeAttribute('data-theme'); store.set('theme', null); }
    else { root.setAttribute('data-theme', t); store.set('theme', t); }
    paintTheme();
  }
  function toggleTheme() { setTheme(isDark() ? 'light' : 'dark'); }
  function paintTheme() { tb.theme.innerHTML = BK.icon(isDark() ? 'sun' : 'moon'); }
  function setAttr(name, v, def) {
    if (v === def) { root.removeAttribute('data-' + name); store.set(name, null); }
    else { root.setAttribute('data-' + name, v); store.set(name, v); }
    window.dispatchEvent(new Event('resize'));
  }
  function row(label, opts, now, fn) {
    var tg = h('div', { class: 'tg', role: 'group', 'aria-label': label });
    opts.forEach(function (o) {
      tg.appendChild(h('button', {
        type: 'button', 'aria-pressed': String(o[0] === now), text: o[1], on: {
          click: function () {
            $$('button', tg).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
            this.setAttribute('aria-pressed', 'true'); fn(o[0]);
          }
        }
      }));
    });
    return h('div', { class: 'pop-row' }, [h('span', { text: label }), tg]);
  }
  function toggleDisplay(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (pop) { closeDisplay(); return; }
    pop = h('div', { class: 'popover', role: 'dialog', 'aria-label': 'Reading settings', on: { click: function (ev) { ev.stopPropagation(); } } });
    pop.appendChild(row('Theme', [['light', 'Light'], ['dark', 'Dark'], ['auto', 'Auto']], root.getAttribute('data-theme') || 'auto', setTheme));
    pop.appendChild(row('Text size', [['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL']], root.getAttribute('data-size') || 'm', function (v) { setAttr('size', v, 'm'); }));
    pop.appendChild(row('Line width', [['normal', 'Normal'], ['wide', 'Wide']], root.getAttribute('data-width') || 'normal', function (v) { setAttr('width', v, 'normal'); }));
    pop.appendChild(row('Letters', [['sans', 'Sans'], ['serif', 'Serif']], root.getAttribute('data-font') || 'sans', function (v) { setAttr('font', v, 'sans'); }));
    var keys = h('div', { class: 'pop-keys' });
    [['Search', MOD + 'K'], ['Sidebar', MOD + 'B'], ['Next chapter', ']'], ['Previous chapter', '['], ['Outline view', 'O'],
     ['Open all answers', 'A'], ['Focus mode', 'F'], ['Light or dark', 'T']].forEach(function (k) {
      keys.appendChild(h('span', { text: k[0] })); keys.appendChild(h('kbd', { text: k[1] }));
    });
    pop.appendChild(keys);
    $('#topbar').appendChild(pop);
  }
  function closeDisplay() { if (pop) { pop.remove(); pop = null; } }

  /* ----------------------------------------------------- chapter set-up */
  function tool(icon, label, title, fn) {
    return h('button', { class: 'btn outline', type: 'button', title: title, 'aria-pressed': 'false', on: { click: fn } },
      [ic(icon), h('span', { class: 'lbl', text: label })]);
  }
  function toggleList(name, id) {
    var list = state[name], i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    store.setJSON(key(name), list);
  }
  function paintTools(c) {
    if (!c.tools) return;
    var r = state.read.indexOf(c.id) >= 0, s = state.saved.indexOf(c.id) >= 0;
    c.tools.read.setAttribute('aria-pressed', String(r)); $('.lbl', c.tools.read).textContent = r ? 'Read' : 'Mark as read';
    c.tools.save.setAttribute('aria-pressed', String(s)); $('.lbl', c.tools.save).textContent = s ? 'Saved' : 'Save';
    c.tools.focus.setAttribute('aria-pressed', String(root.hasAttribute('data-focus')));
  }
  function setSec(sec, open) {
    sec.setAttribute('data-open', String(open));
    var b = $('.sec-toggle', sec); if (b) b.setAttribute('aria-expanded', String(open));
    if (open) window.dispatchEvent(new Event('resize'));
  }
  function setOutline(c, on) {
    $$(':scope > .sec', c.el).forEach(function (s) { setSec(s, !on); });
    c.tools.outline.setAttribute('aria-pressed', String(on));
  }
  function setAnswers(c, on) {
    $$('details', c.el).forEach(function (d) { d.open = on; });
    $$('.flashcards .back', c.el).forEach(function (b) { b.hidden = !on; });
    c.tools.answers.setAttribute('aria-pressed', String(on));
  }
  function setFocus(on) {
    if (on) root.setAttribute('data-focus', ''); else root.removeAttribute('data-focus');
    var c = cur(); if (c) paintTools(c);
    if (on) BK.toast('Focus mode. Press F or Esc to leave.');
    window.dispatchEvent(new Event('resize'));
  }
  function markRead(c) {
    if (state.read.indexOf(c.id) >= 0) return;
    state.read.push(c.id); store.setJSON(key('read'), state.read);
    paintProgress(); paintTools(c); refreshPages();
  }
  function prepare(c) {
    if (c.ready) return;
    c.ready = true;
    var el = c.el, h1 = $(':scope > h1', el), lead = $(':scope > p.lead', el);
    el.insertBefore(h('p', { class: 'ch-meta' }, [
      h('span', { class: 'badge brand', text: BK.LEVELS[c.level] || c.level }),
      h('span', { text: 'Chapter ' + c.n }), h('span', { text: c.partTitle }),
      c.min ? h('span', { text: c.min + ' min read' }) : null
    ]), h1 || el.firstChild);
    c.tools = {
      outline: tool('list', 'Outline', 'Show only the section titles (O)', function () { setOutline(c, this.getAttribute('aria-pressed') !== 'true'); }),
      answers: tool('eye', 'Answers', 'Open every answer and proof (A)', function () { setAnswers(c, this.getAttribute('aria-pressed') !== 'true'); }),
      focus: tool('focus', 'Focus', 'Hide the sidebars (F)', function () { setFocus(!root.hasAttribute('data-focus')); }),
      save: tool('bookmark', 'Save', 'Keep this chapter in your saved list', function () { toggleList('saved', c.id); paintTools(c); refreshPages(); }),
      read: tool('circleCheck', 'Mark as read', 'Mark this chapter as read', function () { toggleList('read', c.id); paintTools(c); paintProgress(); refreshPages(); })
    };
    var tools = h('div', { class: 'ch-tools' }, [c.tools.outline, c.tools.answers, c.tools.focus, h('span', { class: 'grow' }), c.tools.save, c.tools.read]);
    var anchor = lead || h1;
    if (anchor) el.insertBefore(tools, anchor.nextSibling); else el.insertBefore(tools, el.firstChild);

    /* every h2 becomes a section that can be closed */
    var sec = null;
    Array.prototype.slice.call(el.children).forEach(function (k) {
      if (k.tagName === 'H2') {
        sec = h('div', { class: 'sec', 'data-open': 'true' });
        el.insertBefore(sec, k);
        var btn = h('button', {
          class: 'sec-toggle', type: 'button', 'aria-expanded': 'true', 'aria-label': 'Close or open this section', html: BK.icon('down'),
          on: { click: function () { setSec(this.closest('.sec'), this.getAttribute('aria-expanded') !== 'true'); } }
        });
        k.addEventListener('click', function () { var s = this.closest('.sec'); if (s.getAttribute('data-open') === 'false') setSec(s, true); });
        sec.appendChild(h('div', { class: 'sec-head' }, [k, btn]));
        sec.appendChild(h('div', { class: 'sec-body' }));
      } else if (sec) {
        sec.lastChild.appendChild(k);
      }
    });

    var prev = chapters[c.index - 1], next = chapters[c.index + 1];
    c.score = h('div', { class: 'ch-score', hidden: true });
    var foot = h('div', { class: 'ch-foot' }, [c.score]);
    if (prev) foot.appendChild(h('a', { class: 'prev', href: '#' + prev.id }, [h('small', null, [ic('arrowL'), 'Previous']), h('b', { text: prev.title })]));
    if (next) foot.appendChild(h('a', { class: 'next', href: '#' + next.id, on: { click: function () { markRead(c); } } }, [h('small', null, ['Next', ic('arrowR')]), h('b', { text: next.title })]));
    el.appendChild(foot);
    paintTools(c);
    BK.enhancers.forEach(function (fn) { try { fn(el, c); } catch (e) { if (window.console) console.error(e); } });
  }

  /* -------------------------------------------------------------- route */
  function pageEl(id) {
    var el = D.getElementById(id);
    if (!el && BK.pages[id]) { el = h('section', { class: 'chapter page', id: id }); $('#main').appendChild(el); }
    return el;
  }
  function refreshPages() {
    Object.keys(BK.pages).forEach(function (id) {
      var el = D.getElementById(id);
      if (el && el !== state.current && el.getAttribute('data-built')) { el.removeAttribute('data-built'); el.textContent = ''; }
    });
  }
  function route() {
    var raw = '';
    try { raw = decodeURIComponent(location.hash.replace(/^#/, '')); } catch (e) { raw = location.hash.replace(/^#/, ''); }
    routeTo(raw);
  }
  function routeTo(raw) {
    var q = '', qi = raw.indexOf('?');
    if (qi >= 0) { q = raw.slice(qi + 1); raw = raw.slice(0, qi); }
    var id = raw || 'home';
    var target = BK.pages[id] ? pageEl(id) : D.getElementById(id);
    var sec = target ? target.closest('section.chapter') : null;
    if (!sec) { sec = BK.pages.home ? pageEl('home') : (chapters[0] && chapters[0].el); target = sec; }
    if (sec) show(sec, target === sec ? null : target, q);
  }
  function show(sec, anchor, q) {
    var changed = state.current !== sec;
    if (changed) {
      if (state.current) state.current.classList.remove('is-active');
      sec.classList.add('is-active');
      state.current = sec;
    }
    var c = byId[sec.id], p = BK.pages[sec.id];
    if (c) prepare(c);
    if (p) {
      if (!sec.getAttribute('data-built')) { sec.setAttribute('data-built', '1'); p.build(sec, q); }
      else if (p.refresh) p.refresh(sec, q);
    }
    if (changed) {
      paintCrumbs(c, p, sec.id); paintNav(sec.id); buildToc(c);
      D.title = (c ? c.title : p ? p.title : DATA.title) + ' · ' + DATA.title;
      if (c) store.set(key('last'), c.id);
      if (small.matches) setNav(false);
      closeDisplay();
    }
    if (anchor) {
      var s = anchor.closest('.sec');
      if (s && s.getAttribute('data-open') === 'false') setSec(s, true);
      var d = anchor.closest('details');
      while (d) { d.open = true; d = d.parentElement ? d.parentElement.closest('details') : null; }
      requestAnimationFrame(function () {
        anchor.scrollIntoView({ block: 'start' });
        if (anchor.classList.contains('thm')) {
          anchor.classList.add('is-target');
          setTimeout(function () { anchor.classList.remove('is-target'); }, 2400);
        }
      });
    } else if (changed) {
      window.scrollTo(0, 0);
    }
    if (changed) {
      window.dispatchEvent(new Event('resize'));
      try { $('#main').focus({ preventScroll: true }); } catch (e) {}
    }
    onScroll();
  }

  /* ------------------------------------------------------- on this page */
  function buildToc(c) {
    var el = $('#toc'); el.textContent = ''; tocLinks = [];
    if (!c || !c.sections.length) return;
    el.appendChild(h('p', { class: 'toc-title', text: 'On this page' }));
    var ul = h('ul', { class: 'toc-list' });
    c.sections.forEach(function (s) {
      var a = h('a', { href: '#' + s.id, 'data-id': s.id, text: s.text });
      tocLinks.push(a); ul.appendChild(h('li', null, [a]));
    });
    el.appendChild(ul);
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var docH = D.documentElement.scrollHeight - window.innerHeight;
      tb.bar.style.width = (docH > 0 ? Math.min(100, window.scrollY * 100 / docH) : 0).toFixed(1) + '%';
      var c = cur(); if (!c) return;
      var here = null;
      for (var i = 0; i < c.sections.length; i++) {
        var hd = D.getElementById(c.sections[i].id);
        if (!hd) continue;
        if (hd.getBoundingClientRect().top <= 110) here = c.sections[i].id; else break;
      }
      tocLinks.forEach(function (a) { a.classList.toggle('is-here', a.getAttribute('data-id') === here); });
      $$('.sb-sub a', sb.content).forEach(function (a) { a.classList.toggle('is-here', a.getAttribute('data-id') === here); });
    });
  }

  /* -------------------------------------------------------------- search */
  function textOf(el) {
    if (!el.querySelector || !el.querySelector('.tex')) return el.textContent;
    var c = el.cloneNode(true);
    $$('.tex', c).forEach(function (t) { t.textContent = ' '; });
    return c.textContent;
  }
  function buildIndex() {
    index = [];
    chapters.forEach(function (c) {
      var now = { c: c, id: c.id, title: '', text: '' };
      function push() { if (now.text.trim()) { now.raw = now.text.replace(/\s+/g, ' ').trim(); now.low = now.raw.toLowerCase(); index.push(now); } }
      Array.prototype.forEach.call(c.el.children, function (k) {
        var cl = k.classList;
        if (cl.contains('sec')) { push(); var hd = $('h2', k); now = { c: c, id: (hd && hd.id) || c.id, title: hd ? hd.textContent.trim() : '', text: textOf(k) }; }
        else if (k.tagName === 'H2') { push(); now = { c: c, id: k.id || c.id, title: k.textContent.trim(), text: '' }; }
        else if (!cl.contains('ch-tools') && !cl.contains('ch-foot') && !cl.contains('ch-meta')) now.text += ' ' + textOf(k);
      });
      push();
    });
  }
  function hl(text, toks) {
    var low = text.toLowerCase(), marks = [];
    toks.forEach(function (t) {
      var i = 0;
      while (t && (i = low.indexOf(t, i)) >= 0) { marks.push([i, i + t.length]); i += t.length; }
    });
    if (!marks.length) return BK.esc(text);
    marks.sort(function (a, b) { return a[0] - b[0]; });
    var out = '', pos = 0;
    marks.forEach(function (m) {
      if (m[0] < pos) return;
      out += BK.esc(text.slice(pos, m[0])) + '<mark>' + BK.esc(text.slice(m[0], m[1])) + '</mark>';
      pos = m[1];
    });
    return out + BK.esc(text.slice(pos));
  }
  function search(q) {
    var res = [];
    if (!q) {
      var last = byId[store.get(key('last'), '')];
      if (last) res.push({ group: 'Go to', icon: 'arrowR', title: 'Continue: ' + BK.esc(last.title), sub: BK.esc(last.partTitle), href: last.id });
      Object.keys(BK.pages).forEach(function (id) {
        var p = BK.pages[id];
        if (p.when && !p.when()) return;
        res.push({ group: 'Go to', icon: p.icon, title: BK.esc(p.title), href: id });
      });
      parts.forEach(function (p) { res.push({ group: 'Parts', icon: 'book', title: BK.esc(p.title), sub: p.chapters.length + ' chapters', href: p.chapters[0].id }); });
      return res;
    }
    var toks = q.toLowerCase().split(/\s+/).filter(Boolean);
    function all(s) { for (var i = 0; i < toks.length; i++) if (s.indexOf(toks[i]) < 0) return false; return true; }
    var n = 0;
    chapters.forEach(function (c) {
      if (n < 8 && all(c.title.toLowerCase())) { n++; res.push({ group: 'Chapters', icon: 'book', title: hl(c.title, toks), sub: BK.esc('Chapter ' + c.n + ' · ' + c.partTitle), href: c.id }); }
    });
    n = 0;
    chapters.forEach(function (c) {
      c.sections.forEach(function (s) {
        if (n < 10 && all(s.text.toLowerCase())) { n++; res.push({ group: 'Sections', icon: 'hash', title: hl(s.text, toks), sub: BK.esc(c.title), href: s.id }); }
      });
    });
    if (BK.theorems) {
      n = 0;
      BK.theorems().forEach(function (t) {
        if (n < 8 && all(t.name.toLowerCase())) { n++; res.push({ group: 'Theorems', icon: 'sigma', title: hl(t.name, toks), sub: BK.esc(t.kind + ' · ' + t.chapter.title), href: t.id }); }
      });
    }
    n = 0;
    index.forEach(function (it) {
      if (n >= 24 || !all(it.low)) return;
      var i = it.low.indexOf(toks[0]); if (i < 0) return;
      n++;
      var a = Math.max(0, i - 50), b = Math.min(it.raw.length, i + 110);
      res.push({ group: 'In the text', icon: 'text', title: BK.esc(it.c.title + (it.title ? ' · ' + it.title : '')), sub: (a > 0 ? '…' : '') + hl(it.raw.slice(a, b), toks), href: it.id });
    });
    return res;
  }
  function openCmd() {
    if (cmd) return;
    if (!index) buildIndex();
    closeDisplay();
    var last = D.activeElement, sel = 0, items = [];
    var input = h('input', { class: 'cmd-input', type: 'text', placeholder: 'Search chapters, sections and text', 'aria-label': 'Search this book', autocomplete: 'off', spellcheck: 'false' });
    var list = h('div', { class: 'cmd-list', role: 'listbox' });
    var box = h('div', { class: 'cmd-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search' }, [
      h('div', { class: 'cmd-top' }, [ic('search'), input, h('kbd', { text: 'Esc' })]), list,
      h('div', { class: 'cmd-foot' }, [h('span', null, [h('kbd', { text: '↑' }), ' ', h('kbd', { text: '↓' }), ' move']), h('span', null, [h('kbd', { text: 'Enter' }), ' open'])])
    ]);
    cmd = h('div', { class: 'cmd', on: { mousedown: function (e) { if (e.target === cmd) closeCmd(); } } }, [box]);
    cmd._last = last;
    D.body.appendChild(cmd);
    function mark() {
      items.forEach(function (a, i) { a.setAttribute('aria-selected', String(i === sel)); });
      if (items[sel] && items[sel].scrollIntoView) items[sel].scrollIntoView({ block: 'nearest' });
    }
    function paint() {
      var res = search(input.value.trim());
      list.textContent = ''; items = [];
      if (!res.length) { list.appendChild(h('div', { class: 'cmd-empty', text: 'Nothing found. Try a shorter word.' })); return; }
      var group = null;
      res.forEach(function (r) {
        if (r.group !== group) { group = r.group; list.appendChild(h('div', { class: 'cmd-group', text: group })); }
        var a = h('a', { class: 'cmd-item', role: 'option', href: '#' + r.href, 'aria-selected': 'false', on: { click: function () { closeCmd(true); } } },
          [ic(r.icon), h('div', null, [h('b', { html: r.title }), r.sub ? h('small', { html: r.sub }) : null])]);
        items.push(a); list.appendChild(a);
      });
      sel = 0; mark(); list.scrollTop = 0;
    }
    input.addEventListener('input', paint);
    cmd.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (items[sel]) { var to = items[sel].getAttribute('href'); closeCmd(true); if (location.hash === to) route(); else location.hash = to; } }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeCmd(); }
      else if (e.key === 'Tab') { e.preventDefault(); input.focus(); }
    });
    paint(); input.focus();
  }
  function closeCmd(navigated) {
    if (!cmd) return;
    var last = cmd._last; cmd.remove(); cmd = null;
    if (!navigated && last && last.focus) last.focus();
  }

  /* ------------------------------------------------------------ keyboard */
  function onKey(e) {
    var mod = e.metaKey || e.ctrlKey, k = e.key;
    if (mod && (k === 'k' || k === 'K')) { e.preventDefault(); if (cmd) closeCmd(); else openCmd(); return; }
    if (mod && (k === 'b' || k === 'B')) { e.preventDefault(); toggleSidebar(); return; }
    if (cmd) return;
    if (k === 'Escape') {
      if (pop) closeDisplay();
      else if (!sb.menu.hidden) { toggleBooks(); sb.switch.focus(); }
      else if (root.getAttribute('data-nav') === 'open') setNav(false);
      else if (root.hasAttribute('data-focus')) setFocus(false);
      return;
    }
    if (mod || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    var c = cur();
    if (k === '/') { e.preventDefault(); openCmd(); }
    else if (k === ']' && c && chapters[c.index + 1]) location.hash = chapters[c.index + 1].id;
    else if (k === '[' && c && chapters[c.index - 1]) location.hash = chapters[c.index - 1].id;
    else if (k === 'f' || k === 'F') setFocus(!root.hasAttribute('data-focus'));
    else if ((k === 'o' || k === 'O') && c) setOutline(c, c.tools.outline.getAttribute('aria-pressed') !== 'true');
    else if ((k === 'a' || k === 'A') && c) setAnswers(c, c.tools.answers.getAttribute('aria-pressed') !== 'true');
    else if (k === 't' || k === 'T') toggleTheme();
  }

  BK.state = state;
  BK.go = routeTo;
  BK.isDark = isDark;
  BK.setLevel = setLevel;
  BK.markScore = function (c, right, total) {
    if (!c || !c.score) return;
    c.score.hidden = false;
    c.score.textContent = 'Quiz in this chapter: ' + right + ' of ' + total + ' right on the first try.';
  };
  BK.start = function () {
    buildSidebar(); buildTopbar(); syncInert();
    window.addEventListener('hashchange', route);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    D.addEventListener('keydown', onKey);
    D.addEventListener('click', function (e) {
      if (!sb.menu.hidden && !sb.menu.contains(e.target) && !sb.switch.contains(e.target)) toggleBooks();
      if (pop && !pop.contains(e.target) && !tb.display.contains(e.target)) closeDisplay();
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (a && a.getAttribute('href') === location.hash && !e.defaultPrevented) route();
    });
    $('#scrim').addEventListener('click', function () { setNav(false); });
    if (small.addEventListener) small.addEventListener('change', function () { setNav(false); });
    try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintTheme); } catch (e) {}
    route();
  };
})();

/* ---- 30-blocks.js ---- */
/* Content blocks: maths, code, tabs, carousel, pattern cards, quiz, blanks, steps, theorems, word help. */
(function () {
  'use strict';
  var BK = window.BK, D = BK.D, $ = BK.$, $$ = BK.$$, h = BK.h, ic = BK.ic, store = BK.store;
  var seq = 0;

  /* --------------------------------------------------------------- maths */
  function doMath(el) {
    if (!window.texToMathML) return;
    $$('.tex', el).forEach(function (s) {
      if (s.getAttribute('data-tex') !== null) return;
      var tex = s.textContent;
      s.setAttribute('data-tex', tex);
      try { s.innerHTML = window.texToMathML(tex, s.classList.contains('block')); } catch (e) {}
    });
  }

  /* ---------------------------------------------------------------- code */
  var NAMES = {
    rust: 'Rust', python: 'Python', bash: 'Shell', sh: 'Shell', shell: 'Shell', toml: 'TOML', json: 'JSON', yaml: 'YAML',
    sql: 'SQL', c: 'C', cpp: 'C++', js: 'JavaScript', ts: 'TypeScript', turtle: 'Turtle', sparql: 'SPARQL', cypher: 'Cypher',
    gql: 'GQL', datalog: 'Datalog', asm: 'Assembly', pseudo: 'Pseudocode', diff: 'Diff', text: 'Text', output: 'Output',
    html: 'HTML', xml: 'XML', lean: 'Lean', owl: 'OWL', shacl: 'SHACL', java: 'Java', go: 'Go', markdown: 'Markdown', md: 'Markdown'
  };
  var ALIAS = {
    rs: 'rust', py: 'python', sh: 'bash', shell: 'bash', zsh: 'bash', console: 'bash', javascript: 'js', ts: 'js', typescript: 'js',
    ttl: 'turtle', rq: 'sparql', gql: 'cypher', cpp: 'c', 'c++': 'c', yml: 'yaml', postgres: 'sql', postgresql: 'sql', psql: 'sql',
    owl: 'turtle', shacl: 'turtle', pseudocode: 'pseudo'
  };
  var KW = {
    rust: 'as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while union gen',
    python: 'False None True and as assert async await break case class continue def del elif else except finally for from global if import in is lambda match nonlocal not or pass raise return try type while with yield',
    bash: 'if then else elif fi for while until do done case esac function in return export local readonly set unset source',
    sql: 'select from where and or not insert into values update set delete create table index view drop alter add primary key foreign references join left right inner outer full cross on group by order having limit offset as distinct union all null is in like between exists case when then else end begin commit rollback with recursive using extension returning asc desc default unique check constraint true false',
    c: 'auto break case char const continue default do double else enum extern float for goto if inline int long register return short signed sizeof static struct switch typedef union unsigned void volatile while bool true false NULL',
    js: 'async await break case catch class const continue default delete do else export extends false finally for from function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while yield interface type enum implements',
    go: 'break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var true false nil',
    java: 'abstract boolean break byte case catch char class const continue default do double else enum extends final finally float for if implements import instanceof int interface long new null package private protected public return short static super switch this throw throws try void volatile while true false var record',
    json: 'true false null', toml: 'true false', yaml: 'true false null yes no',
    turtle: 'a prefix base PREFIX BASE true false',
    sparql: 'select construct ask describe where filter optional union minus graph service bind values prefix base limit offset order by group having distinct as a insert delete data with using from named not exists in true false count sum avg min max',
    cypher: 'match optional where return with create merge delete detach set remove order by skip limit as and or not in unwind call yield distinct union true false null on case when then else end exists',
    pseudo: 'if then else elif end for while do repeat until return function procedure and or not in to each let set',
    lean: 'theorem lemma def example by fun match with intro apply exact rw simp have show from at using where structure inductive instance class namespace end open import variable',
    datalog: '', asm: ''
  };
  var HASH = { python: 1, bash: 1, toml: 1, yaml: 1, turtle: 1, sparql: 1 };
  var SLASH = { rust: 1, c: 1, js: 1, go: 1, java: 1, cypher: 1, pseudo: 1 };
  var DASH = { sql: 1, lean: 1 };
  var CASELESS = { sql: 1, sparql: 1, cypher: 1 };
  var TYPED = { rust: 1, python: 1, js: 1, java: 1, go: 1, c: 1 };
  var RUST_T = /^(i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str)$/;
  var PY_T = /^(int|float|str|bool|list|dict|set|tuple|bytes|object)$/;

  function highlight(src, lang) {
    lang = ALIAS[lang] || lang;
    var esc = BK.esc;
    if (lang === 'diff') {
      return src.split('\n').map(function (l) {
        var e = esc(l);
        if (l.charAt(0) === '+') return '<span class="tk-add">' + e + '</span>';
        if (l.charAt(0) === '-') return '<span class="tk-del">' + e + '</span>';
        if (l.slice(0, 2) === '@@') return '<span class="tk-c">' + e + '</span>';
        return e;
      }).join('\n');
    }
    var kws = KW[lang];
    if (kws === undefined) return esc(src);
    var set = Object.create(null);
    kws.split(' ').forEach(function (k) { if (k) set[CASELESS[lang] ? k.toLowerCase() : k] = 1; });
    var out = '', i = 0, n = src.length, m, e;
    function span(cls, text) { out += '<span class="tk-' + cls + '">' + esc(text) + '</span>'; }
    while (i < n) {
      var ch = src.charAt(i), two = src.substr(i, 2), prev = i ? src.charAt(i - 1) : '\n';
      /* comments */
      if ((SLASH[lang] && two === '//') || (DASH[lang] && two === '--') ||
          (HASH[lang] && ch === '#' && /\s/.test(prev)) || (lang === 'datalog' && ch === '%') || (lang === 'asm' && ch === ';')) {
        e = src.indexOf('\n', i); if (e < 0) e = n;
        span('c', src.slice(i, e)); i = e; continue;
      }
      if ((SLASH[lang] || lang === 'sql') && two === '/*') {
        e = src.indexOf('*/', i + 2); e = e < 0 ? n : e + 2;
        span('c', src.slice(i, e)); i = e; continue;
      }
      if (lang === 'rust' && ch === '#' && (src.charAt(i + 1) === '[' || src.substr(i + 1, 2) === '![')) {
        e = src.indexOf(']', i); e = e < 0 ? n : e + 1;
        span('m', src.slice(i, e)); i = e; continue;
      }
      if (lang === 'python' && ch === '@' && /\s/.test(prev) && (m = /^@[A-Za-z_][\w.]*/.exec(src.substr(i, 80)))) {
        span('m', m[0]); i += m[0].length; continue;
      }
      /* strings */
      if (lang === 'python' && (src.substr(i, 3) === '"""' || src.substr(i, 3) === "'''")) {
        e = src.indexOf(src.substr(i, 3), i + 3); e = e < 0 ? n : e + 3;
        span('s', src.slice(i, e)); i = e; continue;
      }
      if (ch === '"' || (ch === "'" && lang !== 'rust' && lang !== 'lean') || (ch === '`' && lang === 'js')) {
        var j = i + 1;
        while (j < n && src.charAt(j) !== ch) {
          if (src.charAt(j) === '\\') j++;
          else if (src.charAt(j) === '\n' && ch !== '`') break;
          j++;
        }
        j = Math.min(n, j + 1);
        span('s', src.slice(i, j)); i = j; continue;
      }
      if (lang === 'rust' && ch === "'") {
        if ((m = /^'(\\[^']+|[^\\'])'/.exec(src.substr(i, 12)))) { span('s', m[0]); i += m[0].length; continue; }
        if ((m = /^'[A-Za-z_]\w*/.exec(src.substr(i, 40)))) { span('m', m[0]); i += m[0].length; continue; }
      }
      if ((lang === 'turtle' || lang === 'sparql') && ch === '<' && (m = /^<[^<>\s]*>/.exec(src.substr(i, 300)))) {
        span('s', m[0]); i += m[0].length; continue;
      }
      /* numbers */
      if (ch >= '0' && ch <= '9' && !/[A-Za-z_]/.test(prev)) {
        m = /^(0x[0-9a-fA-F_]+|0b[01_]+|0o[0-7_]+|[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9]+)?)((i|u|f)(8|16|32|64|128|size))?/.exec(src.substr(i, 64));
        span('n', m[0]); i += m[0].length; continue;
      }
      /* words */
      if (/[A-Za-z_]/.test(ch)) {
        m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.substr(i, 80));
        var w = m[0], nx = src.charAt(i + w.length), kk = CASELESS[lang] ? w.toLowerCase() : w;
        if (set[kk]) span('k', w);
        else if (lang === 'rust' && nx === '!' && src.charAt(i + w.length + 1) !== '=') { span('m', w + '!'); i += w.length + 1; continue; }
        else if ((lang === 'rust' && RUST_T.test(w)) || (lang === 'python' && PY_T.test(w))) span('t', w);
        else if (TYPED[lang] && /^[A-Z]/.test(w) && /[a-z]/.test(w)) span('t', w);
        else if (nx === '(') span('f', w);
        else out += esc(w);
        i += w.length; continue;
      }
      out += esc(ch); i++;
    }
    return out;
  }

  function copyText(text, btn) {
    function ok() { btn.innerHTML = BK.icon('check'); setTimeout(function () { btn.innerHTML = BK.icon('copy'); }, 1300); }
    function fallback() {
      var ta = h('textarea', { class: 'sr' }); ta.value = text; D.body.appendChild(ta); ta.select();
      try { D.execCommand('copy'); ok(); } catch (e) {}
      ta.remove();
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
      else fallback();
    } catch (e) { fallback(); }
  }
  function doCode(el) {
    $$('pre[data-lang]', el).forEach(function (pre) {
      if (pre.parentNode.classList.contains('code')) return;
      var lang = (pre.getAttribute('data-lang') || 'text').toLowerCase(), raw = pre.textContent, isOut = lang === 'output';
      var box = h('div', { class: 'code' + (isOut ? ' out' : ''), 'data-lang': lang });
      if (pre.hasAttribute('data-tab')) box.setAttribute('data-tab', pre.getAttribute('data-tab'));
      var copy = isOut ? null : h('button', { class: 'btn', type: 'button', title: 'Copy', 'aria-label': 'Copy this code', html: BK.icon('copy'), on: { click: function () { copyText(raw, this); } } });
      pre.parentNode.insertBefore(box, pre);
      box.appendChild(h('div', { class: 'code-head' }, [h('span', { text: pre.getAttribute('data-title') || NAMES[lang] || lang }), copy]));
      box.appendChild(pre);
      if (!isOut && lang !== 'text') pre.innerHTML = highlight(raw, lang);
    });
  }

  /* ---------------------------------------------------------------- tabs */
  function doTabs(el) {
    $$('.tabs', el).forEach(function (box) {
      if (box._pick) return;
      var panels = Array.prototype.slice.call(box.children);
      if (!panels.length) return;
      var labels = panels.map(function (p) {
        var l = (p.getAttribute('data-lang') || '').toLowerCase();
        return p.getAttribute('data-tab') || NAMES[l] || l || 'View';
      });
      var setKey = 'tab.' + labels.join('|'), uid = 'tab' + (++seq), list = h('div', { class: 'tg', role: 'tablist' }), btns = [];
      function pick(i, byUser) {
        panels.forEach(function (p, j) {
          p.hidden = j !== i;
          btns[j].setAttribute('aria-selected', String(j === i));
          btns[j].tabIndex = j === i ? 0 : -1;
        });
        if (byUser) {
          store.set(setKey, labels[i]);
          $$('.tabs').forEach(function (b) { if (b !== box && b._key === setKey && b._pick) b._pick(i, false); });
          window.dispatchEvent(new Event('resize'));
        }
      }
      labels.forEach(function (lab, i) {
        var b = h('button', {
          type: 'button', role: 'tab', id: uid + 't' + i, 'aria-controls': uid + 'p' + i, text: lab, on: {
            click: function () { pick(i, true); },
            keydown: function (e) {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              e.preventDefault();
              var k = (i + (e.key === 'ArrowRight' ? 1 : labels.length - 1)) % labels.length;
              pick(k, true); btns[k].focus();
            }
          }
        });
        panels[i].setAttribute('role', 'tabpanel'); panels[i].id = uid + 'p' + i; panels[i].setAttribute('aria-labelledby', uid + 't' + i);
        btns.push(b); list.appendChild(b);
      });
      box.insertBefore(list, box.firstChild);
      box._pick = pick; box._key = setKey;
      var start = labels.indexOf(store.get(setKey, ''));
      pick(start >= 0 ? start : 0, false);
    });
  }

  /* ------------------------------------------------------------ carousel */
  function makeCarousel(box) {
    if (box._car) return;
    var slides = Array.prototype.slice.call(box.children).filter(function (x) { return x.tagName === 'ARTICLE'; });
    if (!slides.length) return;
    box._car = true;
    var flash = box.classList.contains('flashcards'), title = box.getAttribute('data-title') || '';
    var view = h('div', { class: 'car-view', tabindex: '0', role: 'group', 'aria-roledescription': 'carousel', 'aria-label': title || 'Slides' });
    var count = h('span', { class: 'car-count' });
    var head = h('div', { class: 'car-head' }, [h('span', { class: 'car-title', text: title }), count]);
    box.insertBefore(head, box.firstChild);
    box.insertBefore(view, head.nextSibling);
    slides.forEach(function (s, i) {
      s.setAttribute('role', 'group'); s.setAttribute('aria-roledescription', 'slide'); s.setAttribute('aria-label', (i + 1) + ' of ' + slides.length);
      var lab = s.getAttribute('data-label');
      if (lab) s.insertBefore(h('span', { class: 'slide-label', text: lab }), s.firstChild);
      if (flash) {
        var back = $('.back', s);
        if (back) {
          back.hidden = true;
          s.appendChild(h('button', {
            class: 'btn outline flip', type: 'button', text: 'Show answer',
            on: { click: function () { back.hidden = !back.hidden; this.textContent = back.hidden ? 'Show answer' : 'Hide answer'; } }
          }));
        }
      }
      view.appendChild(s);
    });
    var now = 0, lock = null;
    var prev = h('button', { class: 'btn', type: 'button', 'aria-label': 'Previous slide', html: BK.icon('left'), on: { click: function () { go(now - 1); } } });
    var next = h('button', { class: 'btn', type: 'button', 'aria-label': 'Next slide', html: BK.icon('right'), on: { click: function () { go(now + 1); } } });
    var dots = h('div', { class: 'car-dots' }), dotBtns = [];
    if (slides.length <= 16) {
      slides.forEach(function (_, i) {
        var b = h('button', { type: 'button', 'aria-label': 'Go to slide ' + (i + 1), on: { click: function () { go(i); } } });
        dotBtns.push(b); dots.appendChild(b);
      });
    }
    box.appendChild(h('div', { class: 'car-nav' }, [prev, dots, next]));
    function set(i) {
      now = i;
      count.textContent = (i + 1) + ' / ' + slides.length;
      prev.disabled = i === 0; next.disabled = i === slides.length - 1;
      dotBtns.forEach(function (b, j) { b.setAttribute('aria-current', String(j === i)); });
    }
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      clearTimeout(lock); lock = setTimeout(function () { lock = null; }, 520);
      view.scrollTo({ left: slides[i].offsetLeft, behavior: BK.reduced ? 'auto' : 'smooth' });
      set(i);
    }
    var raf = null;
    view.addEventListener('scroll', function () {
      if (lock || raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var best = 0, bd = Infinity;
        slides.forEach(function (s, i) { var d = Math.abs(s.offsetLeft - view.scrollLeft); if (d < bd) { bd = d; best = i; } });
        if (best !== now) set(best);
      });
    }, { passive: true });
    view.addEventListener('keydown', function (e) {
      if (e.target !== view) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(now + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(now - 1); }
    });
    window.addEventListener('resize', function () { if (view.clientWidth) view.scrollLeft = slides[now].offsetLeft; });
    set(0);
  }
  function doCarousel(el) { $$('.carousel', el).forEach(makeCarousel); }

  /* ------------------------------------------------------- pattern cards */
  function doTables(el) {
    $$('table.patterns', el).forEach(function (table) {
      if (table.closest('.patterns-box')) return;
      var heads = $$('thead th', table).map(function (th) { return th.textContent.trim(); });
      var rows = $$('tbody tr', table);
      if (!rows.length) return;
      var cap = $('caption', table), title = cap ? cap.textContent.trim() : 'Patterns to remember';
      if (cap) cap.remove();
      var box = h('div', { class: 'patterns-box' });
      table.parentNode.insertBefore(box, table);
      var wrap = h('div', { class: 'table-wrap' }, [table]);
      var car = h('div', { class: 'carousel' });
      rows.forEach(function (tr, i) {
        var cells = $$('td, th', tr);
        var art = h('article', { class: 'pat', 'data-label': 'Pattern ' + (i + 1) + ' of ' + rows.length });
        art.appendChild(h('h4', { html: cells[0] ? cells[0].innerHTML : '' }));
        var dl = h('dl');
        for (var k = 1; k < cells.length; k++) {
          dl.appendChild(h('dt', { text: heads[k] || '' }));
          dl.appendChild(h('dd', { class: /model|example/i.test(heads[k] || '') ? 'model' : null, html: cells[k].innerHTML }));
        }
        art.appendChild(dl); car.appendChild(art);
      });
      var bT = h('button', { type: 'button', on: { click: function () { set('table', true); } } }, [ic('table'), 'Table']);
      var bC = h('button', { type: 'button', on: { click: function () { set('cards', true); } } }, [ic('cards'), 'Cards']);
      function set(mode, save) {
        wrap.hidden = mode !== 'table'; car.hidden = mode !== 'cards';
        bT.setAttribute('aria-pressed', String(mode === 'table')); bC.setAttribute('aria-pressed', String(mode === 'cards'));
        if (save) { store.set('patterns', mode); window.dispatchEvent(new Event('resize')); }
      }
      box.appendChild(h('div', { class: 'patterns-head' }, [
        h('span', { class: 'car-title', text: title }),
        h('div', { class: 'tg', role: 'group', 'aria-label': 'How to show the patterns' }, [bT, bC])
      ]));
      box.appendChild(wrap); box.appendChild(car);
      makeCarousel(car);
      set(store.get('patterns', window.innerWidth < 700 ? 'cards' : 'table'), false);
    });
    $$('table', el).forEach(function (t) {
      if (t.closest('.table-wrap') || t.closest('figure.chart')) return;
      var w = h('div', { class: 'table-wrap' });
      t.parentNode.insertBefore(w, t); w.appendChild(t);
    });
  }

  /* ------------------------------------------- callouts, examples, steps */
  var CO = { note: ['info', 'Good to know'], tip: ['bulb', 'Tip'], warn: ['alert', 'Careful'], plain: ['chat', 'In simple words'], exam: ['award', 'Exam tip'] };
  function doBoxes(el) {
    $$('aside', el).forEach(function (a) {
      if (a.classList.contains('callout')) return;
      var kind = null;
      Object.keys(CO).forEach(function (k) { if (a.classList.contains(k)) kind = k; });
      if (!kind) kind = 'note', a.classList.add('note');
      var main = h('div', { class: 'co-main' });
      while (a.firstChild) main.appendChild(a.firstChild);
      main.insertBefore(h('p', { class: 'co-title', text: a.getAttribute('data-title') || CO[kind][1] }), main.firstChild);
      a.classList.add('callout');
      a.appendChild(h('span', { class: 'co-icon', html: BK.icon(CO[kind][0]) }));
      a.appendChild(main);
    });
    $$('.example', el).forEach(function (x) {
      if ($(':scope > .ex-body', x)) return;
      var body = h('div', { class: 'ex-body' });
      while (x.firstChild) body.appendChild(x.firstChild);
      x.appendChild(h('p', { class: 'ex-title' }, [h('span', { text: x.getAttribute('data-title') || 'Example' })]));
      x.appendChild(body);
    });
    $$('ol.steps', el).forEach(function (ol) {
      if (ol._steps) return; ol._steps = true;
      var items = Array.prototype.slice.call(ol.children);
      if (items.length < 3) return;
      var shown = items.length;
      var nextBtn = h('button', { class: 'btn outline steps-next', type: 'button', hidden: true, text: 'Next step', on: { click: function () { shown++; paint(); } } });
      var tgl = h('button', {
        class: 'btn', type: 'button', 'aria-pressed': 'false', title: 'Show one step at a time', on: {
          click: function () {
            var on = this.getAttribute('aria-pressed') !== 'true';
            this.setAttribute('aria-pressed', String(on));
            shown = on ? 1 : items.length; paint();
          }
        }
      }, [ic('steps'), h('span', { text: 'Step by step' })]);
      function paint() {
        items.forEach(function (li, i) { li.classList.toggle('is-later', i >= shown); });
        nextBtn.hidden = shown >= items.length;
      }
      var ex = ol.closest('.example'), bar = ex && $(':scope > .ex-title', ex);
      if (bar && !$('.btn', bar)) { bar.appendChild(h('span', { class: 'grow' })); bar.appendChild(tgl); }
      else ol.parentNode.insertBefore(h('div', { class: 'steps-bar' }, [tgl]), ol);
      ol.parentNode.insertBefore(nextBtn, ol.nextSibling);
    });
  }

  /* ------------------------------------------------------------ theorems */
  var thmCache = null;
  BK.thmById = {};
  BK.theorems = function () {
    if (thmCache) return thmCache;
    thmCache = [];
    BK.chapters.forEach(function (c) {
      $$('.thm[id][data-name]:not([data-same])', c.el).forEach(function (t) {
        var o = {
          id: t.id, name: t.getAttribute('data-name'), kind: t.getAttribute('data-kind') || 'Theorem', chapter: c,
          needIds: (t.getAttribute('data-needs') || '').split(/\s+/).filter(Boolean), needs: [], usedBy: []
        };
        thmCache.push(o); BK.thmById[o.id] = o;
      });
    });
    thmCache.forEach(function (o) {
      o.needIds.forEach(function (id) {
        var n = BK.thmById[id];
        if (n && n !== o && o.needs.indexOf(n) < 0) { o.needs.push(n); n.usedBy.push(o); }
      });
    });
    return thmCache;
  };
  var SOFT = /^(definition|notation|algorithm|fact|property|test|method)$/i;
  function doThm(el) {
    BK.theorems();
    $$('.thm', el).forEach(function (t) {
      if ($(':scope > .thm-head', t)) return;
      var kind = t.getAttribute('data-kind') || 'Theorem', name = t.getAttribute('data-name');
      t.insertBefore(h('div', { class: 'thm-head' }, [
        h('span', { class: 'badge' + (SOFT.test(kind) ? '' : ' brand'), text: kind }),
        name ? h('span', { class: 'thm-name', text: name }) : null
      ]), t.firstChild);
      var same = t.getAttribute('data-same'), main = same && BK.thmById[same];
      if (main) {
        t.appendChild(h('div', { class: 'thm-links' }, [
          h('span', { text: 'Main entry' }),
          h('a', { class: 'chip', href: '#' + main.id, text: main.name + ' \u00b7 chapter ' + main.chapter.n })
        ]));
        return;
      }
      var me = t.id && BK.thmById[t.id];
      if (!me) return;
      var links = h('div', { class: 'thm-links' });
      if (me.needs.length) {
        links.appendChild(h('span', { text: 'Builds on' }));
        me.needs.forEach(function (n) { links.appendChild(h('a', { class: 'chip', href: '#' + n.id, text: n.name })); });
      }
      if (me.usedBy.length) {
        links.appendChild(h('span', { text: 'Used by' }));
        me.usedBy.slice(0, 6).forEach(function (n) { links.appendChild(h('a', { class: 'chip', href: '#' + n.id, text: n.name })); });
        if (me.usedBy.length > 6) links.appendChild(h('a', { class: 'chip', href: '#theorems?focus=' + t.id, text: '+' + (me.usedBy.length - 6) + ' more' }));
      }
      links.appendChild(h('a', { class: 'chip', href: '#theorems?focus=' + t.id, title: 'See this in the theorem graph' }, [ic('network'), 'Graph']));
      t.appendChild(links);
    });
  }

  /* ------------------------------------------------------ quiz and blanks */
  function norm(a) {
    return String(a).trim().toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
  }
  function doPractice(el, c) {
    var quizzes = $$('.quiz', el), firstTry = 0;
    quizzes.forEach(function (q) {
      var list = $('ul, ol', q);
      if (!list || q._quiz) return;
      q._quiz = true;
      var msg = h('p', { class: 'quiz-msg', role: 'status' }), tries = 0, solved = false;
      Array.prototype.slice.call(list.children).forEach(function (li, i) {
        var ok = li.hasAttribute('data-correct');
        var body = h('span');
        while (li.firstChild) body.appendChild(li.firstChild);
        var btn = h('button', { class: 'quiz-opt', type: 'button' }, [h('span', { class: 'quiz-key', text: String.fromCharCode(65 + i) }), body]);
        li.appendChild(btn);
        btn.addEventListener('click', function () {
          if (solved || btn.getAttribute('data-state')) return;
          tries++;
          if (ok) {
            solved = true;
            btn.setAttribute('data-state', 'right'); q.setAttribute('data-done', '1');
            msg.className = 'quiz-msg right'; msg.textContent = tries === 1 ? 'Correct.' : 'Correct now.';
            if (tries === 1) firstTry++;
            if (BK.markScore) BK.markScore(c, firstTry, quizzes.length);
          } else {
            btn.setAttribute('data-state', 'wrong');
            msg.className = 'quiz-msg wrong'; msg.textContent = 'Not this one. Try again.';
          }
        });
      });
      q.insertBefore(msg, $('.why', q));
    });
    $$('span.blank[data-answer]', el).forEach(function (s) {
      if (s._blank) return; s._blank = true;
      var all = s.getAttribute('data-answer').split('|'), answers = all.map(norm), first = all[0].trim();
      var hint = s.textContent.trim(), tries = 0;
      var input = h('input', {
        class: 'blank-in', type: 'text', placeholder: hint, 'aria-label': 'Your answer' + (hint ? '. Hint: ' + hint : ''),
        autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
        size: String(Math.max(4, Math.min(30, Math.max(first.length, hint.length) + 2)))
      });
      var show = h('button', {
        class: 'blank-show', type: 'button', hidden: true, text: 'show',
        on: { click: function () { input.value = first; input.setAttribute('data-state', 'right'); input.readOnly = true; show.hidden = true; } }
      });
      function check() {
        var v = norm(input.value);
        if (!v || input.readOnly) return;
        if (answers.indexOf(v) >= 0) { input.setAttribute('data-state', 'right'); input.readOnly = true; show.hidden = true; }
        else { input.setAttribute('data-state', 'wrong'); tries++; if (tries >= 2) show.hidden = false; }
      }
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      input.addEventListener('change', check);
      input.addEventListener('input', function () { if (input.getAttribute('data-state') === 'wrong') input.removeAttribute('data-state'); });
      s.textContent = ''; s.appendChild(input); s.appendChild(show);
    });
  }

  /* ------------------------------------------------------------ word help */
  var tipEl = null, tipFor = null;
  function hideTip() { if (tipEl) { tipEl.remove(); tipEl = null; tipFor = null; } }
  function showTip(d) {
    if (tipFor === d) return;
    hideTip();
    var def = d.getAttribute('data-def');
    if (!def) return;
    tipFor = d;
    tipEl = h('div', { class: 'tip-pop', role: 'tooltip' }, [h('b', { text: d.textContent.trim() }), def]);
    D.body.appendChild(tipEl);
    var r = d.getBoundingClientRect(), w = tipEl.offsetWidth, hh = tipEl.offsetHeight;
    var x = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
    var y = r.top - hh - 8;
    if (y < 64) y = r.bottom + 8;
    tipEl.style.left = (x + window.scrollX) + 'px';
    tipEl.style.top = (y + window.scrollY) + 'px';
  }
  function dfnOf(e) { return e.target && e.target.closest ? e.target.closest('dfn[data-def]') : null; }
  D.addEventListener('mouseover', function (e) { var d = dfnOf(e); if (d) showTip(d); });
  D.addEventListener('mouseout', function (e) { if (dfnOf(e)) hideTip(); });
  D.addEventListener('focusin', function (e) { var d = dfnOf(e); if (d) showTip(d); });
  D.addEventListener('focusout', function (e) { if (dfnOf(e)) hideTip(); });
  D.addEventListener('click', function (e) { var d = dfnOf(e); if (d) { if (tipFor === d && e.detail === 0) hideTip(); else showTip(d); } else hideTip(); });
  window.addEventListener('scroll', hideTip, { passive: true });
  function doWords(el) {
    $$('dfn[title]', el).forEach(function (d) {
      d.setAttribute('data-def', d.getAttribute('title'));
      d.removeAttribute('title');
      d.tabIndex = 0;
    });
  }

  function enhance(el, c) {
    doTables(el); doBoxes(el); doThm(el); doCode(el); doTabs(el); doCarousel(el); doPractice(el, c); doWords(el);
  }
  BK.enhance = enhance;
  BK.doMath = doMath;
  BK.makeCarousel = makeCarousel;
  BK.enhancers.push(enhance);
  BK.lastEnhancer = function (el) { doMath(el); };
})();

/* ---- 40-viz.js ---- */
/* Pictures drawn by the page, in the spirit of D3 but with no library:
   a collapsible tree, a force-directed graph, a function plot and a small chart. */
(function () {
  'use strict';
  var BK = window.BK, D = BK.D, $ = BK.$, $$ = BK.$$, h = BK.h, ic = BK.ic;
  var NS = 'http://www.w3.org/2000/svg', uid = 0;

  function s(tag, attrs, text) {
    var el = D.createElementNS(NS, tag), k;
    if (attrs) for (k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) el.setAttribute(k, attrs[k]);
    if (text !== undefined) el.textContent = text;
    return el;
  }
  var ctx = null;
  function textW(str, px) {
    if (!ctx) { try { ctx = D.createElement('canvas').getContext('2d'); } catch (e) { ctx = false; } }
    if (!ctx) return String(str).length * (px || 13) * 0.56;
    ctx.font = (px || 13) + 'px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    return ctx.measureText(String(str)).width * 1.06;
  }
  function toolBtn(icon, label, fn, text) {
    return h('button', { class: 'btn', type: 'button', title: label, 'aria-label': label, on: { click: fn } }, [ic(icon), text ? h('span', { text: text }) : null]);
  }
  function frame(fig) {
    var box = h('div', { class: 'viz' });
    var cap = $(':scope > figcaption', fig);
    fig.insertBefore(box, cap || null);
    return box;
  }

  /* ================================================================ tree */
  function parseList(ul) {
    function node(li) {
      var label = '', href = null, kids = [];
      Array.prototype.forEach.call(li.childNodes, function (n) {
        if (n.nodeType === 3) label += n.textContent;
        else if (n.nodeType === 1 && (n.tagName === 'UL' || n.tagName === 'OL')) {
          Array.prototype.forEach.call(n.children, function (c) { if (c.tagName === 'LI') kids.push(node(c)); });
        } else if (n.nodeType === 1) {
          label += n.textContent;
          if (n.tagName === 'A' && !href) href = n.getAttribute('href');
        }
      });
      return { label: label.replace(/\s+/g, ' ').trim(), href: href, kids: kids, tip: li.getAttribute('title') };
    }
    var lis = Array.prototype.filter.call(ul.children, function (c) { return c.tagName === 'LI'; });
    if (lis.length === 1) return node(lis[0]);
    return { label: '', kids: lis.map(node) };
  }

  function makeTree(host, root, opt) {
    opt = opt || {};
    var ROW = 30, PADX = 14, PADY = 20, R = 5.5, GAP = 42;
    var svg = s('svg', { class: 'tree-svg', role: 'tree', 'aria-label': opt.label || 'Tree diagram' });
    var gLinks = s('g'), gNodes = s('g');
    svg.appendChild(gLinks); svg.appendChild(gNodes);
    var scroll = h('div', { class: 'viz-scroll' }, [svg]);
    host.appendChild(h('div', { class: 'viz-tools' }, [
      toolBtn('plus', 'Open every branch', function () { all.forEach(function (n) { n.open = true; }); update(root); }, 'Open all'),
      toolBtn('minus', 'Close every branch', function () { all.forEach(function (n) { n.open = n === root; }); update(root); }, 'Close all')
    ]));
    host.appendChild(scroll);
    var all = [], raf = null, curW = 0, curH = 0;
    (function index(n, parent, d) {
      n.parent = parent; n.depth = d; n.label = n.label || '';
      n.short = n.label.length > 40 ? n.label.slice(0, 38) + '…' : n.label;
      all.push(n);
      n.kids.forEach(function (k) { index(k, n, d + 1); });
    })(root, null, 0);
    var openDepth = opt.open === undefined ? 2 : opt.open;
    all.forEach(function (n) { n.open = n.depth < openDepth; });

    function visible(n) { for (var p = n.parent; p; p = p.parent) if (!p.open) return false; return true; }
    function compute() {
      var rows = 0, colW = [];
      (function walk(n, d) {
        n.col = d;
        colW[d] = Math.max(colW[d] || 0, textW(n.short) + (n.kids.length ? 26 : 0));
        var vis = n.open ? n.kids : [];
        if (!vis.length) n.row = rows++;
        else { vis.forEach(function (k) { walk(k, d + 1); }); n.row = (vis[0].row + vis[vis.length - 1].row) / 2; }
      })(root, 0);
      var xs = [], acc = PADX + R;
      for (var d = 0; d < colW.length; d++) { xs[d] = acc; acc += R + 8 + colW[d] + GAP; }
      all.forEach(function (n) { if (visible(n)) { n.tx = xs[n.col]; n.ty = PADY + n.row * ROW; } });
      return { w: Math.ceil(acc - GAP + PADX), h: Math.ceil(PADY * 2 + Math.max(0, rows - 1) * ROW) };
    }
    function act(n, e) {
      var onText = e && e.target && e.target.tagName === 'text';
      if (n.href && (onText || !n.kids.length)) {
        var to = n.href;
        if (to.charAt(0) === '#') { if (location.hash === to) window.dispatchEvent(new Event('hashchange')); else location.hash = to; }
        else location.href = to;
        return;
      }
      if (n.kids.length) { n.open = !n.open; update(n); }
    }
    function ensure(n) {
      if (n.el) return;
      var g = s('g', { class: 'tree-node' + (n.kids.length ? ' has-kids' : ' is-leaf'), tabindex: '0', role: 'treeitem' });
      g.appendChild(s('circle', { r: R }));
      g.appendChild(s('text', { x: R + 8, y: 1 }, n.short));
      if (n.kids.length) { n.more = s('text', { class: 'more', y: 1 }, ''); g.appendChild(n.more); }
      if (n.tip || n.label !== n.short) g.appendChild(s('title', null, n.tip || n.label));
      g.addEventListener('click', function (e) { act(n, e); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(n, null); }
        else if (e.key === 'ArrowRight' && n.kids.length && !n.open) { e.preventDefault(); n.open = true; update(n); }
        else if (e.key === 'ArrowLeft' && n.kids.length && n.open) { e.preventDefault(); n.open = false; update(n); }
      });
      n.el = g; gNodes.appendChild(g);
      if (n.parent) { n.link = s('path', { class: 'tree-link' }); gLinks.appendChild(n.link); }
    }
    function update(src, instant) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      var hadSrc = src && src.cx !== undefined, sx0 = hadSrc ? src.cx : 0, sy0 = hadSrc ? src.cy : 0;
      var size = compute(), moving = [];
      all.forEach(function (n) {
        if (visible(n)) {
          var isNew = !n.el;
          ensure(n);
          n.fx = isNew ? (hadSrc ? sx0 : n.tx) : n.cx; n.fy = isNew ? (hadSrc ? sy0 : n.ty) : n.cy;
          n.fo = isNew ? 0 : 1; n.to = 1; n.gone = false;
          moving.push(n);
        } else if (n.el) {
          n.fx = n.cx; n.fy = n.cy; n.tx = src ? src.tx : n.cx; n.ty = src ? src.ty : n.cy;
          n.fo = 1; n.to = 0; n.gone = true;
          moving.push(n);
        }
        if (n.el && n.kids.length) {
          n.el.classList.toggle('is-shut', !n.open);
          n.el.setAttribute('aria-expanded', String(n.open));
          n.more.textContent = n.open ? '' : '+' + n.kids.length;
          n.more.setAttribute('x', R + 12 + textW(n.short));
        }
      });
      svg.setAttribute('width', Math.max(size.w, curW)); svg.setAttribute('height', Math.max(size.h, curH));
      var t0 = null, dur = (instant || BK.reduced) ? 0 : 300;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = dur ? Math.min(1, (ts - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
        moving.forEach(function (n) {
          n.cx = n.fx + (n.tx - n.fx) * e; n.cy = n.fy + (n.ty - n.fy) * e;
          n.el.setAttribute('transform', 'translate(' + n.cx.toFixed(1) + ',' + n.cy.toFixed(1) + ')');
          var o = (n.fo + (n.to - n.fo) * e).toFixed(2);
          n.el.style.opacity = o;
          if (n.link) n.link.style.opacity = o;
        });
        moving.forEach(function (n) {
          if (!n.link || !n.parent || n.parent.cx === undefined) return;
          var p = n.parent, px = Math.min(p.cx + R + 14 + textW(p.short), n.cx - R - 6), ex = n.cx - R - 1, mx = (px + ex) / 2;
          n.link.setAttribute('d', 'M' + px.toFixed(1) + ',' + p.cy.toFixed(1) + 'C' + mx.toFixed(1) + ',' + p.cy.toFixed(1) + ' ' +
            mx.toFixed(1) + ',' + n.cy.toFixed(1) + ' ' + ex.toFixed(1) + ',' + n.cy.toFixed(1));
        });
        if (k < 1) { raf = requestAnimationFrame(step); return; }
        raf = null;
        moving.forEach(function (n) {
          if (!n.gone) return;
          n.el.remove(); if (n.link) n.link.remove();
          n.el = null; n.link = null; n.cx = n.cy = undefined;
        });
        svg.setAttribute('width', size.w); svg.setAttribute('height', size.h);
        curW = size.w; curH = size.h;
      }
      if (dur) raf = requestAnimationFrame(step); else step(0);
    }
    update(null, true);
    return { update: update, root: root };
  }
  function initTree(fig) {
    if (fig._viz) return; fig._viz = true;
    var ul = $(':scope > ul, :scope > ol', fig);
    if (!ul) return;
    var root = parseList(ul);
    var box = frame(fig);
    ul.hidden = true;
    var depth = parseInt(fig.getAttribute('data-open'), 10);
    makeTree(box, root, { open: isNaN(depth) ? 2 : depth, label: ($('figcaption', fig) || {}).textContent });
  }

  /* =============================================================== graph */
  function parseGraph(src) {
    var nodes = [], byName = {}, edges = [];
    function node(name) {
      name = name.trim();
      if (!byName[name]) { byName[name] = { i: nodes.length, name: name, deg: 0 }; nodes.push(byName[name]); }
      return byName[name];
    }
    src.split('\n').forEach(function (line) {
      line = line.trim();
      if (!line || line.charAt(0) === '#') return;
      var m = /^(.+?)\s*(<->|->|--)\s*(.+?)(?:\s+:\s+(.*))?$/.exec(line);
      if (!m) { node(line); return; }
      var to = m[3], label = m[4] || '', cut = to.search(/:\s+/);
      if (!label && cut > 0) { label = to.slice(cut + 1); to = to.slice(0, cut); }
      var a = node(m[1]), b = node(to);
      if (a === b) return;
      a.deg++; b.deg++;
      edges.push({ a: a, b: b, label: label.trim(), dir: m[2] === '->' ? 1 : m[2] === '<->' ? 2 : 0 });
    });
    return { nodes: nodes, edges: edges };
  }
  function layoutGraph(g, W, H) {
    var nodes = g.nodes, n = nodes.length;
    if (!n) return;
    var k = Math.sqrt(W * H / n) * 0.82, t = W / 7, iters = n > 150 ? 200 : 300, i, j, it;
    nodes.forEach(function (v, idx) {
      var a = 2 * Math.PI * idx / n, r = Math.min(W, H) * (0.2 + 0.22 * ((idx * 53) % 17) / 17);
      v.x = W / 2 + r * Math.cos(a) * 1.5; v.y = H / 2 + r * Math.sin(a);
    });
    for (it = 0; it < iters; it++) {
      for (i = 0; i < n; i++) { nodes[i].dx = 0; nodes[i].dy = 0; }
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          var a = nodes[i], b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy + 0.01, f = k * k / d2;
          a.dx += dx * f; a.dy += dy * f; b.dx -= dx * f; b.dy -= dy * f;
        }
      }
      g.edges.forEach(function (e) {
        var dx = e.a.x - e.b.x, dy = e.a.y - e.b.y, d = Math.sqrt(dx * dx + dy * dy) + 0.01, f = d / k;
        e.a.dx -= dx * f; e.a.dy -= dy * f; e.b.dx += dx * f; e.b.dy += dy * f;
      });
      for (i = 0; i < n; i++) {
        var v = nodes[i];
        v.dx += (W / 2 - v.x) * 0.05; v.dy += (H / 2 - v.y) * 0.08;
        var d = Math.sqrt(v.dx * v.dx + v.dy * v.dy) + 0.01, lim = Math.min(d, t);
        v.x += v.dx / d * lim; v.y += v.dy / d * lim;
      }
      t *= 0.985;
    }
    /* turn the picture so its long side is horizontal (labels read better) */
    var mx = 0, my = 0, sxx = 0, syy = 0, sxy = 0;
    nodes.forEach(function (v) { mx += v.x / n; my += v.y / n; });
    nodes.forEach(function (v) { var ux = v.x - mx, uy = v.y - my; sxx += ux * ux; syy += uy * uy; sxy += ux * uy; });
    var ang = 0.5 * Math.atan2(2 * sxy, sxx - syy), ca = Math.cos(-ang), sa = Math.sin(-ang);
    nodes.forEach(function (v) {
      var ux = v.x - mx, uy = v.y - my;
      v.x = W / 2 + (ux * ca - uy * sa); v.y = H / 2 + (ux * sa + uy * ca);
    });
    var flow = 0;
    g.edges.forEach(function (e) { if (e.dir === 1) flow += e.b.x - e.a.x; });
    if (flow < 0) nodes.forEach(function (v) { v.x = W - v.x; });
    var maxW = 0, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    nodes.forEach(function (v) { maxW = Math.max(maxW, v.w); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); });
    var tw = W - maxW - 40, th = H - 90, fx = x1 - x0 > tw ? tw / (x1 - x0) : 1, fy = y1 - y0 > th ? th / (y1 - y0) : 1;
    nodes.forEach(function (v) { v.x = W / 2 + (v.x - (x0 + x1) / 2) * fx; v.y = H / 2 + (v.y - (y0 + y1) / 2) * fy; });
    for (it = 0; it < 30; it++) {           /* push overlapping boxes apart */
      var moved = false;
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          var p = nodes[i], q = nodes[j], ox = (p.w + q.w) / 2 + 14 - Math.abs(p.x - q.x), oy = 44 - Math.abs(p.y - q.y);
          if (ox > 0 && oy > 0) {
            moved = true;
            if (oy < ox) { var sy = p.y <= q.y ? -1 : 1; p.y += sy * oy / 2; q.y -= sy * oy / 2; }
            else { var sx = p.x <= q.x ? -1 : 1; p.x += sx * ox / 2; q.x -= sx * ox / 2; }
          }
        }
      }
      if (!moved) break;
    }
  }
  function clipToBox(cx, cy, hw, hh, tx, ty) {
    var dx = tx - cx, dy = ty - cy;
    if (!dx && !dy) return [cx, cy];
    var sx = dx ? hw / Math.abs(dx) : Infinity, sy = dy ? hh / Math.abs(dy) : Infinity, sc = Math.min(sx, sy);
    return [cx + dx * sc, cy + dy * sc];
  }
  function makeGraph(host, g, opt) {
    opt = opt || {};
    var id = 'g' + (++uid), n = g.nodes.length;
    g.nodes.forEach(function (v) { v.w = Math.max(44, textW(v.name) + 24); v.near = [v]; v.edges = []; });
    var hostW0 = Math.max(320, Math.min(host.clientWidth || 700, 900));
    var W = n > 60 ? 1700 : n > 24 ? 1100 : hostW0, H = n > 60 ? 1150 : n > 24 ? 700 : Math.min(opt.maxHeight || 520, Math.max(240, 70 * Math.sqrt(n) * 1.5));
    layoutGraph(g, W, H);
    var maxDeg = 0;
    g.nodes.forEach(function (v) { if (v.deg > maxDeg) maxDeg = v.deg; });
    var svg = s('svg', { class: 'graph-svg', role: 'img', 'aria-label': opt.label || 'Graph of connected ideas' });
    var defs = s('defs');
    ['', ' on'].forEach(function (cls, i) {
      var mk = s('marker', { id: id + (i ? 'b' : 'a'), viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' });
      mk.appendChild(s('path', { d: 'M0 0 10 5 0 10z', class: 'g-arrow' + cls }));
      defs.appendChild(mk);
    });
    svg.appendChild(defs);
    var gE = s('g'), gL = s('g'), gN = s('g');
    svg.appendChild(gE); svg.appendChild(gL); svg.appendChild(gN);
    var pairs = {};
    g.edges.forEach(function (e) {
      var key = Math.min(e.a.i, e.b.i) + '-' + Math.max(e.a.i, e.b.i);
      (pairs[key] = pairs[key] || []).push(e);
      e.a.near.push(e.b); e.b.near.push(e.a); e.a.edges.push(e); e.b.edges.push(e);
      e.path = s('path', { class: 'g-edge' });
      if (e.dir) e.path.setAttribute('marker-end', 'url(#' + id + 'a)');
      if (e.dir === 2) e.path.setAttribute('marker-start', 'url(#' + id + 'a)');
      gE.appendChild(e.path);
      if (e.label) { e.text = s('text', { class: 'g-edge-label' }, e.label); gL.appendChild(e.text); }
    });
    Object.keys(pairs).forEach(function (key) {
      var list = pairs[key];
      list.forEach(function (e, idx) { e.bend = (idx - (list.length - 1) / 2) * 34 * (e.a.i < e.b.i ? 1 : -1); });
    });
    function drawEdge(e) {
      var ax = e.a.x, ay = e.a.y, bx = e.b.x, by = e.b.y, mx = (ax + bx) / 2, my = (ay + by) / 2;
      var len = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay)) || 1;
      var cx = mx - (by - ay) / len * e.bend, cy = my + (bx - ax) / len * e.bend;
      var p1 = clipToBox(ax, ay, e.a.w / 2 + 2, 17, cx, cy), p2 = clipToBox(bx, by, e.b.w / 2 + 4, 19, cx, cy);
      e.path.setAttribute('d', e.bend
        ? 'M' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1) + 'Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1)
        : 'M' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1) + 'L' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1));
      if (e.text) {
        e.text.setAttribute('x', ((p1[0] + p2[0]) / 2 + (cx - mx) * 0.5).toFixed(1));
        e.text.setAttribute('y', ((p1[1] + p2[1]) / 2 + (cy - my) * 0.5).toFixed(1));
      }
    }
    var view = { x: 0, y: 0, w: W, h: H }, pinned = null;
    function applyView() { svg.setAttribute('viewBox', view.x.toFixed(1) + ' ' + view.y.toFixed(1) + ' ' + view.w.toFixed(1) + ' ' + view.h.toFixed(1)); }
    function fit() {
      var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      g.nodes.forEach(function (v) { x0 = Math.min(x0, v.x - v.w / 2); x1 = Math.max(x1, v.x + v.w / 2); y0 = Math.min(y0, v.y - 16); y1 = Math.max(y1, v.y + 16); });
      if (!isFinite(x0)) { x0 = 0; y0 = 0; x1 = W; y1 = H; }
      var hostW = host.clientWidth || 736, pad = 30;
      y0 -= 22;
      var bw = x1 - x0 + pad * 2, bh = y1 - y0 + pad * 2;
      var vw = Math.max(bw, hostW), vh = Math.max(bh, 200);
      var maxH = opt.maxHeight || 560, pxH = Math.min(maxH, Math.max(200, Math.round(hostW * vh / vw)));
      vw = Math.max(vw, vh * hostW / pxH);
      view = { x: (x0 + x1) / 2 - vw / 2, y: (y0 + y1) / 2 - vh / 2, w: vw, h: vh };
      svg.setAttribute('width', '100%'); svg.setAttribute('height', pxH);
      applyView();
    }
    function zoom(f) {
      var cx = view.x + view.w / 2, cy = view.y + view.h / 2;
      view.w *= f; view.h *= f; view.x = cx - view.w / 2; view.y = cy - view.h / 2;
      applyView();
    }
    function paintFocus(v) {
      svg.classList.toggle('has-focus', !!v);
      g.nodes.forEach(function (x) { x.el.classList.toggle('is-near', !!v && v.near.indexOf(x) >= 0); x.el.classList.toggle('is-focus', x === v); });
      g.edges.forEach(function (e) {
        var on = !!v && (e.a === v || e.b === v);
        e.path.classList.toggle('is-near', on);
        if (e.text) e.text.classList.toggle('is-near', on);
        if (e.dir) e.path.setAttribute('marker-end', 'url(#' + id + (on ? 'b' : 'a') + ')');
      });
    }
    function pick(v) { pinned = pinned === v ? null : v; paintFocus(pinned); if (opt.onPick) opt.onPick(pinned); }
    function scale() { var r = svg.getBoundingClientRect(); return r.width ? view.w / r.width : 1; }
    g.nodes.forEach(function (v) {
      var el = s('g', { class: 'g-node' + (v.deg >= 3 && v.deg === maxDeg ? ' is-hub' : ''), tabindex: '0', role: 'button', 'aria-label': v.name });
      el.appendChild(s('rect', { x: (-v.w / 2).toFixed(1), y: -15, width: v.w.toFixed(1), height: 30, rx: 15 }));
      el.appendChild(s('text', { y: 0.5 }, v.name));
      v.el = el; gN.appendChild(el);
      function place() { el.setAttribute('transform', 'translate(' + v.x.toFixed(1) + ',' + v.y.toFixed(1) + ')'); }
      place(); v.place = place;
      var drag = null;
      el.addEventListener('pointerdown', function (e) {
        if (e.button) return;
        drag = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y, moved: false, k: scale() };
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
        e.stopPropagation();
      });
      el.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
        drag.moved = true; svg.classList.add('is-dragging');
        v.x = drag.vx + dx * drag.k; v.y = drag.vy + dy * drag.k;
        place(); v.edges.forEach(drawEdge);
      });
      function end() {
        if (!drag) return;
        var was = drag.moved; drag = null; svg.classList.remove('is-dragging');
        if (!was) pick(v);
      }
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', function () { drag = null; svg.classList.remove('is-dragging'); });
      el.addEventListener('mouseenter', function () { if (!pinned) paintFocus(v); });
      el.addEventListener('mouseleave', function () { if (!pinned) paintFocus(null); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(v); } });
    });
    g.edges.forEach(drawEdge);
    var pan = null;
    svg.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      pan = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, k: scale(), moved: false };
      try { svg.setPointerCapture(e.pointerId); } catch (err) {}
    });
    svg.addEventListener('pointermove', function (e) {
      if (!pan) return;
      var dx = e.clientX - pan.x, dy = e.clientY - pan.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) pan.moved = true;
      view.x = pan.vx - dx * pan.k; view.y = pan.vy - dy * pan.k; applyView();
    });
    svg.addEventListener('pointerup', function () { if (pan && !pan.moved && pinned) { pinned = null; paintFocus(null); if (opt.onPick) opt.onPick(null); } pan = null; });
    svg.addEventListener('pointercancel', function () { pan = null; });
    svg.style.touchAction = 'pan-y';
    host.appendChild(h('div', { class: 'viz-tools' }, [
      toolBtn('plus', 'Zoom in', function () { zoom(0.8); }),
      toolBtn('minus', 'Zoom out', function () { zoom(1.25); }),
      toolBtn('reset', 'Reset the picture', function () {
        layoutGraph(g, W, H); g.nodes.forEach(function (v) { v.place(); }); g.edges.forEach(drawEdge);
        pinned = null; paintFocus(null); fit();
      })
    ]));
    host.appendChild(svg);
    if (opt.hint !== false) host.appendChild(h('span', { class: 'hint', text: 'Drag a node. Click a node to see its links.' }));
    fit();
    var lastW = host.clientWidth;
    window.addEventListener('resize', function () { var w = host.clientWidth; if (w && w !== lastW) { lastW = w; fit(); } });
    return {
      fit: fit, svg: svg,
      focus: function (name) { var v = g.nodes.filter(function (x) { return x.name === name; })[0]; if (v) { pinned = v; paintFocus(v); } },
      mark: function (name) { g.nodes.forEach(function (x) { x.el.classList.toggle('is-focus', x.name === name); }); }
    };
  }
  function initGraph(fig) {
    if (fig._viz) return; fig._viz = true;
    var pre = $('pre.graph-src', fig);
    if (!pre) return;
    var g = parseGraph(pre.textContent);
    if (!g.nodes.length) return;
    var box = frame(fig);
    pre.hidden = true;
    makeGraph(box, g, { label: ($('figcaption', fig) || {}).textContent });
  }

  /* ================================================================ plot */
  var FN = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
    arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    exp: Math.exp, ln: Math.log, log: Math.log10, log10: Math.log10, log2: Math.log2, sqrt: Math.sqrt, cbrt: Math.cbrt,
    abs: Math.abs, floor: Math.floor, ceil: Math.ceil, round: Math.round, sign: Math.sign,
    relu: function (x) { return x > 0 ? x : 0; }, sigmoid: function (x) { return 1 / (1 + Math.exp(-x)); }
  };
  function compile(src) {
    var toks = [], re = /\s*([0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?|[A-Za-z_][A-Za-z0-9_]*|\*\*|[-+*\/^(),|])/g, m, pos = 0, i = 0;
    src = String(src).replace(/−/g, '-').trim();
    while (pos < src.length) {
      re.lastIndex = pos; m = re.exec(src);
      if (!m || m.index !== pos) throw new Error('cannot read "' + src + '"');
      toks.push(m[1]); pos = re.lastIndex;
    }
    function peek() { return toks[i]; }
    function next() { return toks[i++]; }
    function expr() {
      var a = term();
      while (peek() === '+' || peek() === '-') {
        (function (op, l, r) { a = op === '+' ? function (x) { return l(x) + r(x); } : function (x) { return l(x) - r(x); }; })(next(), a, term());
      }
      return a;
    }
    function term() {
      var a = unary();
      for (;;) {
        var p = peek();
        if (p === '*' || p === '/') {
          next();
          (function (op, l, r) { a = op === '*' ? function (x) { return l(x) * r(x); } : function (x) { return l(x) / r(x); }; })(p, a, unary());
        } else if (p !== undefined && (p === '(' || /^[A-Za-z_0-9.]/.test(p))) {
          (function (l, r) { a = function (x) { return l(x) * r(x); }; })(a, power());
        } else break;
      }
      return a;
    }
    function unary() {
      if (peek() === '-') { next(); var a = unary(); return function (x) { return -a(x); }; }
      if (peek() === '+') { next(); return unary(); }
      return power();
    }
    function power() {
      var a = atom();
      if (peek() === '^' || peek() === '**') { next(); var b = unary(); return function (x) { return Math.pow(a(x), b(x)); }; }
      return a;
    }
    function atom() {
      var t = next();
      if (t === undefined) throw new Error('formula ends too soon');
      if (t === '(') { var a = expr(); if (next() !== ')') throw new Error('missing )'); return a; }
      if (t === '|') { var b = expr(); if (next() !== '|') throw new Error('missing |'); return function (x) { return Math.abs(b(x)); }; }
      if (/^[0-9.]/.test(t)) { var v = parseFloat(t); return function () { return v; }; }
      if (t === 'x') return function (x) { return x; };
      if (t === 'pi') return function () { return Math.PI; };
      if (t === 'e') return function () { return Math.E; };
      if (FN[t]) {
        var f = FN[t];
        if (next() !== '(') throw new Error(t + ' needs (');
        var arg = expr();
        if (next() !== ')') throw new Error('missing )');
        return function (x) { return f(arg(x)); };
      }
      throw new Error('unknown word ' + t);
    }
    var out = expr();
    if (i < toks.length) throw new Error('extra text in formula');
    return out;
  }
  function niceStep(span, count) {
    var raw = span / Math.max(1, count), p = Math.pow(10, Math.floor(Math.log10(raw))), r = raw / p;
    return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * p;
  }
  function fmt(v) {
    if (Math.abs(v) < 1e-9) return '0';
    var a = Math.abs(v);
    if (a >= 10000 || a < 0.001) return v.toExponential(1);
    return String(Math.round(v * 1000) / 1000);
  }
  function pair(str, def) {
    var p = String(str || '').split(/[\s,]+/).map(parseFloat).filter(function (v) { return !isNaN(v); });
    return p.length === 2 && p[1] > p[0] ? p : def;
  }
  function initPlot(fig) {
    if (fig._viz) return; fig._viz = true;
    var srcs = (fig.getAttribute('data-fn') || '').split(';').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 4);
    var labels = (fig.getAttribute('data-labels') || '').split(';').map(function (x) { return x.trim(); });
    var fns = [];
    srcs.forEach(function (src, i) { try { fns.push({ f: compile(src), label: labels[i] || src, n: fns.length + 1 }); } catch (e) {} });
    if (!fns.length) return;
    var xr = pair(fig.getAttribute('data-x'), [-5, 5]), N = 520, W = 720, H = 380, L = 48, R = 16, T = 14, B = 30;
    var xs = [], i, j;
    for (i = 0; i <= N; i++) xs.push(xr[0] + (xr[1] - xr[0]) * i / N);
    fns.forEach(function (o) { o.ys = xs.map(function (x) { var y = o.f(x); return isFinite(y) ? y : NaN; }); });
    var yr = pair(fig.getAttribute('data-y'), null);
    if (!yr) {
      var vals = [];
      fns.forEach(function (o) { o.ys.forEach(function (y) { if (!isNaN(y)) vals.push(y); }); });
      vals.sort(function (a, b) { return a - b; });
      if (!vals.length) vals = [-1, 1];
      var lo = vals[Math.floor(vals.length * 0.02)], hi = vals[Math.ceil(vals.length * 0.98) - 1];
      if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
      var padY = (hi - lo) * 0.12;
      yr = [lo - padY, hi + padY];
    }
    function sx(x) { return L + (x - xr[0]) / (xr[1] - xr[0]) * (W - L - R); }
    function sy(y) { return T + (yr[1] - y) / (yr[1] - yr[0]) * (H - T - B); }
    var box = frame(fig), id = 'p' + (++uid);
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img', 'aria-label': 'Graph of ' + fns.map(function (o) { return o.label; }).join(', ') });
    var clip = s('clipPath', { id: id }); clip.appendChild(s('rect', { x: L, y: T, width: W - L - R, height: H - T - B }));
    svg.appendChild(clip);
    var stepX = niceStep(xr[1] - xr[0], 9), stepY = niceStep(yr[1] - yr[0], 6), v;
    for (v = Math.ceil(xr[0] / stepX) * stepX; v <= xr[1] + 1e-9; v += stepX) {
      svg.appendChild(s('line', { class: 'plot-grid', x1: sx(v), x2: sx(v), y1: T, y2: H - B }));
      svg.appendChild(s('text', { class: 'plot-tick', x: sx(v), y: H - B + 16, 'text-anchor': 'middle' }, fmt(v)));
    }
    for (v = Math.ceil(yr[0] / stepY) * stepY; v <= yr[1] + 1e-9; v += stepY) {
      svg.appendChild(s('line', { class: 'plot-grid', x1: L, x2: W - R, y1: sy(v), y2: sy(v) }));
      svg.appendChild(s('text', { class: 'plot-tick', x: L - 7, y: sy(v) + 4, 'text-anchor': 'end' }, fmt(v)));
    }
    var ax = Math.min(Math.max(0, xr[0]), xr[1]), ay = Math.min(Math.max(0, yr[0]), yr[1]);
    svg.appendChild(s('line', { class: 'plot-axis', x1: L, x2: W - R, y1: sy(ay), y2: sy(ay) }));
    svg.appendChild(s('line', { class: 'plot-axis', x1: sx(ax), x2: sx(ax), y1: T, y2: H - B }));
    var span = yr[1] - yr[0];
    fns.forEach(function (o) {
      var d = '', pen = false, prevY = NaN;
      for (j = 0; j <= N; j++) {
        var y = o.ys[j];
        if (isNaN(y) || y > yr[1] + span * 4 || y < yr[0] - span * 4 || (pen && Math.abs(y - prevY) > span * 1.5)) { pen = false; prevY = y; continue; }
        d += (pen ? 'L' : 'M') + sx(xs[j]).toFixed(1) + ',' + sy(y).toFixed(1);
        pen = true; prevY = y;
      }
      svg.appendChild(s('path', { class: 'plot-line c' + o.n, d: d, 'clip-path': 'url(#' + id + ')' }));
    });
    var cross = s('line', { class: 'plot-cross', y1: T, y2: H - B, visibility: 'hidden' });
    svg.appendChild(cross);
    fns.forEach(function (o) { o.dot = s('circle', { r: 4.5, class: 'f' + o.n, visibility: 'hidden' }); svg.appendChild(o.dot); });
    var read = h('div', { class: 'plot-read' });
    function legend() {
      read.textContent = '';
      fns.forEach(function (o) { read.appendChild(h('span', null, [h('i', { class: 'b' + o.n }), o.label])); });
      read.appendChild(h('span', { class: 'x', text: 'Move over the graph to read values.' }));
    }
    function at(e) {
      var r = svg.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W;
      var x = xr[0] + (Math.min(W - R, Math.max(L, px)) - L) / (W - L - R) * (xr[1] - xr[0]);
      cross.setAttribute('x1', sx(x)); cross.setAttribute('x2', sx(x)); cross.setAttribute('visibility', 'visible');
      read.textContent = '';
      read.appendChild(h('span', { class: 'x', text: 'x = ' + fmt(x) }));
      fns.forEach(function (o) {
        var y = o.f(x), ok = isFinite(y) && y >= yr[0] && y <= yr[1];
        o.dot.setAttribute('visibility', ok ? 'visible' : 'hidden');
        if (ok) { o.dot.setAttribute('cx', sx(x)); o.dot.setAttribute('cy', sy(y)); }
        read.appendChild(h('span', null, [h('i', { class: 'b' + o.n }), o.label + ' = ' + (isFinite(y) ? fmt(y) : 'not defined')]));
      });
    }
    svg.addEventListener('pointermove', at);
    svg.addEventListener('pointerdown', at);
    svg.addEventListener('pointerleave', function () {
      cross.setAttribute('visibility', 'hidden');
      fns.forEach(function (o) { o.dot.setAttribute('visibility', 'hidden'); });
      legend();
    });
    box.appendChild(svg); box.appendChild(read);
    legend();
  }

  /* =============================================================== chart */
  function initChart(fig) {
    if (fig._viz) return; fig._viz = true;
    var table = $('table', fig);
    if (!table) return;
    var heads = $$('thead th', table).map(function (th) { return th.textContent.trim(); });
    var rows = $$('tbody tr', table).map(function (tr) { return $$('td, th', tr).map(function (c) { return c.textContent.trim(); }); });
    if (!rows.length || heads.length < 2) return;
    var series = heads.slice(1, 5).map(function (name, k) {
      return { name: name, n: k + 1, v: rows.map(function (r) { return parseFloat(String(r[k + 1] || '').replace(/[, %$£€]/g, '')); }) };
    });
    var cats = rows.map(function (r) { return r[0]; }), type = (fig.getAttribute('data-type') || 'bar').toLowerCase();
    var W = 720, H = 340, L = 52, R = 16, T = 18, B = 38, lo = 0, hi = -Infinity;
    series.forEach(function (sr) { sr.v.forEach(function (v) { if (!isNaN(v)) { hi = Math.max(hi, v); lo = Math.min(lo, v); } }); });
    if (!isFinite(hi)) return;
    if (hi === lo) hi = lo + 1;
    var step = niceStep(hi - lo, 5);
    hi = Math.ceil(hi / step) * step; lo = Math.floor(lo / step) * step;
    function sy(v) { return T + (hi - v) / (hi - lo) * (H - T - B); }
    var band = (W - L - R) / cats.length;
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img', 'aria-label': ($('figcaption', fig) || {}).textContent || 'Chart' });
    for (var v = lo; v <= hi + 1e-9; v += step) {
      svg.appendChild(s('line', { class: 'plot-grid', x1: L, x2: W - R, y1: sy(v), y2: sy(v) }));
      svg.appendChild(s('text', { class: 'plot-tick', x: L - 7, y: sy(v) + 4, 'text-anchor': 'end' }, fmt(v)));
    }
    svg.appendChild(s('line', { class: 'plot-axis', x1: L, x2: W - R, y1: sy(0), y2: sy(0) }));
    var every = Math.ceil(cats.length / 12);
    cats.forEach(function (c, i) {
      if (i % every) return;
      svg.appendChild(s('text', { class: 'plot-tick', x: L + band * (i + 0.5), y: H - B + 18, 'text-anchor': 'middle' }, c.length > 14 ? c.slice(0, 13) + '…' : c));
    });
    if (type === 'line') {
      series.forEach(function (sr) {
        var d = '', pen = false;
        sr.v.forEach(function (val, i) {
          if (isNaN(val)) { pen = false; return; }
          d += (pen ? 'L' : 'M') + (L + band * (i + 0.5)).toFixed(1) + ',' + sy(val).toFixed(1); pen = true;
        });
        svg.appendChild(s('path', { class: 'plot-line c' + sr.n, d: d }));
        sr.v.forEach(function (val, i) {
          if (isNaN(val)) return;
          var dot = s('circle', { class: 'f' + sr.n, r: 4, cx: L + band * (i + 0.5), cy: sy(val) });
          dot.appendChild(s('title', null, sr.name + ', ' + cats[i] + ': ' + val));
          svg.appendChild(dot);
        });
      });
    } else {
      var inner = band * 0.72, bw = inner / series.length;
      series.forEach(function (sr, k) {
        sr.v.forEach(function (val, i) {
          if (isNaN(val)) return;
          var x = L + band * i + (band - inner) / 2 + bw * k, y0 = sy(Math.max(0, val)), y1 = sy(Math.min(0, val));
          var rect = s('rect', { class: 'chart-bar f' + sr.n, x: (x + 1).toFixed(1), y: y0.toFixed(1), width: Math.max(1, bw - 2).toFixed(1), height: Math.max(1, y1 - y0).toFixed(1), rx: 3 });
          rect.appendChild(s('title', null, sr.name + ', ' + cats[i] + ': ' + val));
          svg.appendChild(rect);
          if (cats.length * series.length <= 14) svg.appendChild(s('text', { class: 'chart-val', x: (x + bw / 2).toFixed(1), y: (y0 - 5).toFixed(1) }, fmt(val)));
        });
      });
    }
    var box = h('div', { class: 'viz' }), wrap = h('div', { class: 'table-wrap', hidden: true });
    table.parentNode.insertBefore(box, table);
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
    var bC = h('button', { class: 'btn', type: 'button', 'aria-pressed': 'true', on: { click: function () { set(true); } } }, [ic('chart'), h('span', { text: 'Chart' })]);
    var bT = h('button', { class: 'btn', type: 'button', 'aria-pressed': 'false', on: { click: function () { set(false); } } }, [ic('table'), h('span', { text: 'Table' })]);
    function set(chart) {
      svg.style.display = chart ? '' : 'none'; read.hidden = !chart; wrap.hidden = chart;
      bC.setAttribute('aria-pressed', String(chart)); bT.setAttribute('aria-pressed', String(!chart));
    }
    var read = h('div', { class: 'plot-read' });
    series.forEach(function (sr) { read.appendChild(h('span', null, [h('i', { class: 'b' + sr.n }), sr.name])); });
    box.appendChild(h('div', { class: 'viz-tools' }, [bC, bT]));
    box.appendChild(svg); box.appendChild(read);
  }

  BK.svg = s;
  BK.compilePlot = compile;
  BK.textW = textW;
  BK.makeTree = makeTree;
  BK.makeGraph = makeGraph;
  BK.viz = function (el) {
    $$('figure.tree', el).forEach(initTree);
    $$('figure.graph', el).forEach(initGraph);
    $$('figure.plot', el).forEach(initPlot);
    $$('figure.chart', el).forEach(initChart);
  };
  BK.enhancers.push(BK.viz);
})();

/* ---- 50-pages.js ---- */
/* Generated pages: home, book map, theorem map, saved chapters. */
(function () {
  'use strict';
  var BK = window.BK, $ = BK.$, h = BK.h, ic = BK.ic, s = BK.svg;
  var DATA = BK.data, chapters = BK.chapters, parts = BK.parts;

  function readList() { return (BK.state && BK.state.read) || []; }
  function savedList() { return (BK.state && BK.state.saved) || []; }
  function ring(pct) {
    var r = 22, c = 2 * Math.PI * r;
    var svg = s('svg', { class: 'ring', viewBox: '0 0 56 56', width: 56, height: 56, 'aria-hidden': 'true' });
    svg.appendChild(s('circle', { class: 'bg', cx: 28, cy: 28, r: r }));
    svg.appendChild(s('circle', { class: 'fg', cx: 28, cy: 28, r: r, 'stroke-dasharray': c.toFixed(1), 'stroke-dashoffset': (c * (1 - pct / 100)).toFixed(1), transform: 'rotate(-90 28 28)' }));
    svg.appendChild(s('text', { x: 28, y: 28.5 }, pct + '%'));
    return svg;
  }
  function chapterRow(c) {
    var done = readList().indexOf(c.id) >= 0;
    return h('li', null, [h('a', { href: '#' + c.id }, [
      h('span', { class: 'n', text: String(c.n) }), h('b', { text: c.title }),
      h('span', { class: 'm', text: (BK.LEVELS[c.level] || c.level) + (c.min ? ' · ' + c.min + ' min' : '') }),
      done ? ic('check', 'ok') : null
    ])]);
  }

  /* ---------------------------------------------------------------- home */
  BK.pages.home = {
    title: 'Home', icon: 'home',
    build: function (el) {
      var read = readList(), n = chapters.filter(function (c) { return read.indexOf(c.id) >= 0; }).length;
      var pct = chapters.length ? Math.round(n * 100 / chapters.length) : 0;
      var last = BK.byId[BK.store.get(BK.key('last'), '')];
      var next = last || chapters.filter(function (c) { return read.indexOf(c.id) < 0; })[0] || chapters[0];
      var me = (DATA.books || []).filter(function (b) { return b.id === DATA.id; })[0] || {};
      el.appendChild(h('div', { class: 'hero' }, [
        h('h1', { text: DATA.title }),
        h('p', { class: 'lead', text: me.tagline || DATA.tagline || '' })
      ]));
      if (next) {
        el.appendChild(h('div', { class: 'home-continue' }, [
          ring(pct),
          h('div', { class: 'txt' }, [
            h('small', { text: last ? 'Continue reading' : 'Start here' }),
            h('b', { text: next.title }),
            h('small', { text: n + ' of ' + chapters.length + ' chapters read' })
          ]),
          h('a', { class: 'btn solid', href: '#' + next.id }, [last ? 'Continue' : 'Start', ic('arrowR')])
        ]));
      }
      var thms = BK.theorems ? BK.theorems().length : 0;
      var facts = [chapters.length + ' chapters', parts.length + ' parts'];
      if (DATA.words) facts.push(Math.round(DATA.words / 1000) + 'k words');
      if (thms) facts.push(thms + ' theorems');
      el.appendChild(h('p', { class: 'ch-meta' }, facts.map(function (f) { return h('span', { class: 'badge', text: f }); })));
      el.appendChild(h('p', { text: 'Every chapter goes from easy to hard. Each one ends with patterns, practice and a short summary. Use the level buttons in the sidebar to see only Basic, Mid, Hard or Certified chapters.' }));
      parts.forEach(function (p) {
        var done = p.chapters.filter(function (c) { return read.indexOf(c.id) >= 0; }).length;
        el.appendChild(h('h2', { text: p.title }));
        var bar = h('div', { class: 'bar' }, [h('i')]);
        bar.firstChild.style.width = Math.round(done * 100 / p.chapters.length) + '%';
        el.appendChild(h('div', { class: 'part-meta' }, [
          h('span', { class: 'badge brand', text: BK.LEVELS[p.level] || p.level }),
          h('span', { text: done + ' / ' + p.chapters.length + ' read' }), bar
        ]));
        el.appendChild(h('ul', { class: 'part-list' }, p.chapters.map(chapterRow)));
      });
    }
  };

  /* ------------------------------------------------------------ book map */
  function chapterLinks() {
    var edges = [], seen = {};
    chapters.forEach(function (c) {
      BK.$$('a[href^="#"]', c.el).forEach(function (a) {
        var to = a.getAttribute('href').slice(1).split('--')[0].split('?')[0], d = BK.byId[to];
        if (!d && to.indexOf('thm-') === 0 && BK.thmById[to]) d = BK.thmById[to].chapter;
        if (!d || d === c) return;
        var k = c.id + '>' + d.id;
        if (seen[k]) return;
        seen[k] = 1; edges.push([c, d]);
      });
    });
    return edges;
  }
  function short(t, n) { return t.length > n ? t.slice(0, n - 1) + '…' : t; }
  BK.pages.map = {
    title: 'Book map', icon: 'map',
    build: function (el) {
      el.appendChild(h('h1', { text: 'Book map' }));
      el.appendChild(h('p', { class: 'lead', text: 'The whole book as a tree. Click a dot to open or close a branch. Click a name to go there.' }));
      var root = { label: DATA.title, kids: parts.map(function (p) {
        return { label: p.title, kids: p.chapters.map(function (c) {
          return { label: c.n + '. ' + c.title, href: '#' + c.id, kids: c.sections.map(function (sc) { return { label: sc.text, href: '#' + sc.id, kids: [] }; }) };
        }) };
      }) };
      var fig = h('figure');
      var box = h('div', { class: 'viz' });
      fig.appendChild(box);
      el.appendChild(fig);
      BK.makeTree(box, root, { open: 2, label: 'Map of the book' });
      var edges = chapterLinks();
      if (edges.length >= 3) {
        el.appendChild(h('h2', { text: 'How the chapters connect' }));
        el.appendChild(h('p', { text: 'An arrow means one chapter points to another. Big hubs are chapters that many others use. Click a node to see its links.' }));
        var nodes = [], byId = {}, g = { nodes: nodes, edges: [] };
        function node(c) {
          if (!byId[c.id]) { byId[c.id] = { i: nodes.length, name: c.n + '. ' + short(c.title, 26), deg: 0, ch: c }; nodes.push(byId[c.id]); }
          return byId[c.id];
        }
        edges.forEach(function (e) {
          var a = node(e[0]), b = node(e[1]);
          a.deg++; b.deg++;
          g.edges.push({ a: a, b: b, label: '', dir: 1 });
        });
        var gbox = h('div', { class: 'viz' });
        el.appendChild(h('figure', null, [gbox]));
        var bar = h('p', { class: 'ch-meta', text: 'Click a node to pick a chapter.' });
        el.appendChild(bar);
        BK.makeGraph(gbox, g, {
          label: 'Links between chapters',
          onPick: function (v) {
            bar.textContent = '';
            if (!v) { bar.textContent = 'Click a node to pick a chapter.'; return; }
            bar.appendChild(h('b', { text: v.ch.title }));
            bar.appendChild(h('a', { class: 'btn outline', href: '#' + v.ch.id }, ['Open', ic('arrowR')]));
          }
        });
      }
    }
  };

  /* --------------------------------------------------------- theorem map */
  function thmGroups() {
    var out = [];
    parts.forEach(function (p) {
      var kids = [];
      p.chapters.forEach(function (c) {
        var ts = BK.theorems().filter(function (t) { return t.chapter === c; });
        if (ts.length) kids.push({ label: c.n + '. ' + c.title, kids: ts.map(function (t) { return { label: t.name, href: '#theorems?focus=' + t.id, kids: [], tip: t.kind }; }) });
      });
      if (kids.length) out.push({ label: p.title, kids: kids });
    });
    return out;
  }
  function neighbourhood(t) {
    var keep = [t], dist = {};
    dist[t.id] = 0;
    function walk(list, key, depth, cap) {
      list.forEach(function (x) {
        if (keep.length >= cap || dist[x.id] !== undefined) return;
        dist[x.id] = depth; keep.push(x);
      });
      if (depth < 2) list.forEach(function (x) { walk(x[key], key, depth + 1, cap); });
    }
    walk(t.needs, 'needs', 1, 16);
    walk(t.usedBy, 'usedBy', 1, 30);
    var nodes = [], map = {}, names = {}, g = { nodes: nodes, edges: [] };
    keep.forEach(function (x) {
      var nm = short(x.name, 34);
      if (names[nm]) nm = short(x.name, 28) + ' (' + x.chapter.n + ')';
      names[nm] = 1;
      map[x.id] = { i: nodes.length, name: nm, deg: 0, t: x };
      nodes.push(map[x.id]);
    });
    keep.forEach(function (x) {
      x.needs.forEach(function (n) {
        if (!map[n.id]) return;
        map[n.id].deg++; map[x.id].deg++;
        g.edges.push({ a: map[n.id], b: map[x.id], label: '', dir: 1 });
      });
    });
    return { g: g, map: map };
  }
  BK.pages.theorems = {
    title: 'Theorem map', icon: 'network',
    when: function () { return BK.theorems && BK.theorems().length > 0; },
    count: function () { return BK.theorems().length; },
    build: function (el, q) {
      var all = BK.theorems();
      el.appendChild(h('h1', { text: 'Theorem map' }));
      el.appendChild(h('p', { class: 'lead', text: 'Every theorem, law and rule in this book, and how they build on each other. An arrow goes from an idea to the result that uses it.' }));
      var focusBox = h('div', { class: 'thm-focus' });
      el.appendChild(focusBox);
      el.appendChild(h('h2', { text: 'Browse by chapter' }));
      var treeBox = h('div', { class: 'viz' });
      el.appendChild(h('figure', null, [treeBox]));
      BK.makeTree(treeBox, { label: 'Theorems', kids: thmGroups() }, { open: 2, label: 'Theorems by chapter' });
      el.appendChild(h('h2', { text: 'Find a theorem' }));
      var input = h('input', { type: 'search', placeholder: 'Type a name, for example chain rule', 'aria-label': 'Filter theorems' });
      var info = h('span', { class: 'm' });
      el.appendChild(h('div', { class: 'thm-filter' }, [input, info]));
      var list = h('ul', { class: 'thm-rows' });
      el.appendChild(list);
      function paintList() {
        var qv = input.value.trim().toLowerCase(), shown = 0, last = null;
        list.textContent = '';
        all.forEach(function (t) {
          if (qv && (t.name + ' ' + t.kind).toLowerCase().indexOf(qv) < 0) return;
          if (t.chapter !== last) { last = t.chapter; list.appendChild(h('li', { class: 'grp', text: t.chapter.n + '. ' + t.chapter.title })); }
          shown++;
          list.appendChild(h('li', null, [h('a', { class: 'row', href: '#theorems?focus=' + t.id }, [
            h('b', { text: t.name }), h('small', { text: t.kind + (t.needs.length ? ' · needs ' + t.needs.length : '') + (t.usedBy.length ? ' · used by ' + t.usedBy.length : '') })
          ])]));
        });
        info.textContent = shown + ' of ' + all.length;
        if (!shown) list.appendChild(h('li', { class: 'empty', text: 'No theorem has that name. Try a shorter word.' }));
      }
      input.addEventListener('input', paintList);
      paintList();
      el._focus = focusBox;
      this.refresh(el, q);
    },
    refresh: function (el, q) {
      var all = BK.theorems(), m = /focus=([^&]+)/.exec(q || ''), t = m && BK.thmById[m[1]];
      if (!t) {
        t = all.slice().sort(function (a, b) { return (b.needs.length + b.usedBy.length) - (a.needs.length + a.usedBy.length); })[0];
      }
      var box = el._focus;
      box.textContent = '';
      if (!t) return;
      var nb = neighbourhood(t);
      var head = h('div', { class: 'thm-focus-bar' }, [
        h('span', { class: 'badge brand', text: t.kind }), h('b', { text: t.name }),
        h('a', { class: 'btn outline', href: '#' + t.id }, ['Read it', ic('arrowR')])
      ]);
      var viz = h('div', { class: 'viz' }, [head]);
      box.appendChild(viz);
      if (nb.g.edges.length) {
        var g = h('div');
        viz.appendChild(g);
        var api = BK.makeGraph(g, nb.g, {
          maxHeight: 340, label: 'Theorems linked to ' + t.name, hint: false,
          onPick: function (v) {
            if (!v || v.t === t) return;
            location.hash = 'theorems?focus=' + v.t.id;
          }
        });
        api.mark(nb.map[t.id].name);
      } else {
        viz.appendChild(h('p', { class: 'empty', text: 'This theorem has no links to other theorems yet.' }));
      }
      if (/focus=/.test(q || '')) window.scrollTo(0, 0);
    }
  };

  /* --------------------------------------------------------------- saved */
  BK.pages.saved = {
    title: 'Saved', icon: 'bookmark',
    build: function (el) {
      el.appendChild(h('h1', { text: 'Saved chapters' }));
      var saved = savedList().map(function (id) { return BK.byId[id]; }).filter(Boolean);
      if (!saved.length) {
        el.appendChild(h('p', { class: 'empty', text: 'Nothing saved yet. Press Save at the top of a chapter to keep it here.' }));
        return;
      }
      el.appendChild(h('p', { class: 'lead', text: 'Chapters you saved to read again.' }));
      el.appendChild(h('ul', { class: 'part-list' }, saved.map(chapterRow)));
    }
  };
})();

/* ---- 90-start.js ---- */
/* Start the reader once every part is loaded. Maths is drawn last. */
(function () {
  'use strict';
  var BK = window.BK;
  if (!BK) return;
  BK.enhancers.push(function (el) { BK.doMath(el); });
  try { BK.start(); } catch (e) {
    if (window.console) console.error(e);
    document.documentElement.classList.remove('js');
  }
})();
