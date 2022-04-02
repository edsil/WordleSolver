"use strict";
let ls = [];
ls.length = 5;
let letters = [];
letters.length = 27;
let wordlist, allLetters;
let cs = [0, 0, 0, 0, 0];
let states = ["bl", "gr", "yl", "gn"];
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
  createLetters();
  ls[0].focus();
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
  ls[0] = document.getElementById("l1");
  ls[1] = document.getElementById("l2");
  ls[2] = document.getElementById("l3");
  ls[3] = document.getElementById("l4");
  ls[4] = document.getElementById("l5");
  wordlist = document.getElementById("wordlist");
  allLetters = document.getElementById("allLetters");
}

function createLetters() {
  let row = 0;
  let col = 0;
  for (let lett = 0; lett < 26; lett++) {
    let letterBox = document.createElement("button");
    letterBox.classList.add("letterbox");
    letterBox.classList.add("allletters");
    let xlet = String.fromCharCode(lett + 97).toUpperCase();
    letterBox.innerHTML = xlet;
    letterBox.id = "letter" + xlet;
    letterBox.style.left = String(col * 27) + "px";
    letterBox.style.top = String(row * 27) + "px";
    allLetters.appendChild(letterBox);
    letters[lett] = letterBox;
    col += 1;
    if (col >= 9) {
      col = 0;
      row += 1;
    }
  }
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

function focused(e) {
  e.target.classList.remove(e.target.classList[2]);
  e.target.classList.add("fc");
}

function defocused(e) {
  e.target.classList.remove(e.target.classList[2]);
  e.target.classList.add("uf");
}

function clickHandler(e) {
  let letter = eval(e.id[1]);
  let color = eval(e.id[2]);
  cs[letter - 1] = color;
  let lastClass = ls[letter - 1].classList[2];
  ls[letter - 1].classList.remove(ls[letter - 1].classList[2]);
  ls[letter - 1].classList.remove(ls[letter - 1].classList[1]);
  let colClass = states[color];
  ls[letter - 1].classList.add(colClass);
  ls[letter - 1].classList.add(lastClass);
  ls[letter - 1].focus();
}

function rotate(e) {
  let letter = eval(e.id[1]);
  let currColor = e.classList[1];
  let focState = e.classList[2];
  e.classList.remove(currColor);
  e.classList.remove(focState);
  let newColor = (cs[letter - 1] + 1) % 4;
  cs[letter - 1] = newColor;
  e.classList.add(states[newColor]);
  e.classList.add(focState);
}

function addEvents() {
  window.addEventListener("keyup", readLetter);
  for (let i = 0; i < 5; i++) {
    ls[i].addEventListener("focus", focused);
    ls[i].addEventListener("blur", defocused);
  }
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
  for (let i = 0; i < 5; i++) {
    letters.push(ls[i].value.toLowerCase());
  }
  tmpWords = filterList(words, letters);
  if (updatinglist) {
    updatinglist = false;
    let d = new Date();
    let now = d.getTime();
    while (listCursor != 0) {
      d = new Date();
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
  if (k == 32) {
    rotate(el);
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
  //if (k >= 65 && k <= 90) {
  el.value = String.fromCharCode(k).toUpperCase();
  //}

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

function goLetters() {}
