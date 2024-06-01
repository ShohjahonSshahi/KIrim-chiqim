let incomeChartInstance = null;
let expenseChartInstance = null;

function loadData() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    axios.get(`https://script.google.com/macros/s/AKfycbyQzDhliNsdSWlPxUlLcGepzBmF9LKlgQuPGGuVCs5glSqS_wj_oTNI9ARHOhhLfzgwkg/exec?start=${startDate}&end=${endDate}`)
        .then(function (response) {
            const data = response.data;

            const totalIncome = data.filter(row => row[1] === 'income').reduce((sum, row) => sum + parseFloat(row[3]), 0);
            const totalExpense = data.filter(row => row[1] === 'expense').reduce((sum, row) => sum + parseFloat(row[3]), 0);
            const profit = totalIncome - totalExpense;

            document.getElementById('totalIncome').textContent = 'Total Income: ' + formatCurrency(totalIncome);
            document.getElementById('totalExpense').textContent = 'Total Expense: ' + formatCurrency(totalExpense);
            document.getElementById('profit').textContent = 'Profit: ' + formatCurrency(profit);

            updateCharts(data);
        })
        .catch(function (error) {
            console.log(error);
            document.getElementById('totalIncome').textContent = 'Failed to load data';
            document.getElementById('totalExpense').textContent = 'Failed to load data';
            document.getElementById('profit').textContent = 'Failed to load data';
        });
}

function updateCharts(data) {
    const incomeData = data.filter(row => row[1] === 'income').reduce((acc, row) => {
        acc[row[2]] = (acc[row[2]] || 0) + parseFloat(row[3]);
        return acc;
    }, {});

    const expenseData = data.filter(row => row[1] === 'expense').reduce((acc, row) => {
        acc[row[2]] = (acc[row[2]] || 0) + parseFloat(row[3]);
        return acc;
    }, {});

    const incomeChartCtx = document.getElementById('incomeChart').getContext('2d');
    const expenseChartCtx = document.getElementById('expenseChart').getContext('2d');

    // Destroy existing chart instances if they exist
    if (incomeChartInstance) {
        incomeChartInstance.destroy();
    }
    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }

    incomeChartInstance = new Chart(incomeChartCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(incomeData),
            datasets: [{
                data: Object.values(incomeData),
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
            }],
        },
        options: { responsive: true }
    });

    expenseChartInstance = new Chart(expenseChartCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(expenseData),
            datasets: [{
                data: Object.values(expenseData),
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
            }],
        },
        options: { responsive: true }
    });

    document.getElementById('incomeSums').innerHTML = generateCategorySums(incomeData);
    document.getElementById('expenseSums').innerHTML = generateCategorySums(expenseData);
}

function generateCategorySums(data) {
    return Object.keys(data).map(category => `${category}: ${formatCurrency(data[category])}`).join('<br>');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(amount);
}
