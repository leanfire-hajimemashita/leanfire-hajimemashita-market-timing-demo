let prices = [];
let currentIndex = 0;
let chart;
let intervalId;

// 売買用
let buyPrice = null;
let sellPrice = null;
let profit = null;

// CSV読み込み & 再生開始
fetch('sp500_sample.csv')
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
      labels: [],
      datasets: [{
        label: 'S&P500',
        data: [],
        borderColor: 'blue',
        fill: false
      }]
    }
  });

  intervalId = setInterval(updateChart, 200);
}

function updateChart() {
  if (currentIndex >= prices.length) {
    clearInterval(intervalId);
    return;
  }

  chart.data.labels.push(prices[currentIndex].date);
  chart.data.datasets[0].data.push(prices[currentIndex].close);
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
    `S&P500 マーケットタイミング体験\n` +
    `買値: ${buyPrice.toFixed(2)}\n` +
    `売値: ${sellPrice.toFixed(2)}\n` +
    `損益: ${profit.toFixed(2)}\n` +
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
