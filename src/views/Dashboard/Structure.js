import React, { Component } from 'react';

import {render} from 'react-dom';
import {Pie, Bar} from 'nivo';

import DashboardAbstract, { neo4jSession } from './Abstract';

import FileType from './visualizations/FileType';

class Structure extends DashboardAbstract {

    constructor(props) {
        super(props);

        this.state = {
        };
    }

    componentDidMount() {
      super.componentDidMount();
    }

    render() {
        return (
          <div>
            <FileType/>
          </div>
        )
    }
}

export default Structure;
