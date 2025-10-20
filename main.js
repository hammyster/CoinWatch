const apiKey = ""; // API FIXER.IO
const proxyUrl = ''; // CASO USE PROXY
const apiUrl = 'https://data.fixer.io/api/latest';
const refreshInterval = 10000;

const importantCurrencies = [
    'USD', 'TRY', 'ZAR', 'BRL', 'MXN',
    'RUB', 'INR', 'KRW', 'AUD', 'SGD'
];

const currencyNames = {
    USD: 'Dólar Americano',
    TRY: 'Lira Turca',
    ZAR: 'Rand Sul-Africano',
    BRL: 'Real Brasileiro',
    MXN: 'Peso Mexicano',
    RUB: 'Rublo Russo',
    INR: 'Rupia Indiana',
    KRW: 'Won Sul-Coreano',
    AUD: 'Dólar Australiano',
    SGD: 'Dólar de Singapura',
};

const currencySymbols = {
    USD: '$',
    TRY: '₺',
    ZAR: 'R',
    BRL: 'R$',
    MXN: 'MX$',
    RUB: '₽',
    INR: '₹',
    KRW: '₩',
    AUD: 'A$',
    SGD: 'S$',
};

let previousRates = {};

const tbody = document.getElementById('ratesTable');
const lastUpdate = document.getElementById('lastUpdate');

async function fetchAPI(url) {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) {
        tbody.innerHTML = `<tr><td colspan="3">Erro da API</td></tr>`;
        console.error('Erro da API:', data.error);
        return;
    }
    return data;
}

async function getRates() {
    try {
        const url = `${proxyUrl || ''}${apiUrl}?access_key=${apiKey}&symbols=${importantCurrencies.join(',')}`;

        let data = await fetchAPI(url);
        if (!data) return;
        tbody.innerHTML = '';

        const maxValue = Math.max(...importantCurrencies.map(c => data.rates[c]));

        importantCurrencies.forEach(sym => {
            const value = data.rates[sym];
            const tr = document.createElement('tr');

            const tdSym = document.createElement('td');
            tdSym.textContent = `${currencyNames[sym]} - ${sym}`;

            const tdValue = document.createElement('td');
            tdValue.textContent = `${currencySymbols[sym]} ${value.toFixed(4)}`;

            if (previousRates[sym] !== undefined) {
                if (value > previousRates[sym]) {
                    console.log(`${currencyNames[sym]} (${sym}) subiu: ${previousRates[sym]} → ${value.toFixed(4)}`);
                } else if (value < previousRates[sym]) {
                    console.log(`${currencyNames[sym]} (${sym}) caiu: ${previousRates[sym]} → ${value.toFixed(4)}`);
                }
            }

            previousRates[sym] = value;

            const tdBar = document.createElement('td');
            const progressContainer = document.createElement('div');
            progressContainer.classList.add('progress-container');
            const progressBar = document.createElement('div');
            progressBar.classList.add('progress-bar', sym);
            progressBar.style.width = ((value / maxValue) * 100).toFixed(2) + '%';
            progressContainer.appendChild(progressBar);
            tdBar.appendChild(progressContainer);

            tr.appendChild(tdSym);
            tr.appendChild(tdValue);
            tr.appendChild(tdBar);
            tbody.appendChild(tr);
        });

        lastUpdate.textContent = `Última atualização: ${new Date().toLocaleTimeString()}`;

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="3">Erro de rede</td></tr>`;
        console.error('Erro de rede:', err);
    }
}

getRates();
setInterval(getRates, refreshInterval);