let prices = [];
let currentIndex = 3;
let chart;
let intervalId;

let buyPrice = null;
let sellPrice = null;
let profit = null;

fetch('sp500_monthly.csv')
  .then(response => response.text())
  .then(text => {
    prices = parseCSV(text);
    startPlayback();
  });

function parseCSV(text) {
  return text.trim().split('\n').slice(1).map(line => {
    const [date, close] = line.split(',');
    return { date, close: parseFloat(close) };
  });
}

function startPlayback() {
  const ctx = document.getElementById('chart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: prices.slice(0, 3).map(p => p.date),
      datasets: [{
        label: 'S&P500',
        data: prices.slice(0, 3).map(p => p.close),
        borderColor: 'blue',
        fill: false
      }]
    }
  });

  intervalId = setInterval(updateChart, 500);
}

function updateChart() {
  if (currentIndex >= prices.length) {
    clearInterval(intervalId);
    return;
  }

  const start = Math.max(0, currentIndex - 2);
  const end = currentIndex + 1;

  chart.data.labels = prices.slice(start, end).map(p => p.date);
  chart.data.datasets[0].data = prices.slice(start, end).map(p => p.close);
  chart.update();

  currentIndex++;
}

function buy() {
  buyPrice = prices[currentIndex - 1].close;
  document.getElementById('result').innerText = `買値: ${buyPrice.toFixed(2)}`;
}

function sell() {
  if (buyPrice === null) {
    alert('先に買ってください！');
    return;
  }
  sellPrice = prices[currentIndex - 1].close;
  profit = sellPrice - buyPrice;
  document.getElementById('result').innerText =
    `買値: ${buyPrice.toFixed(2)}、売値: ${sellPrice.toFixed(2)}、損益: ${profit.toFixed(2)}`;
}

function share() {
  if (profit === null) {
    alert('まず売買して結果を出してください！');
    return;
  }
  const text = encodeURIComponent(
    `S&P500 マーケットタイミング体験\\n` +
    `買値: ${buyPrice.toFixed(2)}\\n` +
    `売値: ${sellPrice.toFixed(2)}\\n` +
    `損益: ${profit.toFixed(2)}\\n` +
    `#マーケットタイミングチャレンジ`
  );
  const url = `https://twitter.com/intent/tweet?text=${text}`;
  window.open(url, '_blank');
}

function downloadChart() {
  const link = document.createElement('a');
  link.download = 'result.png';
  link.href = chart.toBase64Image();
  link.click();
}

function resetChart() {
  clearInterval(intervalId);
  currentIndex = 3;
  buyPrice = null;
  sellPrice = null;
  profit = null;
  document.getElementById('result').innerText = '';

  chart.data.labels = prices.slice(0, 3).map(p => p.date);
  chart.data.datasets[0].data = prices.slice(0, 3).map(p => p.close);
  chart.update();

  intervalId = setInterval(updateChart, 500);
}
