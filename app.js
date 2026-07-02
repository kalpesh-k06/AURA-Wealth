/**
 * Aura Wealth Dashboard Core Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State variables
  let state = {
    netWorth: 124548.00,
    liquidCapital: 15482.20,
    dailyPnl: 2241.50,
    assetWeights: {
      crypto: 47328.24,     // 38%
      stocks: 42346.32,     // 34%
      realestate: 19927.68, // 16%
      cash: 14945.76        // 12%
    },
    spendingLimit: 4500.00,
    currentSpent: 2410.00,
    selectedTimeframe: '1M',
    marketPrices: {
      BTC: { price: 64250.80, change: 1.84 },
      ETH: { price: 3422.50, change: 2.15 },
      AAPL: { price: 189.24, change: -0.45 },
      MSFT: { price: 415.60, change: 0.92 },
      TSLA: { price: 177.46, change: 3.75 },
      GLD: { price: 218.88, change: -0.12 }
    },
    transactions: [
      { id: 1, type: 'buy', category: 'crypto', title: 'Bought 0.05 BTC', amount: 3212.50, date: 'Today, 11:24 AM' },
      { id: 2, type: 'sell', category: 'stocks', title: 'Sold 10 shares TSLA', amount: 1774.60, date: 'Yesterday, 3:45 PM' },
      { id: 3, type: 'buy', category: 'cash', title: 'Bank Deposit', amount: 5000.00, date: 'June 29, 2026' },
      { id: 4, type: 'buy', category: 'realestate', title: 'REIT Dividends Reinvestment', amount: 350.00, date: 'June 25, 2026' },
      { id: 5, type: 'sell', category: 'crypto', title: 'Sold 0.5 ETH', amount: 1711.25, date: 'June 22, 2026' }
    ]
  };

  // Mock performance data sets for the dynamic SVG chart
  const performanceMockData = {
    '1D': [
      { label: '09:00', value: 122306.00 },
      { label: '11:00', value: 123110.00 },
      { label: '13:00', value: 122850.00 },
      { label: '15:00', value: 124100.00 },
      { label: '17:00', value: 124548.00 }
    ],
    '1W': [
      { label: 'Mon', value: 121100.00 },
      { label: 'Tue', value: 122450.00 },
      { label: 'Wed', value: 123800.00 },
      { label: 'Thu', value: 123200.00 },
      { label: 'Fri', value: 124548.00 }
    ],
    '1M': [
      { label: 'Wk 1', value: 116200.00 },
      { label: 'Wk 2', value: 119500.00 },
      { label: 'Wk 3', value: 118100.00 },
      { label: 'Wk 4', value: 124548.00 }
    ],
    '1Y': [
      { label: 'Q1', value: 92000.00 },
      { label: 'Q2', value: 104500.00 },
      { label: 'Q3', value: 112000.00 },
      { label: 'Q4', value: 124548.00 }
    ],
    'ALL': [
      { label: '2023', value: 45000.00 },
      { label: '2024', value: 78000.00 },
      { label: '2025', value: 102000.00 },
      { label: '2026', value: 124548.00 }
    ]
  };

  // Dom Elements selection
  const dom = {
    netWorth: document.getElementById('netWorthValue'),
    liquidCapital: document.getElementById('liquidCapitalValue'),
    dailyPnl: document.getElementById('dailyPnlValue'),
    lastUpdateTime: document.getElementById('lastUpdateTime'),
    
    // Allocations text
    valCrypto: document.getElementById('valCrypto'),
    valStocks: document.getElementById('valStocks'),
    valRE: document.getElementById('valRE'),
    valCash: document.getElementById('valCash'),
    weightCrypto: document.getElementById('weightCrypto'),
    weightStocks: document.getElementById('weightStocks'),
    weightRE: document.getElementById('weightRE'),
    weightCash: document.getElementById('weightCash'),
    
    // Allocation concentric SVG tracks
    circleCrypto: document.getElementById('allocCryptoCircle'),
    circleStocks: document.getElementById('allocStocksCircle'),
    circleRE: document.getElementById('allocRECircle'),
    circleCash: document.getElementById('allocCashCircle'),

    // Budget Panel elements
    slider: document.getElementById('budgetSlider'),
    limitVal: document.getElementById('budgetLimitVal'),
    progressPercent: document.getElementById('budgetPercentVal'),
    progressBar: document.getElementById('budgetProgressBar'),
    budgetTip: document.getElementById('budgetTip'),
    currentSpend: document.getElementById('currentSpendAmount'),

    // Form inputs
    txAsset: document.getElementById('txAsset'),
    txType: document.getElementById('txType'),
    txAmount: document.getElementById('txAmount'),
    btnSubmitTx: document.getElementById('btnSubmitTx'),
    quickTxForm: document.getElementById('quickTxForm'),
    txListContainer: document.getElementById('txListContainer'),

    // Timeframe selector
    timeframeSelector: document.getElementById('timeframeSelector'),
    chartSvg: document.getElementById('portfolioChart'),
    chartTooltip: document.getElementById('chartTooltip')
  };

  // -------------------------------------------------------------
  // Initializer Functions
  // -------------------------------------------------------------
  function init() {
    updateOverallStats();
    updateAllocationDetails();
    renderTransactions();
    initBudgetPlanner();
    renderPerformanceChart(state.selectedTimeframe);
    startMarketTickerSimulation();
    setupEventListeners();
  }

  // -------------------------------------------------------------
  // Helper Formatting Functions
  // -------------------------------------------------------------
  function formatUSD(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  }

  function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  }

  // -------------------------------------------------------------
  // 1. Stats updates
  // -------------------------------------------------------------
  function updateOverallStats() {
    // Total net worth is sum of assets
    state.netWorth = Object.values(state.assetWeights).reduce((a, b) => a + b, 0);
    dom.netWorth.textContent = formatUSD(state.netWorth);
    dom.liquidCapital.textContent = formatUSD(state.assetWeights.cash);
    
    // Record current updated time
    const now = new Date();
    dom.lastUpdateTime.textContent = formatTime(now);
  }

  // -------------------------------------------------------------
  // 2. Allocation Concentric SVGs and Weights calculations
  // -------------------------------------------------------------
  function updateAllocationDetails() {
    const total = state.netWorth;
    const wCrypto = (state.assetWeights.crypto / total) * 100;
    const wStocks = (state.assetWeights.stocks / total) * 100;
    const wRE = (state.assetWeights.realestate / total) * 100;
    const wCash = (state.assetWeights.cash / total) * 100;

    // Set Text labels
    dom.weightCrypto.textContent = `${wCrypto.toFixed(0)}%`;
    dom.weightStocks.textContent = `${wStocks.toFixed(0)}%`;
    dom.weightRE.textContent = `${wRE.toFixed(0)}%`;
    dom.weightCash.textContent = `${wCash.toFixed(0)}%`;

    dom.valCrypto.textContent = formatUSD(state.assetWeights.crypto);
    dom.valStocks.textContent = formatUSD(state.assetWeights.stocks);
    dom.valRE.textContent = formatUSD(state.assetWeights.realestate);
    dom.valCash.textContent = formatUSD(state.assetWeights.cash);

    // Animate Segmented circles based on perimeter calculation (2 * PI * r)
    // Crypto r=60 (perimeter ~377)
    // Stocks r=48 (perimeter ~302)
    // Real Estate r=36 (perimeter ~226)
    // Cash r=24 (perimeter ~151)
    animateStrokeDash(dom.circleCrypto, 377, wCrypto);
    animateStrokeDash(dom.circleStocks, 302, wStocks);
    animateStrokeDash(dom.circleRE, 226, wRE);
    animateStrokeDash(dom.circleCash, 151, wCash);
  }

  function animateStrokeDash(circleElement, perimeter, percentage) {
    if (!circleElement) return;
    const dashOffset = perimeter - (perimeter * percentage / 100);
    circleElement.style.strokeDashoffset = dashOffset;
  }

  // -------------------------------------------------------------
  // 3. Performance Chart Rendering (Custom Inline SVG Generator)
  // -------------------------------------------------------------
  function renderPerformanceChart(timeframe) {
    // Clear dynamic children but keep defs
    const staticDefs = dom.chartSvg.querySelector('defs');
    dom.chartSvg.innerHTML = '';
    dom.chartSvg.appendChild(staticDefs);

    // Deep copy data points to avoid mutating performanceMockData shared config object
    const dataPoints = performanceMockData[timeframe].map(d => ({ ...d }));
    
    // If the last value doesn't equal our state netWorth (e.g. user just performed a transaction),
    // update the final point to dynamically represent current state!
    if (dataPoints.length > 0) {
      dataPoints[dataPoints.length - 1].value = state.netWorth;
    }

    const width = 700;
    const height = 280;
    const padding = { top: 40, right: 30, bottom: 40, left: 60 };

    const minVal = Math.min(...dataPoints.map(d => d.value)) * 0.95;
    const maxVal = Math.max(...dataPoints.map(d => d.value)) * 1.05;
    const valRange = maxVal - minVal;

    // Helper conversion mappings
    const getX = (index) => padding.left + (index / (dataPoints.length - 1)) * (width - padding.left - padding.right);
    const getY = (val) => height - padding.bottom - ((val - minVal) / valRange) * (height - padding.top - padding.bottom);

    // 1. Draw Grid lines and bottom text labels
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const yVal = minVal + (valRange * (i / gridCount));
      const yCoords = getY(yVal);

      // Grid line
      const gLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gLine.setAttribute('class', 'grid-line');
      gLine.setAttribute('x1', padding.left);
      gLine.setAttribute('y1', yCoords);
      gLine.setAttribute('x2', width - padding.right);
      gLine.setAttribute('y2', yCoords);
      dom.chartSvg.appendChild(gLine);

      // Text label left
      const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textLabel.setAttribute('class', 'chart-label');
      textLabel.setAttribute('x', padding.left - 10);
      textLabel.setAttribute('y', yCoords + 4);
      textLabel.setAttribute('text-anchor', 'end');
      textLabel.textContent = formatUSD(yVal).split('.')[0]; // remove decimal cents for clean look
      dom.chartSvg.appendChild(textLabel);
    }

    // 2. Generate path points for area & stroke
    let pathString = `M ${getX(0)} ${getY(dataPoints[0].value)}`;
    let areaString = `M ${getX(0)} ${height - padding.bottom} L ${getX(0)} ${getY(dataPoints[0].value)}`;

    // Draw grid columns and bottom indicators
    dataPoints.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.value);

      if (i > 0) {
        // Curve construction using cubic bezier
        const prevX = getX(i - 1);
        const prevY = getY(dataPoints[i - 1].value);
        const cpX1 = prevX + (x - prevX) / 2;
        const cpY1 = prevY;
        const cpX2 = prevX + (x - prevX) / 2;
        const cpY2 = y;
        
        pathString += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
        areaString += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
      }

      // X Label at bottom
      const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xLabel.setAttribute('class', 'chart-label');
      xLabel.setAttribute('x', x);
      xLabel.setAttribute('y', height - 12);
      xLabel.setAttribute('text-anchor', 'middle');
      xLabel.textContent = pt.label;
      dom.chartSvg.appendChild(xLabel);
    });

    areaString += ` L ${getX(dataPoints.length - 1)} ${height - padding.bottom} Z`;

    // 3. Render Area Path
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    areaPath.setAttribute('class', 'chart-area');
    areaPath.setAttribute('d', areaString);
    dom.chartSvg.appendChild(areaPath);

    // 4. Render Main line Path
    const strokePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    strokePath.setAttribute('class', 'chart-line');
    strokePath.setAttribute('d', pathString);
    dom.chartSvg.appendChild(strokePath);

    // 5. Draw Interactive Nodes
    dataPoints.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.value);

      const nodeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      nodeCircle.setAttribute('class', 'chart-point');
      nodeCircle.setAttribute('cx', x);
      nodeCircle.setAttribute('cy', y);
      nodeCircle.setAttribute('r', 5);
      nodeCircle.setAttribute('filter', 'url(#glowFilter)');

      // Event listener for tooltip
      nodeCircle.addEventListener('mouseover', (e) => {
        // Calculate position relative to container
        const wrapperRect = dom.chartSvg.getBoundingClientRect();
        
        // Show tooltip
        dom.chartTooltip.style.opacity = '1';
        dom.chartTooltip.style.left = `${(x / width) * 100}%`;
        dom.chartTooltip.style.top = `${(y / height) * 100}%`;
        dom.chartTooltip.querySelector('.tooltip-date').textContent = `${timeframe === '1D' ? 'At time: ' : ''}${pt.label}`;
        dom.chartTooltip.querySelector('.tooltip-value').textContent = formatUSD(pt.value);

        // Highlight value card temporarily
        dom.netWorth.textContent = formatUSD(pt.value);
        dom.netWorth.classList.add('text-glow-cyan');
      });

      nodeCircle.addEventListener('mouseleave', () => {
        dom.chartTooltip.style.opacity = '0';
        // Restore net worth display
        dom.netWorth.textContent = formatUSD(state.netWorth);
        dom.netWorth.classList.remove('text-glow-cyan');
      });

      dom.chartSvg.appendChild(nodeCircle);
    });
  }

  // -------------------------------------------------------------
  // 4. Budget Slider Control
  // -------------------------------------------------------------
  function initBudgetPlanner() {
    updateBudgetDisplay();

    dom.slider.addEventListener('input', (e) => {
      state.spendingLimit = parseFloat(e.target.value);
      updateBudgetDisplay();
    });
  }

  function updateBudgetDisplay() {
    dom.limitVal.textContent = formatUSD(state.spendingLimit);
    
    // Percentage spent
    const percent = (state.currentSpent / state.spendingLimit) * 100;
    dom.progressPercent.textContent = `${percent.toFixed(1)}%`;
    dom.progressBar.style.width = `${Math.min(percent, 100)}%`;

    // Visual changes based on limit warning thresholds
    dom.progressBar.classList.remove('caution', 'warning-limit');
    if (percent >= 90) {
      dom.progressBar.classList.add('warning-limit');
      dom.currentSpend.style.color = 'var(--danger)';
      dom.budgetTip.innerHTML = `<span style="color:var(--danger); font-weight:600;">Warning:</span> limit critical. You only have ${formatUSD(state.spendingLimit - state.currentSpent)} left.`;
    } else if (percent >= 70) {
      dom.progressBar.classList.add('caution');
      dom.currentSpend.style.color = 'var(--warning)';
      dom.budgetTip.innerHTML = `<span style="color:var(--warning); font-weight:600;">Caution:</span> Budget nearing boundary. Remaining: ${formatUSD(state.spendingLimit - state.currentSpent)}`;
    } else {
      dom.currentSpend.style.color = 'var(--accent-cyan)';
      dom.budgetTip.innerHTML = `Safe zone: You've got ${formatUSD(state.spendingLimit - state.currentSpent)} left this month.`;
    }
  }

  // -------------------------------------------------------------
  // 5. Transaction log updates and submission handling
  // -------------------------------------------------------------
  function renderTransactions() {
    dom.txListContainer.innerHTML = '';
    state.transactions.forEach(tx => {
      const isBuy = tx.type === 'buy';
      const typeBadge = isBuy ? '+' : '-';
      const classType = isBuy ? 'buy' : 'sell';

      const itemHtml = `
        <div class="tx-item" data-id="${tx.id}">
          <div class="tx-item-left">
            <div class="tx-icon-wrap ${classType}">
              ${isBuy ? 
                `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 12.5V3.5M8 3.5L4.5 7M8 3.5L11.5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` : 
                `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3.5V12.5M8 12.5L4.5 9M8 12.5L11.5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
              }
            </div>
            <div class="tx-details">
              <span class="tx-title">${tx.title}</span>
              <span class="tx-date">${tx.date}</span>
            </div>
          </div>
          <div class="tx-item-right">
            <span class="tx-value ${classType}">${typeBadge}${formatUSD(tx.amount)}</span>
            <span class="tx-asset-badge">${tx.category}</span>
          </div>
        </div>
      `;
      dom.txListContainer.insertAdjacentHTML('beforeend', itemHtml);
    });
  }

  function handleTransactionSubmit(e) {
    e.preventDefault();

    const category = dom.txAsset.value;
    const type = dom.txType.value;
    const amount = parseFloat(dom.txAmount.value);

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than zero.');
      return;
    }

    const titleAction = type === 'buy' ? 'Deposited' : 'Withdrew';
    const textCategoryMap = {
      crypto: 'Crypto Asset Allocation',
      stocks: 'Stock Equity Brokerage',
      cash: 'Liquid Reserves Savings',
      realestate: 'Real Estate Holdings'
    };

    // Update state asset weights
    if (type === 'buy') {
      state.assetWeights[category] += amount;
      // If it's a non-cash asset purchase, assume it used cash (so liquid cash goes down, portfolio asset goes up - net worth stable? No, to simulate simple deposit growth, we just let net worth grow).
      // Let's model it as a direct injection / external deposit to grow total wealth balance
    } else {
      if (state.assetWeights[category] < amount) {
        alert(`Insufficient reserves in ${category} to perform this sell order.`);
        return;
      }
      state.assetWeights[category] -= amount;
    }

    // Register transaction log
    const now = new Date();
    const newTx = {
      id: Date.now(),
      type: type,
      category: category,
      title: `${titleAction} to ${textCategoryMap[category]}`,
      amount: amount,
      date: `Today, ${formatTime(now)}`
    };

    // Add to state and render
    state.transactions.unshift(newTx);
    
    // Recalculate and re-draw everything
    updateOverallStats();
    updateAllocationDetails();
    renderTransactions();
    
    // Flash visual indication
    const statCard = document.getElementById('cardNetWorth');
    statCard.style.boxShadow = '0 0 35px rgba(0, 242, 254, 0.4)';
    setTimeout(() => {
      statCard.style.boxShadow = '';
    }, 1000);

    // Re-render chart showing the updated net worth
    renderPerformanceChart(state.selectedTimeframe);

    // Clear form inputs
    dom.txAmount.value = '';
  }

  // -------------------------------------------------------------
  // 6. Market Ticker Price simulation (updates every 3 seconds)
  // -------------------------------------------------------------
  function startMarketTickerSimulation() {
    setInterval(() => {
      // Pick random symbol from state prices
      const symbols = Object.keys(state.marketPrices);
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const asset = state.marketPrices[randomSymbol];

      // Simulate percentage shift (-1.5% to +1.5%)
      const shiftPercent = (Math.random() * 3 - 1.5);
      const oldPrice = asset.price;
      asset.price = oldPrice * (1 + (shiftPercent / 100));
      asset.change = asset.change + (shiftPercent / 5);

      // Update DOM
      const priceElem = document.getElementById(`price-${randomSymbol}`);
      const changeElem = document.getElementById(`change-${randomSymbol}`);

      if (priceElem && changeElem) {
        priceElem.textContent = formatUSD(asset.price);
        changeElem.textContent = `${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}%`;

        // Update classes
        if (asset.change >= 0) {
          changeElem.className = 'ticker__change positive';
        } else {
          changeElem.className = 'ticker__change negative';
        }

        // Pulse the price element briefly
        priceElem.style.color = shiftPercent >= 0 ? 'var(--success)' : 'var(--danger)';
        priceElem.style.transition = 'color 0.15s ease';
        setTimeout(() => {
          priceElem.style.color = '';
        }, 800);
      }

    }, 3000);
  }

  // -------------------------------------------------------------
  // 7. Click events and navigation
  // -------------------------------------------------------------
  function setupEventListeners() {
    // Timeframe button selectors
    dom.timeframeSelector.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-timeframe')) {
        // Toggle active status
        dom.timeframeSelector.querySelectorAll('.btn-timeframe').forEach(btn => {
          btn.classList.remove('active');
        });
        e.target.classList.add('active');

        // Set timeframe and re-render
        state.selectedTimeframe = e.target.dataset.timeframe;
        renderPerformanceChart(state.selectedTimeframe);
      }
    });

    // Transaction submit listener (works for both button click and Enter key press)
    dom.quickTxForm.addEventListener('submit', handleTransactionSubmit);

    // Nav Bar Link highlighting
    const navBar = document.getElementById('mainNav');
    navBar.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-link')) {
        navBar.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
        });
        e.target.classList.add('active');
        e.preventDefault();
      }
    });
  }

  // Kickstart dashboard
  init();
});
