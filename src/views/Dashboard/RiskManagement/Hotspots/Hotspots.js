import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DashboardAbstract, { neo4jSession, databaseCredentialsProvided } from '../../AbstractDashboardComponent';
import {Row, Col, Card, CardHeader, CardBody} from 'reactstrap';
import DynamicBreadcrumb from '../../../../components/Breadcrumb/DynamicBreadcrumb';
import SimpleBar from 'SimpleBar';

var AppDispatcher = require('../../../../AppDispatcher');

import {ResponsiveBubbleHtml} from 'nivo';
import * as d3 from "d3";

import {Treebeard} from 'react-treebeard';
var treebeardCustomTheme = require('./TreebeardCustomTheme');
// from here: https://github.com/alexcurtis/react-treebeard
// TODO: add search input from example: https://github.com/alexcurtis/react-treebeard/tree/master/example
// demo: http://alexcurtis.github.io/react-treebeard/

var IDENTIFIER_PROJECT_NAME = "projectName";
var dynamicBreadcrumbSeparator = " > ";
var stringToColour = require('string-to-color');
var maxComplexity = 0;

class RiskManagementHotspots extends DashboardAbstract {

    constructor(props) {
        super(props);

        this.state = {
            hotSpotData:
                { 
                    "name": "nivo",
                    "test": "testval",
                    "children": [
                        {
                            "name": "dummy",
                            "loc": 1
                        }
                    ]
                },
            treeViewData:
                {
                    name: 'root',
                    toggled: true,
                    children: [
                        {
                            name: 'parent',
                            children: [
                                { name: 'child1' },
                                { name: 'child2' }
                            ]
                        },
                        {
                            name: 'parent',
                            children: [
                                {
                                    name: 'nested parent',
                                    children: [
                                        { name: 'nested child 1' },
                                        { name: 'nested child 2' }
                                    ]
                                }
                            ]
                        }
                    ]
                },
            breadCrumbData: ['']
        };

        this.onToggle = this.onToggle.bind(this);
        this.getCommits = this.getCommits.bind(this);
    }

    componentWillMount() {
        super.componentWillMount();
    }

    componentDidMount() {
        var thisBackup = this;
        super.componentDidMount();

        if (databaseCredentialsProvided) {
            this.readStructure();
        }

        // put id of hovered element into state
        document.querySelector('.hotspot-component').onmouseover = function(e) {
            var targ;
            if (!e) var e = window.event;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            if (targ.nodeType == 3) // defeat Safari bug
                targ = targ.parentNode;

            if (typeof(targ.id) !== "undefined" && targ.id !== '') {
                thisBackup.setState({ hoveredNode: targ.id });

                var strongElement = document.querySelector(".hotspot-component strong");
                if (strongElement) {
                    var parent = strongElement.parentElement;
                    var str = parent.innerHTML.split(':');

                    // check is label is already set
                    if (document.getElementsByClassName('hotspots-loc-label').length === 0) {
                        // we use insertAdjacentHTML because innerHTML sadly removes all listeners
                        parent.insertAdjacentHTML('afterend', "<span class='hotspots-loc-label'> LOC</span>");
                    }
                }

                // clean commits label
                if (document.getElementsByClassName('hotspots-commits-label').length !== 0) {
                    var grandParent = parent.parentElement;
                    grandParent.removeChild(document.getElementById('hotspots-commits-label'));
                }

                //console.log('id: ' + thisBackup.state.hoveredNode);
                var commits = thisBackup.getCommits(thisBackup.state.hoveredNode);
                var locLabelElement = document.querySelector(".hotspots-loc-label");

                if (typeof(commits) !== 'undefined') {
                    locLabelElement.insertAdjacentHTML('afterend', "<span id='hotspots-commits-label' class='hotspots-commits-label'>, " + commits + " Commits</span>");
                }

            }
        };

    }

    getCommits(name) {
        var result = _.find(this.state.commitsData, function(data) {
            return data.name === name;
        });

        if (typeof(result) === 'object' && typeof(result.commits) !== 'undefined') {
            return result.commits;
        }
    }

    componentDidUpdate() {
        //var targetNode = document.querySelector('.hotspot-component > div > div');
        //var thisBackup = this;
        // Callback function to execute when mutations are observed
        // TODO: check if onmouseover listener is more efficient
        //var hotspotCallback = function(mutationsList) {
        //    for(var mutation of mutationsList) {
        //        console.log(mutation.type);
        //        if (mutation.type === 'childList') {
        //
        //
        //          }
        //           }
        //};

        // Create an observer instance linked to the callback function
        //var observer = new MutationObserver(hotspotCallback);

        // Start observing the target node for configured mutations
        //observer.observe(targetNode, {childList: true, attributes: true});
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    readStructure() {

        var flatData = [];
        var commitsData = [];
        var hierarchicalData = [];
        var projectName = localStorage.getItem(IDENTIFIER_PROJECT_NAME); // "PROJECTNAME"; // acts as root as there are multiple root packages in some cases
        var thisBackup = this; //we need this because this is undefined in then() but we want to access the current state

        neo4jSession.run(
            "MATCH\n" +
            " (c:Commit)-[:CONTAINS_CHANGE]->()-[:MODIFIES]->(f:File)\n" +
            "WHERE NOT\n" +
            " c:Merge\n" +
            "WITH\n" +
            " f, count(c) as commits\n" +
            "MATCH\n" +
            " (t:Type)-[:HAS_SOURCE]->(f),\n" +
            " (t)-[:DECLARES]->(m:Method)\n" +
            "WHERE\n" +
            " f.relativePath STARTS WITH 'src'\n" +
            "RETURN\n" +
            " t.fqn as fqn, sum(commits) as commits, sum(m.cyclomaticComplexity) as complexity, sum(m.effectiveLineCount) as loc"
        ).then(function (result) {
            var collectedNames = [];

            maxComplexity = 0; //reset value

            // collect results
            result.records.forEach(function (record) {
                var name = record.get("fqn");
                var currentComplexity = record.get("complexity").low;

                if (currentComplexity > maxComplexity) {
                    maxComplexity = currentComplexity;
                }

                if (collectedNames[name]) { //if name already present add complexity and loc
                    for (var i = 0; i < flatData.length; i++) {
                        if (flatData[i].name === name) {
                            console.log("----");
                            console.log(flatData[i]);
                            flatData[i].complexity += currentComplexity;
                            flatData[i].loc += record.get("loc").low;
                            flatData[i].commits += record.get("commits").low;
                            console.log(flatData[i]);
                        }
                    }

                    return; //continue in forEach
                }
                collectedNames[name] = 1;

                var recordConverted = {
                    "name": name,
                    "complexity": currentComplexity,
                    "loc": record.get("loc").low,
                    "commits": record.get("commits").low,
                    "level": 0,
                    "role": "leaf"
                };

                flatData.push(recordConverted);
                commitsData.push(
                    {
                        name: recordConverted.name.replace(/[^\w]/gi, '-'),
                        commits: recordConverted.commits
                    }
                );

                //fill packages to allow stratify()
                var level = 0;
                while (name.lastIndexOf(".") !== -1) {

                    level = name.split(".").length - 1;

                    name = name.substring(0, name.lastIndexOf("."));
                    if (!collectedNames[name]) {
                        collectedNames[name] = 1;
                        flatData.push({
                            "name": name,
                            "complexity": 0,
                            "loc": 0,
                            "commits": 0,
                            "level": level,
                            "role": "node"
                        });
                    }
                }
            });

            // add projectname as root
            var root = {
                "name": projectName,
                "complexity": 0,
                "loc": 1, // at least 1 to make it visible
                "commits": 0,
                "level": 0,
                "role": "node"
            };
            flatData.push(root);

            // turn flat json into hierarchical json
            var stratify = d3.stratify()
                .id(function (d) {
                    return d.name;
                })
                .parentId(function (d) {
                    if (d.name.lastIndexOf(".") != -1) { // classes and subpackes
                        return d.name.substring(0, d.name.lastIndexOf("."));
                    } else if (d.name != projectName) { // a root package
                        return projectName;
                    } else { // project name as root
                        return "";
                    }
                });
            hierarchicalData = stratify(flatData);

            //normalize recursively all childs (move information from .data to the element's root where nivo expects it)
            var normalize = function(hierarchicalData) {
                for (var i = 0; i < hierarchicalData.children.length; i++) {
                    var lastDot = hierarchicalData.children[i].data.name.lastIndexOf(".");
                    hierarchicalData.children[i].name = hierarchicalData.children[i].data.name.substring(lastDot + 1);
                    hierarchicalData.children[i].loc = hierarchicalData.children[i].data.loc;
                    hierarchicalData.children[i].complexity = hierarchicalData.children[i].data.complexity;
                    if (hierarchicalData.children[i].children) {
                        normalize(hierarchicalData.children[i]);
                    }
                }
            };

            normalize(hierarchicalData);

            neo4jSession.close();

            //normalize the root element
            hierarchicalData.name = hierarchicalData.id;
            hierarchicalData.loc = hierarchicalData.data.loc;
            hierarchicalData.complexity = hierarchicalData.data.complexity;
            hierarchicalData.commits = hierarchicalData.data.commits;
        }).then( function(context) {
            thisBackup.setState({hotSpotData: hierarchicalData});
            thisBackup.setState({commitsData: commitsData});
            //console.log(maxComplexity);
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    triggerClickOnNode(node) {
        var nodeId = node.id.replace(/[^\w]/gi, '-');
        if (node.id) {
            var bubbleBelongingToNode = document.querySelectorAll('div#' + nodeId);
            if (bubbleBelongingToNode && bubbleBelongingToNode.length == 1) {
                bubbleBelongingToNode[0].click();
            } else if (bubbleBelongingToNode.length > 1) {
                console.log("Found more than one candidate to click on, to prevent a mess nothing has been clicked. ");
                console.log(bubbleBelongingToNode);
            }
        }
    }

    // tree view toggle
    onToggle(node, toggled) {
        this.triggerClickOnNode(node);

        if (this.state.cursor) {
            this.state.cursor.active = false;
        }
        node.active = true;
        if (node.children) {
            node.toggled = toggled;
        }
        this.setState({ cursor: node });

        var el = new SimpleBar(document.getElementById('treebeard-component'));
        el.recalculate()
    }

    handleAction(event) {
        var PROJECTNAME = 'PROJECTNAME';

        var action = event.action;
        switch (action.actionType) {
          // Respond to CART_ADD action
          case 'SELECT_HOTSPOT_PACKAGE':
            var selectedPackage = event.action.data.data.id;

            var hotspotClone = this.state.hotSpotData;

            var markSelectedPackageAsActive = function(hierarchicalData) {
                for (var i = 0; i < hierarchicalData.children.length; i++) {
                    if (hierarchicalData.children[i].id === selectedPackage) {
                        hierarchicalData.children[i].active = true;
                    } else {
                        hierarchicalData.children[i].active = false;
                    }

                    if (hierarchicalData.children[i].children) {
                        markSelectedPackageAsActive(hierarchicalData.children[i]);
                    }
                }
            };
            markSelectedPackageAsActive(hotspotClone);

            var markAllPackagesAsUntoggled = function(hierarchicalData) {
                for (var i = 0; i < hierarchicalData.children.length; i++) {
                    hierarchicalData.children[i].toggled = false;

                    if (hierarchicalData.children[i].children) {
                        markAllPackagesAsUntoggled(hierarchicalData.children[i]);
                    }
                }
            };

            markAllPackagesAsUntoggled(hotspotClone);

            var markSelectedPackageAsToggled = function(hierarchicalData, targetElementName) {
                for (var i = 0; i < hierarchicalData.children.length; i++) {
                    if (hierarchicalData.children[i].id === targetElementName) {
                        hierarchicalData.children[i].toggled = true;
                    }

                    if (hierarchicalData.children[i].children) {
                        markSelectedPackageAsToggled(hierarchicalData.children[i], targetElementName);
                    }
                }
            };

            var elementToDoList = selectedPackage.split(".");
            var currentName = "";
            for (var i = 0; i < elementToDoList.length; i++) {
                if (i > 0 ) {
                    currentName += '.' + elementToDoList[i];
                } else {
                    currentName = elementToDoList[i];
                }
                markSelectedPackageAsToggled(hotspotClone, currentName);
            }
            hotspotClone.toggled = true;

            this.setState({
                hotSpotData: hotspotClone,
                breadCrumbData: selectedPackage.split(".")
            });

            break;
          case 'SELECT_HOTSPOT_PACKAGE_FROM_BREADCRUMB':
            var elementName = event.action.data;
            var findNodeByName = function(hierarchicalData) {
                for (var i = 0; i < hierarchicalData.children.length; i++) {
                    if (hierarchicalData.children[i].id === elementName) {
                        return hierarchicalData.children[i];
                    } else {
                        if (hierarchicalData.children[i].children) {
                            var node = findNodeByName(hierarchicalData.children[i]);
                            if (typeof node !== 'undefined') {
                                return node;
                            }
                        }
                    }
                }
            };
            var node = findNodeByName(this.state.hotSpotData);
            //setTimeout to prevent "Cannot dispatch in the middle of a dispatch"
            // when the !!time is out!! the dispatch is completed and the next click can be handled
            setTimeout(function() { this.triggerClickOnNode(node) }.bind(this), 50);
          break;
          default:
            return true;
        }
    }

    breadcrumbClicked(clickEvent) {
        var element = clickEvent.target;
        var elementName = (element.id + "").replace(new RegExp(dynamicBreadcrumbSeparator, 'g'), '.');
        
        //var clickedPackage = element.id; //e.g. org.junit.tests.experimental...
        AppDispatcher.handleAction({
            actionType: 'SELECT_HOTSPOT_PACKAGE_FROM_BREADCRUMB',
            data: elementName
        });
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
                                Hotspots
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col xs="12" sm="12" md="12">
                                        <Card>
                                            <CardBody>
                                                <DynamicBreadcrumb
                                                    items={this.state.breadCrumbData}
                                                    onClickHandler={this.breadcrumbClicked}
                                                    separator={dynamicBreadcrumbSeparator}
                                                />
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs="12" sm="6" md="4">
                                        <Card id="treebeard-component" data-simplebar style={{height: "635px", overflow: "hidden"}}>
                                            <CardBody>
                                                <Treebeard
                                                    data={this.state.hotSpotData}
                                                    onToggle={this.onToggle}
                                                    style={treebeardCustomTheme.default}
                                                />
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col xs="12" sm="6" md="8">
                                        <Card id="hotspot-component">
                                            <CardBody>
                                                <div className={'hotspot-component'} style={{height: "600px"}}>
                                                    <ResponsiveBubbleHtml
                                                        onClick={ function(event) {
                                                            AppDispatcher.handleAction({
                                                                actionType: 'SELECT_HOTSPOT_PACKAGE',
                                                                data: event
                                                            });
                                                        } }
                                                        root={this.state.hotSpotData}
                                                        margin={{
                                                            "top": 20,
                                                            "right": 20,
                                                            "bottom": 20,
                                                            "left": 20
                                                        }}
                                                        identity="name"
                                                        value="loc"
                                                        colors="nivo"
                                                        colorBy={ function (e) {
                                                            var complexity = e.complexity;
                                                            var data = e.data;

                                                            var role = "undefined";
                                                            if (data && data.role) {
                                                                role = data.role;
                                                            }

                                                            var saturation = complexity / maxComplexity;
                                                            if (complexity === 0 && role === "node") {
                                                                var level = data.level;
                                                                var r = 228 - (11 * level * 2);
                                                                var g = 242 - (6 * level * 2);
                                                                var b = 243 - (6 * level * 2);
                                                                return 'rgb(' + r + ', ' + g + ', ' + b + ')';
                                                            } else {
                                                                return 'rgba(139, 0, 0, ' + saturation + ')';
                                                            }

                                                        } }
                                                        padding={6}
                                                        labelTextColor="inherit:darker(0.8)"
                                                        borderWidth={2}
                                                        defs={[
                                                            {
                                                                "id": "lines",
                                                                "type": "patternLines",
                                                                "background": "none",
                                                                "color": "inherit",
                                                                "rotation": -45,
                                                                "lineWidth": 5,
                                                                "spacing": 8
                                                            }
                                                        ]}
                                                        fill={[
                                                            {
                                                                "match": {
                                                                    "depth": 1
                                                                },
                                                                "id": "lines"
                                                            }
                                                        ]}
                                                        animate={false}
                                                        motionStiffness={90}
                                                        motionDamping={12}
                                                    />
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default RiskManagementHotspots;
