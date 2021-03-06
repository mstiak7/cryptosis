const {Map} = require('immutable');
const isBefore = require('date-fns/is_before');
const isSameDay = require('date-fns/is_same_day');
const {partial, predicate} = require('../core/fn');

// { [id]: Investment  } -> { [InvestmentType] -> Value }
const groupTotalValueInvestedPerTypeReducer = (acc, v) =>
  acc.update(
    v.get('investmentType'),
    (sum=0) => sum + getTotalAmountInvested(v)
  )

const groupTotalQtyPerTypeReducer = (acc, v) =>
 acc.update(
    v.get('investmentType'),
    0,
    qty => qty + v.get('quantity')
  )

// Investment CurrentPrice -> Value
const getCurrentTotalForInvestment = (investment, currentPrice) => investment.get('quantity') * currentPrice

// when we sell and get cash we need to sutract the expenses
const includeExpenses = (i, value) => i.get('positionType') === 'buy'
    ? value + i.get('expenses')
    : value - i.get('expenses')

// Investment PriceOfPurchase -> Value
const getTotalAmountInvested = i => includeExpenses(i, i.get('price') * i.get('quantity'));

// Finds the total money invested per type of investment
const calculateTotalAmountInvestedPerType = investments => investments.reduce(groupTotalValueInvestedPerTypeReducer, Map())

// finds the total quanityt inlcuding only buys or sells
const calculateTotalQtyPerType = investments => investments.reduce(groupTotalQtyPerTypeReducer, Map())

const getValueForPrice = (price, qty) => qty * price;
const merger = (val1, val2) => val1 - val2;

// finds the total quantity (buys - sells)
const calculatePortfolioTotalQtyPerType = investments => {
  const totalQtyBoughPerType = calculateTotalQtyPerType(filterBuys(investments));
  const totalQtySoldPerType = calculateTotalQtyPerType(filterSells(investments));

  return totalQtyBoughPerType
    .mergeWith(merger, totalQtySoldPerType);
}

// Finds the total value per type of investment based on the current buy price
const calculateCurrentValuePerType = (investments, prices) =>
  calculatePortfolioTotalQtyPerType(investments)
    .map((qty, type) => {
      return getValueForPrice(prices.getIn([type, 'price']), qty)
    })

const calculateCurrentValueAtPrice = (investments, price) =>
  calculatePortfolioTotalQtyPerType(investments)
    .map(partial(getValueForPrice, price))

const getPercentageChange = (diff, initial) => (diff / initial) * 100

const getInvestmentValueChange = (qty, buyPrice, sellPrice) => qty * sellPrice - qty * buyPrice

const isBeforeDate = (date, investment) => isSameDay(investment.get('date'), date) || isBefore(investment.get('date'), date)
const isOfType = (investmentType, investment) => investment.get('investmentType') === investmentType;

// we need to find the total change  on the given date.
// Investments that didn't exist on that date should not contribute to the figure
const getChangeAfterDate = (investments, investmentType, date, priceOfDay) => {
  const filteredIvestments = investments
    .filter(
      predicate(
        partial(isOfType, investmentType),
        partial(isBeforeDate, date))
      )

  return calculateChangeForType(filteredIvestments, priceOfDay, investmentType)
}

const getCashAfterDate = (investments, investmentType, date) => {
  const filteredIvestments = investments
    .filter(
      predicate(
        partial(isOfType, investmentType),
        partial(isBeforeDate, date))
      )

  return calculateTotalCash(filteredIvestments).get(investmentType) || 0;
}

const getTotalValueAfterDate = (investments, investmentType, date, currentPrice) => {
  const filteredIvestments = investments
    .filter(
      predicate(
        partial(isOfType, investmentType),
        partial(isBeforeDate, date))
      )

  return calculateCurrentValueAtPrice(investments, currentPrice).get(investmentType) || 0
}

const filterBuys = investments => investments.filter(v => v.get('positionType') === 'buy')
const filterSells = investments => investments.filter(v => v.get('positionType') === 'sell')

// total cash from the positions sold
const calculateTotalCash = (calculateTotalAmountInvestedPerType) ['∘'] (filterSells)

const calculateTotalAmountInvested = (calculateTotalAmountInvestedPerType) ['∘'] (filterBuys)

// total invested per investment type - total cash per investment type
const calculateExposure = investments =>
  // net cost includes expenses for both buy and sells
  calculateTotalAmountInvested(investments).mergeWith(
    merger,
    calculateTotalCash(investments)
  )

// finds the current liquid value for the given investment type (described byt)
const calculateChangeForType = (investments, currentPrice, investmentType) => {
  const currentTotalValue = calculateCurrentValueAtPrice(investments, currentPrice).get(investmentType) || 0;
  const totalCash = calculateTotalCash(investments).get(investmentType) || 0;
  const totalInvested = calculateTotalAmountInvestedPerType(filterBuys(investments)).get(investmentType) || 0;

  return (currentTotalValue + totalCash) - totalInvested;
}

module.exports = {
  filterBuys,
  filterSells,
  calculateExposure,
  calculateTotalCash,
  calculateTotalAmountInvested,
  calculatePortfolioTotalQtyPerType,
  getInvestmentValueChange,
  getCurrentTotalForInvestment,
  calculateTotalAmountInvestedPerType,
  calculateCurrentValuePerType,
  getPercentageChange,
  getChangeAfterDate,
  getCashAfterDate,
  getTotalValueAfterDate,
  getTotalAmountInvested
}
