import axios from 'axios'

const NBP_API_BASE_URL = 'http://api.nbp.pl/api/exchangerates/rates'

interface NBPCurrencyResponse {
    rates: NBPCurrencyRate[]
}

interface NBPCurrencyRate {
    mid: number
}

export async function getCurrencyRate(currencyCode: string): Promise<number> {
    const url = `${NBP_API_BASE_URL}/A/${currencyCode}/`
    const response = await axios.get<NBPCurrencyResponse>(url)
    const { rates } = response.data
    if (rates && rates.length > 0) {
        return rates[0].mid
    }
    throw new Error('Currency rate not found')
}
