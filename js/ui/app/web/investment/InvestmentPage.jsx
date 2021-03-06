import React, {PureComponent} from 'react'
import {List, fromJS, Map} from 'immutable'
import dateformat from 'date-fns/format'
import {partial, pipe} from '../../../../common/core/fn'
import {filterObject} from '../../services/utils'
import {connect} from 'react-redux'
import {identity} from 'folktale/core/lambda'
import {Row, Col} from 'react-flexbox-grid'
import Button from 'material-ui/FlatButton'
import PageWithPanel from '../panel/PageWithPanel'
import AsyncPanel from '../panel/AsyncPanel'
import Table from '../table/Table'
import Container from '../common/Container'
import DialogBoxMixin from '../mixins/DialogBoxMixin'
import PanelContent from './PanelContent'
import {getBrokers} from '../../data/broker/brokerActions'
import {startInvestmentCurrentValueStream} from '../../data/stream/investmentValueStream'
import {renderInvestmentValue, getSelectedCurrency, renderPrice} from '../common/InvestmentValueHelpers'
import CurrencySelector from '../form/selectors/CurrencySelector'
import {
  getInvestments,
  saveInvestment,
  updateInvestment,
  deleteInvestment,
  getInvestmentTypes
} from '../../data/investment/investmentActions'

const columns = [
  {key: 'investmentType', label: 'Investment Type'},
  {key: 'broker', label: 'Broker'},
  {key: 'positionType', label: 'Position Type'},
  {key: 'date', label: 'Date'},
  {key: 'quantity', label: 'Quantity'},
  {key: 'price', label: 'Price'},
  {key: 'status', label: 'Status'},
  {key: 'action', label: 'Action'}
];
const DEFAULT_CURRENCY = 'GBP';

@DialogBoxMixin
class InvestmentPage extends PureComponent {
  state = {
    isPanelOpen: false,
    limit: 30,
    page: 1,
    skip: 0
  }

  componentDidMount() {
    const {skip, limit} = this.state;
    const {form, getInvestments, getBrokers, getInvestmentTypes} = this.props;
    const currency = getSelectedCurrency(form);

    this.loadInvestments()
    getBrokers({skip, limit});
    getInvestmentTypes({skip, limit});
    this.subscribe(currency);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidUpdate(prevProps) {
    const currency = getSelectedCurrency(this.props.form);

    if(getSelectedCurrency(prevProps.form) !== currency) {
      this.unsubscribe();
      this.subscribe(currency);
    }
  }

  unsubscribe() {
    this.props.stream
      .get('investmentCurrentValueSubscription')
      .matchWith({
        Just: ({value}) => value.unsubscribe(),
        Nothing: identity
      });
  }

  subscribe(currency) {
    this.props.startInvestmentCurrentValueStream(currency);
  }

  loadInvestments() {
    const {skip, limit} = this.state;
    this.props.getInvestments({skip, limit});
  }

  togglePanel = (_, selectedInvestment={}) => {
    this.setState({isPanelOpen: !this.state.isPanelOpen, selectedInvestment});
  }

  onInvestmentSave = investment => {
    const {saveInvestment, updateInvestment} = this.props;

    if(investment.id) {
     pipe(
       updateInvestment,
       filterObject(investment, ['action', 'status'])
      );
    }
    else {
      saveInvestment(fromJS(investment));
    }

    this.togglePanel();
  }

  onInvestmentDelete = investment => {
    this.props.deleteInvestment(investment);
  }

  onInvestmentDeleteClick = (investment, e) => {
    e.stopPropagation();
    this.openDialog(partial(this.onInvestmentDelete, investment))
  }

  handleCellClick = (e, _, investment) => {
    this.togglePanel(e, investment);
  }

  handleRowSizeChange = (e, rows) => {
    this.setState(Object.assign({}, this.state, { limit: rows }), this.loadInvestments);
  }

  // will include the value for each investment
  getExtendedTableData = (investments, investmentValues) =>
    investments.reduce(
      (acc, v, id) => acc.push(
        v.set('id', id)
          .set('date', dateformat(v.get('date'), 'MM/DD/YYYY'))
          .set('status', v.get('positionType') === 'buy' ? renderInvestmentValue(id, investmentValues, v.get('currency')): '')
          .set('action', <Button label="Delete" primary={true} onClick={partial(this.onInvestmentDeleteClick, v)} />)
      ),
      List()
    )
    .toJS();


  getInvestmentsData = investments => this.props.portfolio
      .get('investmentValues')
      .matchWith({
        Just: ({value}) => this.getExtendedTableData(investments, value),
        Nothing: () => this.getExtendedTableData(investments, Map())
      });

  getInvestmentsByAssetLife(assetLife) {
    return this.props.investments
      .get('investments')
      .filter(i => i.get('assetLife') === assetLife);
  }

  renderInvestementsTable = (subtitle, data) => (
    <Container title='Investments' subtitle={subtitle}>
      <AsyncPanel asyncResult={this.props.investments.get('fetchInvestmentsResult')}>
        <Table
          columns={columns}
          limit={this.state.limit}
          page={this.state.page}
          data={data}
          onRowSizeChange={this.handleRowSizeChange}
          handleCellClick={this.handleCellClick}
        />
      </AsyncPanel>
    </Container>
  )

  renderTable(assetLife) {
    return this.props.investments.get('fetchInvestmentsResult')
      .matchWith({
        Empty: () => {},
        Loading: () => {},
        Success: ({value}) =>
           pipe(
              partial(this.renderInvestementsTable, assetLife),
              this.getInvestmentsData,
              this.getInvestmentsByAssetLife(assetLife)
            ),
        Failure: () => {}
      })
  }

  getPanelContent() {
    const {investments, fetchInvestmentTypeResult, fetchBrokersResult, brokers} = this.props;

    return (
      <PanelContent
        saveInvestmentResult={investments.get('saveInvestmentResult')}
        investmentTypes={investments.get('investmentTypes')}
        brokers={brokers}
        selectedInvestment={this.state.selectedInvestment}
        onInvestmentSave={this.onInvestmentSave}
        fetchInvestmentTypeResult={investments.get('fetchInvestmentTypeResult')}
        fetchBrokersResult={fetchBrokersResult}
      />
    )
  }

  render() {
    return (
      <PageWithPanel
        PanelContent={this.getPanelContent()}
        togglePanel={this.togglePanel}
        isPanelOpen={this.state.isPanelOpen}>
          <Row className='row-spacing'>
            <Col xs>
              <CurrencySelector value={getSelectedCurrency(this.props.form)}/>
              <Button type="submit" className="right" onClick={this.togglePanel}>New</Button>
            </Col>
          </Row>
          <Row className='row-spacing'>
            <Col>
              {this.renderTable('Long Term')}
            </Col>
          </Row>
          <Row>
            <Col xs>
              {this.renderTable('Short Term')}
            </Col>
          </Row>
          {this.renderDialogBox('Are you sure you want to delete this investment?')}
      </PageWithPanel>
    );
  }
}

const mapStateToProps = state => ({
  form: state.form,
  stream: state.stream,
  investments: state.investment,
  brokers: state.broker.get('brokers'),
  portfolio: state.portfolio,
  fetchBrokersResult: state.broker.get('fetchBrokersResult'),
});

const mapDispatchToProps = dispatch => ({
  getInvestments: (dispatch) ['∘'] (getInvestments),
  saveInvestment: (dispatch) ['∘'] (saveInvestment),
  updateInvestment: (dispatch) ['∘'] (updateInvestment),
  deleteInvestment: (dispatch) ['∘'] (deleteInvestment),
  getBrokers: (dispatch) ['∘'] (getBrokers),
  getInvestmentTypes: (dispatch) ['∘'] (getInvestmentTypes),
  startInvestmentCurrentValueStream: (dispatch) ['∘'] (startInvestmentCurrentValueStream)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvestmentPage)

