const isBefore = require('date-fns/is_before')
const isSameDay = require('date-fns/is_same_day')
const {partial} = require('../core/fn')

const isOfType = (asset, txn) => txn.get('buyAsset') === asset;
const isBeforeDate = (date, txn) => isSameDay(txn.get('date'), date) || isBefore(txn.get('date'), date)
const getTxnsOnDate = (txns, day) => txns.filter(partial(isBeforeDate, day))

module.exports = {
  isOfType,
  isBeforeDate,
  getTxnsOnDate
}
