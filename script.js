"use strict";
let l1, l2, l3, l4, l5, wordlist;
let words = [];
let tmpWords = [];
let listCursor = 0;
let tableText = "";
let filters = [];
let updatinglist = false;
loadFile("./wordle-allowed-guesses.txt");

window.onload = function () {
  getElements();
  addEvents();
  filters = initArray(5, 26, 0);
};

function initArray(x, y, f) {
  let l2 = [];
  l2.length = y;
  l2.fill(f);
  let l1 = [];
  l1.length = x;
  l1.fill(f);
  var newArray = l1.map(function (_a) {
    return l2.slice();
  });
  return newArray;
}

function getElements() {
  l1 = document.getElementById("l1");
  l2 = document.getElementById("l2");
  l3 = document.getElementById("l3");
  l4 = document.getElementById("l4");
  l5 = document.getElementById("l5");
  wordlist = document.getElementById("wordlist");
}

async function loadFile(file) {
  let text;
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      text = data;
      text.split(/\r\n|\n/).forEach(function (line) {
        words.push(line.trim());
        tmpWords.push(line.trim());
      });
      updateList(words);
    });
}

function wordLine(word) {
  return `
    <tr>
        <td>${word}</td>
    </tr>
    `;
}

function updateList(fwords) {
  if (listCursor == 0) {
    wordlist.innerHTML = "";
    tableText = "";
    updatinglist = true;
  }
  var to_add = 300;
  while (listCursor < fwords.length && to_add > 0) {
    tableText = tableText + `${wordLine(fwords[listCursor])}`;
    listCursor += 1;
    to_add -= 1;
  }
  if (listCursor >= fwords.length) {
    wordlist.innerHTML = tableText;
    updatinglist = false;
    listCursor = 0;
  } else if (updatinglist) {
    setTimeout(
      function () {
        updateList(this);
      }.bind(fwords),
      5
    );
  } else {
    listCursor = 0;
  }
}

function addEvents() {
  window.addEventListener("keyup", readLetter);
}

function filterList(listArray, letters) {
  let pos = 0;
  function iFilter(value) {
    return letters[pos] == "" || value[pos] == letters[pos];
  }

  let newList = listArray.filter(iFilter);
  pos = 1;
  while (pos < 5) {
    newList = newList.filter(iFilter);
    pos += 1;
  }
  return newList;
}

function applyEnteredLetters() {
  let letters = [];
  letters.push(l1.value);
  letters.push(l2.value);
  letters.push(l3.value);
  letters.push(l4.value);
  letters.push(l5.value);
  tmpWords = filterList(words, letters);
  if (updatinglist) {
    updatinglist = false;
    let d = new Date();
    let now = d.getTime();
    while (listCursor != 0) {
      if (d.getTime() - now >= 50) listCursor = 0;
    }
  }
  updateList(tmpWords);
}

function readLetter(e) {
  let el = document.activeElement;
  let n = el.id;
  if (n[0] != "l") return;
  let k = e.keyCode;
  if (k == 8 || k == 37) {
    //left key or backspace
    let prev = eval(n[1]) - 1;
    if (prev < 1) prev = 1;
    if (k == 8) el.value = ""; //backspace
    document.getElementById("l" + String(prev)).focus();
    applyEnteredLetters();
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
  if (k != 39 && (k < 65 || (k > 90 && k < 97) || k > 122)) {
    el.value = "";
    applyEnteredLetters();
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
  applyEnteredLetters();
}
