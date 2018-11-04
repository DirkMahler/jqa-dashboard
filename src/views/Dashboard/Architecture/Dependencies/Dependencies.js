import React from "react";
import DashboardAbstract from "../../AbstractDashboardComponent";
import { AppSwitch } from "@coreui/react";
import { CypherEditor } from "graph-app-kit/components/Editor";
import {
    Button,
    Row,
    Col,
    Card,
    CardHeader,
    CardBody,
    Popover,
    PopoverHeader,
    PopoverBody
} from "reactstrap";
import DependencyChord from "./visualizations/DependencyChord";
import $ from "jquery";

var AppDispatcher = require("../../../../AppDispatcher");

class ArchitectureDependencies extends DashboardAbstract {
    constructor(props) {
        super(props);

        this.state = {
            popoverOpen: false,
            popovers: [
                {
                    placement: "bottom",
                    text: "Bottom"
                }
            ],
            query: localStorage.getItem("dependencies_expert_query")
        };

        this.toggleInfo = this.toggleInfo.bind(this);
    }

    componentDidMount() {
        super.componentDidMount();

        $(".expert-mode").on("change", function() {
            var editor = $(".expert-mode-editor");
            var visualizationWrapper = $(".visualization-wrapper");
            if (editor.hasClass("hide-expert-mode")) {
                editor.removeClass("hide-expert-mode");
                visualizationWrapper.addClass("margin-top-50 margin-bottom-50");
            } else {
                editor.addClass("hide-expert-mode");
                visualizationWrapper.removeClass(
                    "margin-top-50 margin-bottom-50"
                );
            }
        });
    }

    clear(event) {
        localStorage.setItem(
            "dependencies_expert_query",
            localStorage.getItem("dependencies_original_query")
        );
        this.sendQuery(this);
    }

    sendQuery(event) {
        this.setState({
            query: localStorage.getItem("dependencies_expert_query")
        });

        AppDispatcher.handleAction({
            actionType: "EXPERT_QUERY",
            data: {
                queryString: localStorage.getItem("dependencies_expert_query")
            }
        });
    }

    updateStateQuery(event) {
        localStorage.setItem("dependencies_expert_query", event);
    }

    toggleInfo() {
        this.setState({
            popoverOpen: !this.state.popoverOpen
        });
    }

    render() {
        var redirect = super.render();
        if (redirect.length > 0) {
            return redirect;
        }

        return (
            <div>
                <Row>
                    <Col xs="12" sm="12" md="12">
                        <Card>
                            <CardHeader>
                                Dependencies
                                <div className="card-actions">
                                    <div className={"float-left"}>
                                        <div
                                            className={
                                                "float-left expert-label"
                                            }
                                        >
                                            Expert mode
                                        </div>
                                        <AppSwitch
                                            className={
                                                "mx-1 float-right display-block expert-mode"
                                            }
                                            color={"secondary"}
                                            size={"sm"}
                                        />
                                    </div>

                                    <button
                                        onClick={this.toggleInfo}
                                        id="Popover1"
                                    >
                                        <i className="text-muted fa fa-question-circle" />
                                    </button>
                                    <Popover
                                        placement="bottom"
                                        isOpen={this.state.popoverOpen}
                                        target="Popover1"
                                        toggle={this.toggleInfo}
                                    >
                                        <PopoverHeader>
                                            Dependencies
                                        </PopoverHeader>
                                        <PopoverBody>
                                            The dependency analysis view helps
                                            to assess the coupling and cohesion
                                            of a software system. Packages are
                                            arranged radially around a circle
                                            and the dependencies are drawn as
                                            arcs.
                                        </PopoverBody>
                                    </Popover>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div
                                    className={
                                        "expert-mode-editor hide-expert-mode"
                                    }
                                >
                                    <CypherEditor
                                        className="cypheredit"
                                        value={this.state.query}
                                        options={{
                                            mode: "cypher",
                                            theme: "cypher"
                                        }}
                                        onValueChange={this.updateStateQuery.bind(
                                            this
                                        )}
                                    />
                                    <Button
                                        onClick={this.sendQuery.bind(this)}
                                        className="btn btn-success send-query float-right"
                                        color="success"
                                        id="send"
                                    >
                                        Send
                                    </Button>
                                    <Button
                                        onClick={this.clear.bind(this)}
                                        className="btn btn-success send-query float-right margin-right"
                                        color="danger"
                                        id="reset"
                                    >
                                        Reset
                                    </Button>
                                </div>
                                <DependencyChord />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ArchitectureDependencies;
