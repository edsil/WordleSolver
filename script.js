"use strict";
let l1, l2, l3, l4, l5;
let words = [];
loadFile("wordle-allowed-guesses.txt");
window.onload = function () {
  getElements();
  addEvents();
};

function getElements() {
  l1 = document.getElementById("l1");
  l2 = document.getElementById("l2");
  l3 = document.getElementById("l3");
  l4 = document.getElementById("l4");
  l5 = document.getElementById("l5");
}

function loadFile(file) {
  const fs = require("fs");

  fs.readFile(file, (err, data) => {
    if (err) throw err;
    let text = data.toString();
    text.split(/\r\n|\n/).forEach(function (line) {
      words.push(line.trim());
    });
    console.log(words);
  });
}

function addEvents() {
  window.addEventListener("keyup", readLetter);
}

function readLetter(e) {
  let el = document.activeElement;
  let n = el.id;
  if (n[0] != "l") return;
  let k = e.keyCode;
  console.log(k);
  if (k == 8 || k == 37) {
    //left key or backspace
    let prev = eval(n[1]) - 1;
    if (prev < 1) prev = 1;
    if (k == 8) el.value = ""; //backspace
    document.getElementById("l" + String(prev)).focus();
    return;
  }
  if (k == 38) {
    //up key
    document.getElementById("l1").focus();
    return;
  }
  if (k == 40) {
    //down key
    document.getElementById("l5").focus();
    return;
  }

  //NOT the righ-arrow-key nor a valid a-z; A-Z
  if (k != 39 && (k < 65 || (k > 90 && k < 61) || k > 122)) {
    el.value = "";
    return;
  }

  // if a upper-case letter, changes to lower case
  if (k >= 65 && k <= 90) {
    el.value = String.fromCharCode(k + 32);
  }

  // move focus to the next box - if it is in box 5, goes back to 1
  let nxt = eval(n[1]) + 1;
  if (nxt > 5) {
    if (k == 39) {
      nxt = 5;
    } else nxt = 1;
  }
  document.getElementById("l" + String(nxt)).focus();
  console.log(document.activeElement);
}
