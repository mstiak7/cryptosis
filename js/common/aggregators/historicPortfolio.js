const {fromJS, Map} = require('immutable');
const {create} = require('@most/create');
const {getChangeAfterDate, calculateTotalCash, getCashAfterDate} = require('./common');

// Gets all prices for the last 30 days for the given symbol i.e. ETH
// and returns the portfolio values for each day
// i.e. Price[] Investment[Id, Investment] Symbol -> {day, value}
const getPortfolioValueForSymbol = (priceList, investments, symbol) =>
  priceList.map(p => {
    const {day, price} = p.toJS();

    return fromJS({
      day,
      value: {
        change: getChangeAfterDate(investments, symbol, day, price),
        cash: getCashAfterDate(investments, symbol, day)
      }
    })
  })

// returns a Map with keys for each symbol and the entries
// for each day as well as the portfolio value on that date
// e.g. {[id]: Investment} {ETH: Price[]} -> { ETH: [{day: 123, value: 2000}], BTC:  [{day: 123, value: 2000}]}
const calculateHistoricPortfolioValues = ({investments, prices}) =>
  create((add, end, error) => {
    const longTermInvestments = investments.filter(i => i.get('assetLife') === 'Long Term');
    const shortTermInvestments = investments.filter(i => i.get('assetLife') === 'Short Term');

    const longTerm = prices.reduce(
      (acc, priceList, symbol) => acc.set(
        symbol,
        getPortfolioValueForSymbol(priceList, longTermInvestments, symbol),
      ),
      Map()
    )

    const shortTerm = prices.reduce(
      (acc, priceList, symbol) => acc.set(
        symbol,
        getPortfolioValueForSymbol(priceList, shortTermInvestments, symbol),
      ),
      Map()
    )

    add(fromJS({longTerm, shortTerm}));
    end();

    return () => console.log('Unsubscribe calculateHistoricPortfolioValues');
  });

module.exports = {calculateHistoricPortfolioValues};
