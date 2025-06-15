let prices = [];
let currentIndex = 0;
let chart;
let intervalId;
let startIndex = 0;

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
  // ランダムな開始位置を設定
  startIndex = Math.floor(Math.random() * (prices.length - 13));
  currentIndex = startIndex;

  const ctx = document.getElementById('chart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [prices[currentIndex].date],
      datasets: [{
        label: 'S&P500',
        data: [prices[currentIndex].close],
        borderColor: 'blue',
        fill: false
      }]
    }
  });

  intervalId = setInterval(updateChart, 500);
}

function updateChart() {
  currentIndex++;
  if (currentIndex >= prices.length) {
    clearInterval(intervalId);
    return;
  }

  chart.data.labels.push(prices[currentIndex].date);
  chart.data.datasets[0].data.push(prices[currentIndex].close);

  // 表示範囲が1年以上（12ヶ月）なら古いデータを削除
  if (chart.data.labels.length > 12) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();
}

function buy() {
  buyPrice = prices[currentIndex].close;
  document.getElementById('result').innerText = `買値: ${buyPrice.toFixed(2)}`;
}

function sell() {
  if (buyPrice === null) {
    alert('先に買ってください！');
    return;
  }
  sellPrice = prices[currentIndex].close;
  profit = sellPrice - buyPrice;
  document.getElementById('result').innerText =
    `買値: ${buyPrice.toFixed(2)}、売値: ${sellPrice.toFixed(2)}、損益: ${profit.toFixed(2)}`;
  clearInterval(intervalId); // チャート更新を止める
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

function resetChart() {
  clearInterval(intervalId);
  buyPrice = null;
  sellPrice = null;
  profit = null;
  document.getElementById('result').innerText = '';

  // 新しいランダム開始位置
  startIndex = Math.floor(Math.random() * (prices.length - 13));
  currentIndex = startIndex;

  chart.data.labels = [prices[currentIndex].date];
  chart.data.datasets[0].data = [prices[currentIndex].close];
  chart.update();

  intervalId = setInterval(updateChart, 500);
}
