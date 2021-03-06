import React, {Component} from 'react'
import Snackbar from 'material-ui/Snackbar'
import {Row, Col} from 'react-flexbox-grid'
import classnames from 'classnames'
import Spinner from '../spinner/Spinner'

export default class AsyncPanel extends Component {
  renderActionStatus(asyncResult) {
    return asyncResult.matchWith({
      Empty: () => null,
      Loading: () => <Spinner />,
      Success: () => null,
      Failure: () => null
    });
  }

  shouldFadeOut(asyncResult) {
    return asyncResult.matchWith({
      Empty: () => false,
      Loading: () => true,
      Success: () => false,
      Failure: () => false
    });
  }

  render() {
    const {children, asyncResult} = this.props;
    const classList = {
      'fade-out': this.shouldFadeOut(asyncResult)
    };

    return (
      <Row center='xs'>
        <Col xs className={classnames(classList)}>
          {children}
        </Col>
        {this.renderActionStatus(asyncResult)}
      </Row>
    );
  }
}
