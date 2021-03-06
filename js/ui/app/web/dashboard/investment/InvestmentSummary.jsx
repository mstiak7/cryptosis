import React, {PureComponent} from 'react'
import {autobind} from 'core-decorators'
import {Row, Col} from 'react-flexbox-grid'
import {renderInvestmentChange} from '../../common/InvestmentValueHelpers'
import {renderPrice} from '../../common/InvestmentValueHelpers'
import {getTotalCashForType, getQtyForType} from '../../../../../common/metrics/portfolio'
import TitledBox from '../../box/TitledBox'

class InvestmentSummary extends PureComponent {
  render() {
    const {asset, currency, portfolio, assetLife, total} = this.props;
    const exposure = total.getIn(['totalExposure', asset]);
    const holdings = getQtyForType(portfolio, asset, assetLife);
    const currentValue = total.getIn(['currentValue', asset]);
    const totalInvested = total.getIn(['totalInvested', asset]);
    const totalCash = getTotalCashForType(portfolio, asset, assetLife);
    const percentageChange = renderInvestmentChange(currentValue, exposure, currency);

    return (
      <div>
        <Row around='xs'>
          <Col xs={5} className='row-spacing'>
            <TitledBox color='secondary' header='Holdings'>{holdings}</TitledBox>
          </Col>
          <Col xs={5} className='row-spacing'>
            <TitledBox color='secondary' header='Exposure'>{renderPrice(exposure, currency)}</TitledBox>
          </Col>
        </Row>
        <Row around='xs'>
          <Col xs={5} className='row-spacing'>
            <TitledBox color='secondary' header='Cash'>{renderPrice(totalCash, currency)}</TitledBox>
          </Col>
          <Col xs={5} className='row-spacing'>
            <TitledBox color='secondary' header='Amount Invested'>{renderPrice(totalInvested, currency)}</TitledBox>
          </Col>
        </Row>
        <Row around='xs'>
          <Col xs={5} className='row-spacing'>
            <TitledBox color='secondary' header='Current Value'>{renderPrice(currentValue, currency)}</TitledBox>
          </Col>
          <Col xs={5} className='row-spacing'>
            <TitledBox color='secondary' header='Safe Sell Price'>{renderPrice(exposure / holdings, currency)}</TitledBox>
          </Col>
        </Row>
        <Row around='xs'>
          <Col xs={11} className='row-spacing'>
            <TitledBox color='secondary' header='Profit/Loss'>{percentageChange}</TitledBox>
          </Col>
        </Row>
      </div>
    );
  }
}

export default InvestmentSummary

