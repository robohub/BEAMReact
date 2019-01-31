import * as React from 'react';
import gql from 'graphql-tag';
import { client } from '../../../index';

import * as vis from 'vis';
import { Button } from 'react-md';

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
                outgoingRelations {
                    oppositeObject {
                        id
                    }
                }
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
            outgoingRelations: {
                oppositeObject: {
                    id: string;
                }
            }[]        
        }
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
        if (this.props.selectedListBO !== null && (this.props.selectedListBO.id !== this.selectedListBO)) {
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
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.log(`Node already in graph...`);
            }
            try {
                this.edges.add({id: 'E' + rel.oppositeObject.id, from: bo.id, to: rel.oppositeObject.id});
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.log(`Edge already in graph...`);
            }
        });
        this.props.selectedBOchange(bo.id);
    }

    drawGraph() {
        // RH ----------- OBS! Kolla om expand eller collapse, dvs håll state om ett objekt är öppet eller stängt! -----------
        const bo = this.props.selectedListBO;
        this.nodes = new vis.DataSet();
        this.edges = new vis.DataSet();

        if (bo !== null) {
            this.nodes.add({id: bo.id, label: bo.name, color: 'orange', font: {color: 'gray'}, shape: 'dot'});
            bo.outgoingRelations.map(rel => {
                try {
                    this.nodes.add({id: rel.oppositeObject.id, label: rel.oppositeObject.name, color: 'blue', font: {color: 'black'}, shape: 'dot'});
                } catch (e) {
                    // tslint:disable-next-line:no-console
                    console.log(`Node already in graph...`);
                }
                try {
                    this.edges.add({id: 'E' + rel.oppositeObject.id, from: bo.id, to: rel.oppositeObject.id});
                } catch (e) {
                    // tslint:disable-next-line:no-console
                    console.log(`Edge already in graph...`);
                }
            });
        }

        var data = {
            nodes: this.nodes,
            edges: this.edges
        };
        var options = { layout: { randomSeed: 8 }, width: '1000', height: '1000' };

        this.network = new vis.Network(this.myRef.current, data, options);
        this.network.on('oncontext', params => {
        if (params.nodes.length > 0) {
            this.props.selectedBOchange(params.nodes[0]);
        }
        });
        this.network.on('click', params => this.expandCollapseNode(params));
    }

    clicked = () => {
        this.network.moveTo({
            position: {x: 300, y: 300},
            scale: 1.0,
            // offset: {x: -500, y: -700}
          });       
    }

    render() {  
        let name = this.props.selectedListBO === null ? 'Odefinierad' : this.props.selectedListBO.name;

        return (
            <div>
                <div>
                    Selected BO = {name}
                </div>
                <div>
                    <Button onClick={this.clicked}>TRYCK HÄR</Button>
                </div>
                <div ref={this.myRef} style={{overflow: 'auto', height: '400'}}/>
            </div>
        );
    }
}
