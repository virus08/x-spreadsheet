//* global window */
import { h } from './element';
import Suggest from './suggest';
// import { mouseMoveUp } from '../event';

function editorInputEventHandler(evt) {
  const v = evt.target.value;
  this.inputText = v;
  const start = v.lastIndexOf('=');
  // console.log('start:', start, v.substring(start));
  if (start !== -1) {
    this.suggest.search(v.substring(start + 1));
  } else {
    this.suggest.hide();
  }
}

function editorSetTextareaRange(position) {
  const { textEl } = this;
  setTimeout(() => {
    textEl.el.setSelectionRange(position, position);
    textEl.el.focus();
  }, 0);
}

function editorReset() {
  const {
    offset, textEl, el, suggest,
  } = this;
  if (offset) {
    const {
      left, top, width, height,
    } = offset;
    el.offset({ left, top }).show();
    textEl.offset({ width: width - 9, height: height - 3 });
    suggest.setOffset({ left: 0, top: height });
    /*
    const oldWidth = textlineEl.offset().width + 16;
    if (cell) {
    }
    */
  }
}

function editorSetText(text) {
  const { textEl, textlineEl } = this;
  textEl.val(text);
  textlineEl.html(text);
}

function suggestItemClick(it) {
  const { inputText } = this;
  const start = inputText.lastIndexOf('=');
  const sit = inputText.substring(0, start + 1);
  let eit = inputText.substring(start + 1);
  if (eit.indexOf(')') !== -1) {
    eit = eit.substring(eit.indexOf(')'));
  } else {
    eit = '';
  }
  this.inputText = `${sit + it.key}(`;
  editorSetTextareaRange.call(this, this.inputText.length);
  this.inputText += `)${eit}`;
  editorSetText.call(this, this.inputText);
}

export default class Editor {
  constructor(formulas) {
    this.suggest = new Suggest(formulas, 180, (it) => {
      suggestItemClick.call(this, it);
    });
    this.el = h('div', 'xss-editor').children(
      this.textEl = h('textarea', '')
        .on('input', evt => editorInputEventHandler.call(this, evt)),
      this.textlineEl = h('div', 'textline'),
      this.suggest.el,
    );

    this.offset = null;
    this.cell = null;
    this.inputText = '';
  }

  clear(change) {
    if (!/^\s*$/.test(this.inputText)) {
      change(this.inputText);
    }
    this.cell = null;
    this.inputText = '';
    this.el.hide();
    this.textEl.val('');
    this.textlineEl.html('');
  }

  set(offset, cell) {
    this.offset = offset;
    this.cell = cell;
    const text = (cell && cell.text) || '';
    editorSetText.call(this, text);
    editorReset.call(this);
    editorSetTextareaRange.call(this, text.length);
  }
}