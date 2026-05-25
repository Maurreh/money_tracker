let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function saveData() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function addEntry() {
  const date = document.getElementById('date').value;
  const desc = document.getElementById('description').value.trim();
  const type = document.getElementById('type').value;
  const amount = parseFloat(document.getElementById('amount').value);

  if (!date || !desc || isNaN(amount) || amount <= 0) {
    alert("Please fill all fields correctly");
    return;
  }

  transactions.push({
    date: date,
    description: desc,
    type: type,
    amount: type === 'income' ? amount : -amount
  });

  saveData();
  updateSummary();
  viewDateTransactions(); 
  clearInputs();
}

function clearInputs() {
  document.getElementById('description').value = '';
  document.getElementById('amount').value = '';
}

function deleteEntry(index) {
  if (confirm("Delete this entry?")) {
    transactions.splice(index, 1);
    saveData();
    updateSummary();
    viewDateTransactions();
  }
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function updateSummary() {
  const today = getToday();
  const now = new Date();
  
  // Calculate first day of this week (Sunday)
  const firstDayOfWeek = new Date(now);
  firstDayOfWeek.setDate(now.getDate() - now.getDay());
  const weekStart = firstDayOfWeek.toISOString().split('T')[0];

  // First day of month
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  let incomeToday = 0, incomeWeek = 0, incomeMonth = 0;
  let expenseToday = 0, expenseWeek = 0, expenseMonth = 0;
  let balance = 0;

  transactions.forEach(t => {
    balance += t.amount;

    if (t.type === 'income') {
      if (t.date === today) incomeToday += t.amount;
      if (t.date >= weekStart) incomeWeek += t.amount;
      if (t.date >= firstDayOfMonth) incomeMonth += t.amount;
    } else {
      if (t.date === today) expenseToday += Math.abs(t.amount);
      if (t.date >= weekStart) expenseWeek += Math.abs(t.amount);
      if (t.date >= firstDayOfMonth) expenseMonth += Math.abs(t.amount);
    }
  });

  // Update UI
  document.getElementById('balance').textContent = balance + " KSh";
  
  document.getElementById('incomeToday').textContent = incomeToday;
  document.getElementById('incomeWeek').textContent = incomeWeek;
  document.getElementById('incomeMonth').textContent = incomeMonth;

  document.getElementById('expenseToday').textContent = expenseToday;
  document.getElementById('expenseWeek').textContent = expenseWeek;
  document.getElementById('expenseMonth').textContent = expenseMonth;
}

// View transactions for a specific date
function viewDateTransactions() {
  const selectedDate = document.getElementById('viewDate').value;
  if (!selectedDate) return;

  const filtered = transactions.filter(t => t.date === selectedDate);
  const container = document.getElementById('dateDetails');

  let html = `<h3>Transactions on ${selectedDate}</h3>`;

  if (filtered.length === 0) {
    html += "<p>No transactions on this date.</p>";
  } else {
    let dayIncome = 0, dayExpense = 0;

    html += `<table><tr><th>Description</th><th>Type</th><th>Amount</th><th>Action</th></tr>`;

    filtered.forEach((t) => {
      const originalIndex = transactions.findIndex(trans => 
        trans.date === t.date && 
        trans.description === t.description && 
        trans.amount === t.amount
      );

      const typeLabel = t.type === 'income' ? 'Income' : 'Expense';
      const amountText = t.amount > 0 ? `+${t.amount}` : `${t.amount}`;

      html += `
        <tr>
          <td>${t.description}</td>
          <td>${typeLabel}</td>
          <td class="${t.amount > 0 ? 'income' : 'expense'}">${amountText} KSh</td>
          <td><button class="delete-btn" onclick="deleteEntry(${originalIndex})">Delete</button></td>
        </tr>
      `;

      if (t.amount > 0) dayIncome += t.amount;
      else dayExpense += Math.abs(t.amount);
    });

    html += `</table>`;
    html += `<p><strong>Day Income:</strong> ${dayIncome} KSh | <strong>Day Expense:</strong> ${dayExpense} KSh</p>`;
  }

  container.innerHTML = html;
}

// Initialize
const today = getToday();
document.getElementById('date').value = today;
document.getElementById('viewDate').value = today;

updateSummary();
viewDateTransactions();