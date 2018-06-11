import React, { Component } from 'react';
import DashboardAbstract, { neo4jSession, databaseCredentialsProvided } from '../../../AbstractDashboardComponent';

import {ResponsivePie} from '@nivo/pie';

class FileType extends DashboardAbstract {

    constructor(props) {
        super(props);

        this.state = {
            filetypeData: []
        };
    }

    componentWillMount() {
      super.componentWillMount();
    }
  
    componentDidMount() {
      super.componentDidMount();

      if (databaseCredentialsProvided) {
        this.readFiletypes();
      }
    }

    componentWillUnmount() {
      super.componentWillUnmount();
    }

    readFiletypes() {
      var aggregatedData = [];
      var thisBackup = this; //we need this because this is undefined in then() but we want to access the current state

      neo4jSession.run(
        'MATCH (f:Git:File) ' + 
        'WITH f, split(f.relativePath, ".") as splittedFileName ' +
        'SET f.type = splittedFileName[size(splittedFileName)-1] ' +
        'RETURN f.type as filetype, count(f) as files ' +
        'ORDER BY files DESC'
      ).then(function (result) {
        result.records.forEach(function (record) {
          var recordConverted = {
            "id": record.get(0),
            "label": record.get(0),
            "value": record.get(1).low
          };

          if (recordConverted.id !== null && recordConverted.value > 3) { //below 3 is considered too small to display
            aggregatedData.push(recordConverted);
          }
        });
      }).then( function(context) {
        thisBackup.setState({filetypeData: aggregatedData});
      }).catch(function (error) {
          console.log(error);
      });
    }

    render() {
        var redirect = super.render();
        if (redirect.length > 0) {
          return(redirect);
        }

        if (this.state.filetypeData.length === 0) {
            return '';
        }

        return (
            <div>
              <div style={{height:"600px"}}>
                <ResponsivePie
                  data={this.state.filetypeData}
                  margin={{
                    "top": 20,
                    "right": 20,
                    "bottom": 20,
                    "left": 20
                  }}
                  onClick={ function(event) {
                    console.log(event);
                    AppDispatcher.handleAction({
                      actionType: 'SELECT_FILETYPE',
                      data: event
                    });
                  } }
                  innerRadius={0}
                  padAngle={0}
                  cornerRadius={0}
                  colors="d320c"
                  colorBy="id"
                  borderColor="inherit:darker(0.6)"
                  radialLabelsSkipAngle={5}
                  radialLabelsTextXOffset={6}
                  radialLabelsTextColor="#333333"
                  radialLabelsLinkOffset={0}
                  radialLabelsLinkDiagonalLength={16}
                  radialLabelsLinkHorizontalLength={24}
                  radialLabelsLinkStrokeWidth={1}
                  radialLabelsLinkColor="inherit"
                  slicesLabelsSkipAngle={5}
                  slicesLabelsTextColor="#333333"
                  animate={true}
                  motionStiffness={90}
                  motionDamping={15}
                  legends={[
                    {
                      "anchor": "top-right",
                      "direction": "column",
                      "translateX": -140,
                      "translateY": 56,
                      "itemWidth": 20,
                      "itemHeight": 20,
                      "symbolSize": 20,
                      "itemsSpacing": 5,
                      "symbolShape": "square"
                    }
                  ]}
                />
              </div>
            </div>
        )
    }
}

export default FileType;
