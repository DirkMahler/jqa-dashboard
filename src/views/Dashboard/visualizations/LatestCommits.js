import React, { Component } from 'react';
import DashboardAbstract, { neo4jSession, databaseCredentialsProvided } from '../AbstractDashboardComponent';

import ReactTable from 'react-table';

class LatestCommits extends DashboardAbstract {

    constructor(props) {
        super(props);

        this.state = {
            latestCommits: []
        };
    }

    componentWillMount() {
        super.componentWillMount();
    }

    componentDidMount() {
        super.componentDidMount();
        if (databaseCredentialsProvided) {
            this.readLatestCommits();
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    readLatestCommits() {
        var aggregatedData = [];
        var thisBackup = this; //we need this because this is undefined in then() but we want to access the current state

        neo4jSession.run(
            'MATCH (a:Author)-[:COMMITTED]->(c:Commit) ' +
            'RETURN a.name, c.date, c.message ' +
            'ORDER BY c.date desc ' +
            'LIMIT 20'
        ).then(function (result) {
            result.records.forEach(function (record) {
                var recordConverted = {
                    "author": record.get(0),
                    "date": record.get(1),
                    "message": record.get(2)
                };

                aggregatedData.push(recordConverted);
            });
        }).then( function(context) {
            //console.log(aggregatedData);
            thisBackup.setState({latestCommits: aggregatedData}); //reverse reverses the order of the array (because the chart is flipped this is neccesary)
        }).catch(function (error) {
            console.log(error);
        });
    }

    render() {
        var redirect = super.render();
        if (redirect.length > 0) {
          return(redirect);
        }

        if (this.state.latestCommits.length === 0) {
            return '';
        }

        return (
            <div>
                <div>
                    <ReactTable
                        data = {this.state.latestCommits}
                        columns = {[
                            {
                                Header: "Author",
                                accessor: "author"
                            },
                            {
                                Header: "Date",
                                accessor: "date"
                            },
                            {
                                Header: "Message",
                                accessor: "message"
                            }
                        ]}
                        defaultPageSize = {10}
                        className = "-striped -highlight"
                    />
                </div>
            </div>
        )
    }
}

export default LatestCommits;
