import {Map} from 'immutable';
import isBefore from 'date-fns/is_before'
import {partial} from '../../helpers/fn';

// { [id]: Investment  } -> { [InvestmentType] -> Value }
const groupTotalValuePerTypeReducer = (acc, v) =>
  acc.update(
    v.get('investmentType'),
    0,
    sum => sum + getTotalForInvestment(v)
  )

// { [id]: Investment  } -> { [InvestmentType] -> CurrentValue }
const groupCurrentTotalValuePerTypeReducer = prices => (acc, v) => {
  const type = v.get('investmentType');
  return acc.update(
    type,
    0,
    sum => sum + getCurrentTotalForInvestment(v, prices.getIn([type, 'price']))
  )
}

// Investment CurrentPrice -> Value
export const getCurrentTotalForInvestment = (investment, currentPrice) => investment.get('quantity') * currentPrice;

// Investment PriceOfPurchase -> Value
export const getTotalForInvestment = i => i.get('price') * i.get('quantity');

// Finds the total money invested per type of investment
export const calculateTotalPerType = investments => investments.reduce(groupTotalValuePerTypeReducer, Map())

// Finds the total value per type of investment based on the current buy price
export const calculateCurrentValuePerType = (investments, prices) => investments.reduce(
  groupCurrentTotalValuePerTypeReducer(prices),
  Map()
)

// we need to find the total portfolio value on the given date.
// Investments that didn't exist on that date should not contribute to the figure
export const getTotalValueAfterDate = (investments, symbol, date, priceOfDay) =>
  investments
    .filter(i => i.get('investmentType') === symbol && isBefore(i.get('date'), date))
    .reduce(
      (sum, investment) => sum + (getCurrentTotalForInvestment(investment, priceOfDay) - getTotalForInvestment(investment)),
      0
    )