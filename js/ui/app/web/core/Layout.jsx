import React, {Component} from 'react';
import {autobind} from 'core-decorators';
import {createStyleSheet} from 'jss-theme-reactor';
import Paper from 'material-ui/Paper';
import Header from './Header';
import SideBar from './SideBar';
import Layout from 'material-ui/Layout';

export default NestedComponent => class LayoutComponent extends Component {
  constructor(props, state) {
    super(props, state);

    this.state = {
      isSiderBarOpen: false
    };
  }

  @autobind
  onSidebarClick(link, e) {
    // e.preventDefault();
    console.log(link);
    //redirect to given link using react router
  }

  @autobind
  toggleSidebar() {
    this.setState({isSiderBarOpen: !this.state.isSiderBarOpen});
  }

  render() {
    const {isSiderBarOpen} = this.state;
    const layoutProps = {
      direction: 'column',
      align: 'stretch'
    };

    return (
      <div>
        <Header toggleSidebar={this.toggleSidebar}/>
        <div className="main-content">
          <Layout container {...layoutProps}>
            <Paper className='main-content__page'>
              <NestedComponent />
            </Paper>
          </Layout>
        </div>
        <SideBar
          toggleSidebar={this.toggleSidebar}
          isOpen={isSiderBarOpen}
          onSidebarClick={this.onSidebarClick}
        />
      </div>
    );
  }
}