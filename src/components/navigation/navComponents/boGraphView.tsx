import * as React from 'react';
import gql from 'graphql-tag';
import { client } from '../../../index';

import * as vis from 'vis';

const getBO = gql`
query getBO($id: ID) {
    BusinessObject(id: $id)
    {
        id
        name
        outgoingRelations {
            oppositeObject {
                id
                name
            }
        }
    }
}
`;

interface BoItem {
    id: string;
    name: string;
    outgoingRelations: {
        oppositeObject: {
            id: string;
            name: string;
        };
    }[];
}

type ClickParams = {
    nodes: string[],
    edges: string[],
    event: Object[],
    pointer: {
        DOM: {x: number, y: number},
        canvas: {x: number, y: number}
    }
};

interface BoItem {
    id: string;
    name: string;
    outgoingRelations: {
        oppositeObject: {
            id: string;
            name: string;
        };
    }[];
}

interface Props {
    selectedListBO: BoItem;
    selectedBOchange: (id: string) => void;
}

export default class BOGraphView extends React.Component<Props> {
    private network: vis.Network;
    private myRef = React.createRef<HTMLDivElement>();
    private nodes = new vis.DataSet();
    private edges = new vis.DataSet();
    private selectedListBO = '';

    expandCollapseNode = async (params: ClickParams) => {
        // params.event = '[original event]';
        // document.getElementById('eventSpan').innerHTML = '<h2>Click event:</h2>' + JSON.stringify(params, null, 4);
        if (params.nodes.length > 0) {
            // tslint:disable-next-line:no-console
            console.log('Klickat på en eller flera noder: ' + JSON.stringify(params.nodes, null, 4));
            
            const { data } = await client.query({
                query: getBO,
                variables: { id: params.nodes[0] }
            });
            this.drawSubTree(data.BusinessObject);
        }
        if (params.edges.length > 0) {
            // tslint:disable-next-line:no-console
            console.log('Klickat på en eller flera edges: ' + JSON.stringify(params.edges, null, 4));
        }
        // console.log('click event, getNodeAt returns: ' + network.getNodeAt(params.pointer.DOM));
    }
/*
    handleItemClick = (params: ClickParams) => {
        if (params.nodes.length > 0) {
            this.props.selectBOchange(params.nodes[0]);
        }
    }
*/
    componentDidUpdate() {
        if (this.props.selectedListBO.id !== this.selectedListBO) {
            this.drawGraph();
            this.selectedListBO = this.props.selectedListBO.id;
        }
    }

    componentDidMount() {
        this.drawGraph();
    }

    drawSubTree = (bo: BoItem) => {
        bo.outgoingRelations.map(rel => {
            try {
                this.nodes.add({id: rel.oppositeObject.id, label: rel.oppositeObject.name, color: 'green', font: {color: 'black'}, shape: 'dot'});
                this.edges.add({id: 'E' + rel.oppositeObject.id, from: bo.id, to: rel.oppositeObject.id});
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.log(`Node/edge already in graph...`);
            }
        });
        this.props.selectedBOchange(bo.id);
    }

    drawGraph() {
        // RH ----------- OBS! Kolla om expand eller collapse, dvs håll state om ett objekt är öppet eller stängt! -----------
        const bo = this.props.selectedListBO;
        if (bo !== null) {
            this.nodes = new vis.DataSet();

            // var nodes = new Array<{id: string, label: string, color: string, font: {color: string}, shape: string}>(0);
            this.edges = new vis.DataSet();
            this.nodes.add({id: bo.id, label: bo.name, color: 'red', font: {color: 'gray'}, shape: 'dot'});
            bo.outgoingRelations.map(rel => {
                this.nodes.add({id: rel.oppositeObject.id, label: rel.oppositeObject.name, color: 'orange', font: {color: 'black'}, shape: 'dot'});
                this.edges.add({id: 'E' + rel.oppositeObject.id, from: bo.id, to: rel.oppositeObject.id});
            });

            // create a network
            // var container = ReactDOM.findDOMNode(this.networkNode) as HTMLElement;
            var data = {
                nodes: this.nodes,
                edges: this.edges
            };
            var options = { layout: { randomSeed: 8 }, width: '1000', height: '500' };

            this.network = new vis.Network(this.myRef.current, data, options);
            this.network.on('oncontext', params => {
                if (params.nodes.length > 0) {
                    this.props.selectedBOchange(params.nodes[0]);
                }
            });
            this.network.on('click', params => this.expandCollapseNode(params));
            // this.network.redraw();
        }
    }

    render() {  
        let name = this.props.selectedListBO === null ? 'Odefinierad' : this.props.selectedListBO.name;

        return (
            <div>
                <div>
                    Selected BO = {name}
                </div>
                <div ref={this.myRef}/>
            </div>
        );
    }
}
