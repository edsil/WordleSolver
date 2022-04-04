"use strict";
let ls = [];
ls.length = 5;
let letters = [];
letters.length = 27;
let wordlist, allLetters, guesses;
let cs = [0, 0, 0, 0, 0];
let states = ["bl", "gr", "yl", "gn", "rd"];
let colors = [];
let words = [];
let tmpWords = [];
let listCursor = 0;
let tableText = "";
let filters = [];
let updatinglist = false;
loadFile("./wordle-combined-alphabetical.txt");

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
  guesses = document.getElementById("guesses");
}

function createLetters() {
  let row = 0;
  let col = 0;
  for (let lett = 0; lett < 26; lett++) {
    let letterBox = document.createElement("button");
    letterBox.classList.add("letterbox");
    letterBox.classList.add("allletters");
    letterBox.classList.add("bl");

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
  if (filters[letter - 1].includes(3)) return;
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
  if (filters[letter - 1].includes(3)) return;
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
  let letPos = eval(n[1]) - 1;
  let k = e.keyCode;
  switch (k) {
    case 8: // Backspace
    case 37: // Left Key
      let prev = letPos;
      if (prev < 1) prev = 1;
      if (k == 8) el.value = ""; //backspace
      document.getElementById("l" + String(prev)).focus();
      applyEnteredLetters();
      return;
    case 39: // Right Key
      let nxt = letPos + 2;
      if (nxt > 5) nxt = 5;
      document.getElementById("l" + String(nxt)).focus();
      return;
    case 32: // Space
      rotate(el);
      return;
    case 38: // Up Key
      document.getElementById("l1").focus();
      return;
    case 40: // Down Key
      document.getElementById("l5").focus();
      return;
  }

  //NOT a valid a-z; A-Z
  if (k < 65 || (k > 90 && k < 97) || k > 122) {
    //el.value = "";
    let ev = el.value.charCodeAt(0); //Current value at the box
    if (ev < 65 || (ev > 90 && ev < 97) || ev > 122) {
      el.value = "";
    }
    applyEnteredLetters();
    return;
  }

  el.value = String.fromCharCode(k).toUpperCase();
  k = el.value.toLowerCase().charCodeAt(0);
  let currColor = el.classList[1];
  if (filters[letPos][k - 97] == 3 && currColor != states[3]) {
    let focState = el.classList[2];
    el.classList.remove(currColor);
    el.classList.remove(focState);
    el.classList.add(states[3]);
    el.classList.add(focState);
  } else if (filters[letPos][k - 97] != 3 && currColor == states[3]) {
    let focState = el.classList[2];
    el.classList.remove(currColor);
    el.classList.remove(focState);
    el.classList.add(states[0]);
    el.classList.add(focState);
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

function goLetters() {
  for (let i = 0; i < 5; i++) {
    if (ls[i].value.length < 1) {
      alert("All boxes must be filled with a valid letter!");
      ls[i].focus();
      return;
    }
  }

  let row = document.createElement("tr");
  row.style.textAlign = "center";
  row.style.verticalAlign = "middle";
  row.style.height = "49px";
  for (let i = 0; i < 5; i++) {
    let letterCode = ls[i].value.toLowerCase().charCodeAt(0) - 97;
    let color = cs[i];
    let cell = document.createElement("td");
    cell.style.width = "49px";
    let currState = letters[letterCode].classList[2];
    if ((currState == "bl" || currState == "yl") && color > 0 && color < 4) {
      letters[letterCode].classList.remove(currState);
      letters[letterCode].classList.add(states[color]);
      cell.classList.add(states[color]);
      cell.innerHTML = ls[i].value.toUpperCase();
      updateFilter(color, i, letterCode);
      words = updateWords(words, color, i, letterCode);
    } else cell.classList.add("bl");

    row.appendChild(cell);
    ls[i].classList.remove(ls[i].classList[2]);
    ls[i].classList.remove(ls[i].classList[1]);
    ls[i].classList.add("bl");
    ls[i].classList.add("uf");
    ls[i].value = "";
    cs[i] = 0;
  }
  guesses.insertBefore(row, guesses.firstChild);
  updateList(words);
  ls[0].focus();
}

function updateFilter(cond, letPos, letCode) {
  if (cond == 0) return;
  if (cond == 1) {
    for (let i = 0; i < 5; i++) {
      if (filters[i][letCode] != 3) filters[i][letCode] = 1;
    }
    return;
  }
  if (cond == 2) {
    filters[letPos][letCode] = 1;
    return;
  }
  if (cond == 3) {
    for (let i = 0; i < 26; i++) {
      filters[letPos][i] = 1;
    }
    filters[letPos][letCode] = 3;
  }
}

function updateWords(wordsList, cond, letPos, letCode) {
  if (cond == 0) return wordsList;
  if (cond == 1) {
    function iFilter(value) {
      for (let i = 0; i < 5; i++) {
        if (value.charCodeAt(i) - 97 == letCode) {
          return false;
        }
      }
      return true;
    }
    return wordsList.filter(iFilter);
  }

  if (cond == 2) {
    function iFilter(value) {
      if (value.charCodeAt(letPos) - 97 == letCode) return false;
      if (value.includes(String.fromCharCode(letCode + 97))) return true;
      return false;
    }
    return wordsList.filter(iFilter);
  }

  if (cond == 3) {
    function iFilter(value) {
      if (value.charCodeAt(letPos) - 97 != letCode) {
        return false;
      } else {
        return true;
      }
    }
    return wordsList.filter(iFilter);
  }
}

/*

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

  */
