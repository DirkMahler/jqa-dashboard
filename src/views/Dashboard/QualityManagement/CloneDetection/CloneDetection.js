import React, { Component } from 'react';

import DashboardAbstract, { neo4jSession } from '../../Abstract';

import {Badge, Row, Col, Card, CardHeader, CardFooter, CardBody, Label, Input} from 'reactstrap';

class QualityManagementCloneDetection extends DashboardAbstract {

    constructor(props) {
        super(props);

        this.state = {
        };
    }

    componentDidMount() {
        super.componentDidMount();
    }

    render() {
        var redirect = super.render();
        if (redirect.length > 0) {
          return(redirect);
        }

        return (
            <div>
                <Row>
                    <Col xs="12" sm="12" md="12">
                        <Card>
                            <CardHeader>
                                Currently empty
                            </CardHeader>
                            <CardBody>
                                Currently empty
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default QualityManagementCloneDetection;
