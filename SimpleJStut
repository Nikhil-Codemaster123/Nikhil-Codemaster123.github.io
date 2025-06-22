// ===== BASIC VARIABLES =====
let name = "Alice";      // mutable
const age = 25;          // constant
var city = "Amsterdam";  // avoid 'var' in modern code (not block scoped)

// ===== DATA TYPES =====
let num = 42;                     // Number
let str = "Hello JS";             // String
let bool = true;                  // Boolean
let arr = [1, 2, 3];              // Array
let obj = { key: "value" };       // Object (like dict/map)

// ===== CONDITIONALS =====
if (num > 10) {
  console.log("Big");
} else if (num === 10) {
  console.log("Exactly 10");
} else {
  console.log("Small");
}

// ===== LOOPS =====
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

arr.forEach(item => {
  console.log("Item:", item);
});

for (let key in obj) {
  console.log(key, obj[key]);
}

// ===== FUNCTIONS =====
function greet(name) {
  return "Hello, " + name;
}

const add = (a, b) => a + b;

// ===== ARRAYS =====
arr.push(4);           // add
arr.pop();             // remove last
let first = arr[0];    // index access

// ===== OBJECTS =====
let user = {
  name: "John",
  age: 30
};

console.log(user.name);
user.age += 1;

// ===== JSON CONVERSION =====
let jsonStr = JSON.stringify(user);    // to string
let parsedUser = JSON.parse(jsonStr);  // back to object

// ===== LOCAL STORAGE (browser memory) =====
localStorage.setItem("key", "value");
let value = localStorage.getItem("key");
localStorage.removeItem("key");

// ===== DOM BASICS =====
document.getElementById("myBtn").addEventListener("click", () => {
  alert("Clicked!");
});

document.querySelector("#title").innerText = "Welcome!";

// ===== DEBUGGING =====
console.log("Check value:", value);
console.error("Oops, something went wrong");

// ===== JS vs PYTHON vs JAVA QUICK REMINDER =====
// Python: x = [1, 2, 3]
// Java:   int[] x = {1, 2, 3};
// JS:     let x = [1, 2, 3];

// Python: def square(x): return x * x
// Java:   int square(int x) { return x*x; }
// JS:     const square = x => x * x;

