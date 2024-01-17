import ARIMA from 'arima';

const forecasting = (steps = 1, array = [], zeroes = true, params = { p: 1, d: 1, q: 1, verbose: false }) => {
    try {
        console.log(array);
        const model = new ARIMA(params).train(array);
        const [prediction, _errors] = model.predict(steps);
        return prediction.map(data => data > 0 ? Math.round(data) : 0);
    } catch (e) {
        console.log(e);
        throw new Error("Invalid parameters.");
    }
}

export default forecasting;