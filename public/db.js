let db;

//Opens database
const request = window.indexedDB.open("budget", 1);

// Creates or updates the version of the database
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  const store = db.createObjectStore("BudgetStore", { autoIncrement: true });
};

// Handles error
request.onerror = function (event) {
  console.log("Database Error:" + event.target.errorCode);
};

// Want a function that checks database if online
function checkDatabase() {
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const store = transaction.objectStore("BudgetStore");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          const transaction = db.transaction(["BudgetStore"], "readwrite");
          const store = transaction.objectStore("BudgetStore");
          store.clear();
        });
    }
  };
}
// Handles success
request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  } else {
    console.log("offline");
  }
};

// Want a function that saves records
function saveRecord(record) {
  //Adding data to database
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const store = transaction.objectStore("BudgetStore");
  // Put this updated object back into the database.
  store.add(record);
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
