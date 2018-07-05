import React, { Component } from 'react';

import DashboardAbstract, {databaseCredentialsProvided} from './AbstractDashboardComponent';

import {Row, Col, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Popover, PopoverHeader, PopoverBody} from 'reactstrap';
import DashboardModel from '../../api/models/Dashboard';

class PopoverItem extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            popoverOpen: false,
            infoText: {
                "Architecture": "Dummy text.",
                "Resource Management": "Dummy text.",
                "Risk Management": "Dummy text.",
                "Quality Management": "Dummy text."
            }
        };
    }

    toggle() {
        this.setState({
            popoverOpen: !this.state.popoverOpen
        });
    }

    render() {
        return (
            <span>
                <a className="mr-1" color="secondary" id={'Popover-' + this.props.id} onClick={this.toggle}>
                    <i className="text-muted fa fa-question-circle"></i>
                </a>
                <Popover placement={'bottom'} isOpen={this.state.popoverOpen} target={'Popover-' + this.props.id} toggle={this.toggle}>
                    <PopoverHeader>{this.props.type}</PopoverHeader>
                    <PopoverBody>{this.state.infoText[this.props.type]}</PopoverBody>
                </Popover>
      </span>
        );
    }
}

class Dashboard extends DashboardAbstract {

    constructor(props) {
        super(props);

        this.state = {
            structureMetrics: {
                "classes": "loading",
                "interfaces": "loading",
                "enums": "loading",
                "annotations": "loading",
                "methods": "loading",
                "loc": "loading",
                "fields": "loading"
            },
            dependencyMetrics: {
                "dependencies": "loading",
                "extends": "loading",
                "implements": "loading",
                "invocations": "loading",
                "reads": "loading",
                "writes": "loading"
            },
            activityMetrics: {
                "authors": "loading",
                "commitsWithoutMerges": "loading",
                "commitsWithMerges": "loading"
            },
            staticCodeAnalysisPMDMetrics: {
                "violations": "loading"
            },
            testCoverageMetrics: {
                "overallTestCoverage": "loading"
            }
        };

        this.toggleInfo = this.toggleInfo.bind(this);
    }

    componentDidMount() {
        super.componentDidMount();
        if (databaseCredentialsProvided) {
            var dashboardModel = new DashboardModel();
            dashboardModel.readStructureMetrics(this);
            dashboardModel.readDependencyMetrics(this);
            dashboardModel.readActivityMetrics(this);
            dashboardModel.readStaticCodeAnalysisPMDMetrics(this);
            dashboardModel.readTestCoverageMetrics(this);
        }
    }

    toggleInfo() {
        this.setState({
            popoverOpen: !this.state.popoverOpen
        });
    }

    render() {
        var redirect = super.render();
        if (redirect.length > 0) {
            return(redirect);
        }

        return (
            <div className="animated fadeIn dashboard">
                <Row>
                    <Col xs="12" sm="6" md="3">
                        <Card>
                            <CardHeader>
                                Architecture
                                <div className="card-actions">
                                    <PopoverItem key={"Architecture"} type={"Architecture"} id={"Architecture"} />
                                </div>
                            </CardHeader>
                            <CardBody>
                                <a href="#/architecture/structure">
                                    <strong>Structure metrics</strong>
                                    <ListGroup className="margin-bottom">
                                        {Object.keys(this.state.structureMetrics).map(function(key) {

                                            var label = key
                                            // insert a space before all caps
                                                .replace(/([A-Z])/g, ' $1')
                                                .toLowerCase()
                                                // uppercase the first character
                                                .replace(/^./, function(str){ return str.toUpperCase(); });

                                            return <ListGroupItem key={key} className="justify-content-between">{label} <div className="float-right">{this.state.structureMetrics[key]}</div></ListGroupItem>;
                                        }, this)}
                                    </ListGroup>
                                </a>

                                <a href="#/architecture/dependencies">
                                    <strong>Dependency metrics</strong>
                                    <ListGroup>
                                        {Object.keys(this.state.dependencyMetrics).map(function(key) {

                                            var label = key
                                            // insert a space before all caps
                                                .replace(/([A-Z])/g, ' $1')
                                                .toLowerCase()
                                                // uppercase the first character
                                                .replace(/^./, function(str){ return str.toUpperCase(); });

                                            return <ListGroupItem key={key} className="justify-content-between">{label} <div className="float-right">{this.state.dependencyMetrics[key]}</div></ListGroupItem>;
                                        }, this)}
                                    </ListGroup>
                                </a>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs="12" sm="6" md="3">
                        <Card>
                            <CardHeader>
                                Resource Management
                                <div className="card-actions">
                                    <PopoverItem key={"ResourceManagement"} type={"Resource Management"} id={"ResourceManagement"} />
                                </div>
                            </CardHeader>
                            <CardBody>
                                <a href="#/resource-management/activity">
                                    <strong>Activity metrics</strong>
                                    <ListGroup>
                                        {Object.keys(this.state.activityMetrics).map(function(key) {

                                            var label = key
                                            // insert a space before all caps
                                                .replace(/([A-Z])/g, ' $1')
                                                .toLowerCase()
                                                // uppercase the first character
                                                .replace(/^./, function(str){ return str.toUpperCase(); });

                                            return <ListGroupItem key={key} className="justify-content-between">{label} <div className="float-right">{this.state.activityMetrics[key]}</div></ListGroupItem>;
                                        }, this)}
                                    </ListGroup>
                                </a>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs="12" sm="6" md="3">
                        <Card>
                            <CardHeader>
                                Risk Management
                                <div className="card-actions">
                                    <PopoverItem key={"RiskManagement"} type={"Risk Management"} id={"RiskManagement"} />
                                </div>
                            </CardHeader>
                            <CardBody>
                                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut
                                laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
                                ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs="12" sm="6" md="3">
                        <Card>
                            <CardHeader>
                                Quality Management
                                <div className="card-actions">
                                    <PopoverItem key={"QualityManagement"} type={"Quality Management"} id={"QualityManagement"} />
                                </div>
                            </CardHeader>
                            <CardBody>
                                <a href="#/quality-management/static-code-analysis/pmd">
                                    <strong>Static Code Analysis (PMD)</strong>
                                    <ListGroup className="margin-bottom">
                                        {Object.keys(this.state.staticCodeAnalysisPMDMetrics).map(function(key) {

                                            var label = key
                                            // insert a space before all caps
                                                .replace(/([A-Z])/g, ' $1')
                                                .toLowerCase()
                                                // uppercase the first character
                                                .replace(/^./, function(str){ return str.toUpperCase(); });

                                            return <ListGroupItem key={key} className="justify-content-between">{label} <div className="float-right">{this.state.staticCodeAnalysisPMDMetrics[key]}</div></ListGroupItem>;
                                        }, this)}
                                    </ListGroup>
                                </a>

                                <a href="#/quality-management/test-coverage">
                                    <strong>Test Coverage</strong>
                                    <ListGroup>
                                        {Object.keys(this.state.testCoverageMetrics).map(function(key) {

                                            var label = key
                                            // insert a space before all caps
                                                .replace(/([A-Z])/g, ' $1')
                                                .toLowerCase()
                                                // uppercase the first character
                                                .replace(/^./, function(str){ return str.toUpperCase(); });

                                            return <ListGroupItem key={key} className="justify-content-between">{label} <div className="float-right">{this.state.testCoverageMetrics[key]}%</div></ListGroupItem>;
                                        }, this)}
                                    </ListGroup>
                                </a>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Dashboard;
