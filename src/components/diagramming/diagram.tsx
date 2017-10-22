import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as joint from 'jointjs';
import * as vis from 'vis';

import { beam } from '../../utils/robShapes';

import { Button, /*ButtonToolbar*/ } from 'react-md';

class Diagram extends React.Component {
    test: Number = 5;
    inc: Number = 0;        
    graph: joint.dia.Graph = new joint.dia.Graph();
    private placeholder: HTMLDivElement;
    private visualization: HTMLDivElement;
    private network: HTMLDivElement;
    
    componentDidMount() {
        let paper = new joint.dia.Paper({
            el: ReactDOM.findDOMNode(this.placeholder) as HTMLElement,
            width: 600,
            height: 200,
            model : this.graph,
            gridSize: 5
        });
        paper.setDimensions(800, 300);

        let rect = new beam.Process({
            position: { x: 100, y: 30 },
            size: { width: 100, height: 30 },
            attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
        });

        let c: joint.dia.Cell[] = [ rect ];
        this.graph.addCells(c);

        var container = ReactDOM.findDOMNode(this.visualization) as HTMLElement;
        var data = [
          {id: 1, content: 'item 1', start: '2013-04-20'},
          {id: 2, content: 'item 2', start: '2013-04-14'},
          {id: 3, content: 'item 3', start: '2013-04-18'},
          {id: 4, content: 'item 4', start: '2013-04-16', end: '2013-04-19'},
          {id: 5, content: 'item 5', start: '2013-04-25'},
          {id: 6, content: 'item 6', start: '2013-04-27'}
        ];
        var options = {};
        var timeline = new vis.Timeline(container, data, options);
        timeline.redraw();

        var nodes = [
            {id: 1,  label: 'Node 1', color: 'orange'},
            {id: 2,  label: 'Node 2', color: 'DarkViolet', font: {color: 'white'}},
            {id: 3,  label: 'Node 3', color: 'orange'},
            {id: 4,  label: 'Node 4', color: 'DarkViolet', font: {color: 'white'}},
            {id: 5,  label: 'Node 5', color: 'orange'},
            {id: 6,  label: 'cid = 1', cid: 1, color: 'orange'},
            {id: 7,  label: 'cid = 1', cid: 1, color: 'DarkViolet', font: {color: 'white'}},
            {id: 8,  label: 'cid = 1', cid: 1, color: 'lime'},
            {id: 9,  label: 'cid = 1', cid: 1, color: 'orange'},
            {id: 10, label: 'cid = 1', cid: 1, color: 'lime'}
          ];
          // create an array with edges
        var edges = [
            {from: 1, to: 2},
            {from: 1, to: 3},
            {from: 10, to: 4},
            {from: 2, to: 5},
            {from: 6, to: 2},
            {from: 7, to: 5},
            {from: 8, to: 6},
            {from: 9, to: 7},
            {from: 10, to: 9}
          ];
          // create a network
        var container2 = ReactDOM.findDOMNode(this.network) as HTMLElement;
        var data2 = {
            nodes: nodes,
            edges: edges
          };
        var options2 = {layout: {randomSeed: 8}, width: '1000', height: '500'};
        var network = new vis.Network(container2, data2, options2);
        network.redraw();
    }

    addRect = () =>  {
        let rect = new joint.shapes.basic.Path({
            size: { width: 30, height: 30 },
            attrs: {
                path: { 
                    d : 'M 441.30078 273.61133 C 266.57475 273.61133 124.34961 415.83646 124.34961 590.5625 L 124.34961 1457.4395\
                        C 124.34961 1632.1655 266.57475 1774.3906 441.30078 1774.3906 L 1606.6992 1774.3906 C 1781.4253 1774.390\
                        1923.6504 1632.1655 1923.6504 1457.4395 L 1923.6504 590.5625 C 1923.6504 415.83646 1781.4253 273.61133 1606.6992\
                        273.61133 L 441.30078 273.61133 z M 441.30078 373.61133 L 1606.6992 373.61133 C 1727.755 373.61133 1823.6504\
                        469.50674 1823.6504 590.5625 L 1823.6504 1457.4395 C 1823.6504 1578.4952 1727.755 1674.3906 1606.6992 1674.3906\
                        L 1370.457 1674.3906 L 1370.457 1043.6445 L 677.54297 1043.6445 L 677.54297 1075.3809 L 677.54297 1674.3906\
                        L 441.30078 1674.3906 C 320.24502 1674.3906 224.34961 1578.4952 224.34961 1457.4395 L 224.34961 590.5625 C 224.34961\
                        469.50674 320.24502 373.61133 441.30078 373.61133 z M 741.01562 1107.1172 L 1306.9844 1107.1172 L 1306.9844 1673.0859\
                        L 741.01562 1673.0859 L 741.01562 1107.1172 z M 976.52148 1187.6191 L 976.52148 1235.0996 L 976.52148 1345.3203\
                        L 866.29688 1345.3203 L 818.81641 1345.3203 L 818.81641 1440.2832 L 866.29688 1440.2832 L 976.52148 1440.2832\
                        L 976.52148 1550.5098 L 976.52148 1597.9844 L 1071.4785 1597.9844 L 1071.4785 1550.5098 L 1071.4785 1440.2832\
                        L 1181.7031 1440.2832 L 1229.1836 1440.2832 L 1229.1836 1345.3203 L 1181.7031 1345.3203 L 1071.4785 1345.3203\
                        L 1071.4785 1235.0996 L 1071.4785 1187.6191 L 976.52148 1187.6191 z',
                    style : 'color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;\
                        line-height:normal;font-family:sans-serif;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;\
                        text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;\
                        direction:ltr;block-progression:tb;writing-mode:lr-tb;baseline-shift:baseline;text-anchor:start;white-space:normal;\
                        clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;mix-blend-mode:normal;\
                        color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;fill:#000000;fill-opacity:1;\
                        fill-rule:nonzero;stroke:none;stroke-width:63.47264862;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;\
                        stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;\
                        text-rendering:auto;enable-background:accumulate'
                },
                text: {
                    text: 'BPMN',
                    // 'ref-y': .5 // basic.Path text is originally positioned under the element
                }
            }
        });        

        let c: joint.dia.Cell[] = [ rect ];
        this.graph.addCells(c);
    }

    render() {
        return (
            <div> 
                {/* Standard button */}
                <Button onClick={this.addRect} raised={true} primary={true}>Add rect</Button>{' '}

                <Button raised={true} secondary={true}>secondary</Button>{' '}
                <Button raised={true} negative={true}>negative</Button>{' '}
                <Button>ordinary</Button>{' '}
                <div ref={(c) => this.placeholder = c as HTMLDivElement}/>
                <div ref={(c) => this.visualization = c as HTMLDivElement}/>
                <div ref={(c) => this.network = c as HTMLDivElement}/>
                </div>
        );
    }
}

export default Diagram;
