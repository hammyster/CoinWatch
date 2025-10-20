// ========================== CONFIGURAÇÃO ==========================

// Sua chave de API do Fixer.io
const apiKey = ""; // API FIXER.IO

// Caso precise usar proxy (opcional)
const proxyUrl = ''; // CASO USE PROXY

// URL base da API do Fixer.io
const apiUrl = 'https://data.fixer.io/api/latest';

// Intervalo de atualização das cotações (em milissegundos)
const refreshInterval = 10000; // 10 segundos

// Lista das moedas mais importantes que você quer monitorar
const importantCurrencies = [
    'USD', 'TRY', 'ZAR', 'BRL', 'MXN',
    'RUB', 'INR', 'KRW', 'AUD', 'SGD'
];

// Nome completo de cada moeda para exibição na tabela
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

// Símbolos monetários para exibição
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

// Armazena os valores anteriores das moedas para comparar variação
let previousRates = {};

// Elementos HTML que receberão os dados
const tbody = document.getElementById('ratesTable'); // Corpo da tabela
const lastUpdate = document.getElementById('lastUpdate'); // Texto de última atualização

// ========================== FUNÇÕES ==========================

/**
 * Função para buscar dados da API
 * @param {string} url - URL completa da API
 * @returns {Object} Dados da API em JSON
 */
async function fetchAPI(url) {
    const response = await fetch(url); // Faz a requisição
    const data = await response.json(); // Converte para JSON
    if (!data.success) { // Verifica se a API retornou erro
        tbody.innerHTML = `<tr><td colspan="3">Erro da API</td></tr>`;
        console.error('Erro da API:', data.error);
        return;
    }
    return data;
}

/**
 * Função principal para atualizar as cotações
 */
async function getRates() {
    try {
        // Monta a URL completa da API, incluindo proxy e moedas importantes
        const url = `${proxyUrl || ''}${apiUrl}?access_key=${apiKey}&symbols=${importantCurrencies.join(',')}`;

        let data = await fetchAPI(url); // Busca os dados
        if (!data) return; // Se houve erro, sai da função

        tbody.innerHTML = ''; // Limpa a tabela antes de atualizar

        // Descobre o maior valor entre as moedas para calcular barra de progresso
        const maxValue = Math.max(...importantCurrencies.map(c => data.rates[c]));

        // Loop pelas moedas importantes
        importantCurrencies.forEach(sym => {
            const value = data.rates[sym]; // Valor atual da moeda
            const tr = document.createElement('tr'); // Cria linha da tabela

            // Coluna: nome da moeda + sigla
            const tdSym = document.createElement('td');
            tdSym.textContent = `${currencyNames[sym]} - ${sym}`;

            // Coluna: valor da moeda formatado
            const tdValue = document.createElement('td');
            tdValue.textContent = `${currencySymbols[sym]} ${value.toFixed(4)}`;

            // Log de variação em relação ao valor anterior
            if (previousRates[sym] !== undefined) {
                if (value > previousRates[sym]) {
                    console.log(`${currencyNames[sym]} (${sym}) subiu: ${previousRates[sym]} → ${value.toFixed(4)}`);
                } else if (value < previousRates[sym]) {
                    console.log(`${currencyNames[sym]} (${sym}) caiu: ${previousRates[sym]} → ${value.toFixed(4)}`);
                }
            }

            // Atualiza valor anterior
            previousRates[sym] = value;

            // Coluna: barra de progresso proporcional ao maior valor
            const tdBar = document.createElement('td');
            const progressContainer = document.createElement('div');
            progressContainer.classList.add('progress-container'); // Classe para estilo
            const progressBar = document.createElement('div');
            progressBar.classList.add('progress-bar', sym); // Classe para estilo individual
            progressBar.style.width = ((value / maxValue) * 100).toFixed(2) + '%'; // Largura proporcional
            progressContainer.appendChild(progressBar);
            tdBar.appendChild(progressContainer);

            // Monta a linha
            tr.appendChild(tdSym);
            tr.appendChild(tdValue);
            tr.appendChild(tdBar);
            tbody.appendChild(tr); // Adiciona à tabela
        });

        // Atualiza horário da última atualização
        lastUpdate.textContent = `Última atualização: ${new Date().toLocaleTimeString()}`;

    } catch (err) {
        // Caso ocorra erro de rede
        tbody.innerHTML = `<tr><td colspan="3">Erro de rede</td></tr>`;
        console.error('Erro de rede:', err);
    }
}

// ========================== EXECUÇÃO ==========================

getRates(); // Chama a função inicialmente
setInterval(getRates, refreshInterval); // Atualiza perante o tempo definido em refreshInterval