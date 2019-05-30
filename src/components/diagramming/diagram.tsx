import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import * as joint from 'jointjs';
import * as joint from '../../vendor/rappid';

// import * as vis from 'vis';
// import { beam } from '../../utils/robShapes';

import BOListContainer from './diagramComponents/boListContainer';

import { Grid, Paper, Button } from '@material-ui/core';

class Diagram extends React.Component {
    test: Number = 5;
    inc: Number = 0;        
    graph: joint.dia.Graph = new joint.dia.Graph();
    private placeholder: HTMLDivElement;
    // private paperScroller: joint.ui.PaperScroller;
    
    onDragOver = (ev: React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
    }

    onDrop = (ev: React.DragEvent<HTMLDivElement>, cat: string) => {
        let id = ev.dataTransfer.getData('id');
        let name = ev.dataTransfer.getData('name');
        // tslint:disable-next-line:no-console
        console.log('DROP!! :' + id + ':' + name + ' på ett objekt: ' + cat);
        this.addRect(name, ev.clientX - ev.currentTarget.offsetLeft, ev.clientY - ev.currentTarget.offsetTop);
    }

    componentDidMount() {
        var beamDefaultLink = new joint.dia.Link({
            attrs: {
                '.connection': { stroke: '#E74C3C', 'stroke-width': 4 },
                /*'.marker-source': { stroke: '#E74C3C', fill: '#E74C3C', d: 'M 10 0 L 0 5 L 10 10 z' },*/
                '.marker-target': { stroke: '#E74C3C', fill: '#E74C3C', d: 'M 10 0 L 0 5 L 10 10 z' }
            }
        });

        var paper = new joint.dia.Paper({
                    el: ReactDOM.findDOMNode(this.placeholder) as HTMLElement,
                    width: 2000,
                    height: 2000,
                    model : this.graph,
                    gridSize: 10,
                    defaultLink : beamDefaultLink,
                    drawGrid: true  // RH Funkar inte?
                });
                
        var snaplines = new joint.ui.Snaplines({ paper: paper });
        snaplines.startListening();
/*
        this.paperScroller = new joint.ui.PaperScroller({
            paper,
            autoResizePaper: true,
            cursor: 'grab'
        });

        let el = ReactDOM.findDOMNode(this.placeholder) as HTMLElement;
        el.append(this.paperScroller.render().el);
*/
/* REFACTOR - nyare version... RH 2019
        let rect = new beam.Process({
            position: { x: 100, y: 30 },
            size: { width: 100, height: 30 },
            attrs: { rect: { fill: 'blue' }, text: 'my box' }
        });

        let c: joint.dia.Cell[] = [ rect ];
        this.graph.addCells(c);
*/
/* RH Timeplan
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
*/
    }

    addRect = (name: string, x: number, y: number) =>  {
        let rect = new joint.shapes.basic.Path({
            size: { width: 50, height: 50 },
            position: {x: x, y: y},
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
                    style : ['color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;\
                        line-height:normal;font-family:sans-serif;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;\
                        text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;\
                        direction:ltr;block-progression:tb;writing-mode:lr-tb;baseline-shift:baseline;text-anchor:start;white-space:normal;\
                        clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;mix-blend-mode:normal;\
                        color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;fill:#000000;fill-opacity:1;\
                        fill-rule:nonzero;stroke:none;stroke-width:63.47264862;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;\
                        stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;\
                        text-rendering:auto;enable-background:accumulate'],
                },
                text: {
                    text: name,
                    // 'ref-y': .5 // basic.Path text is originally positioned under the element
                }
            }
        });        

        let c: joint.dia.Cell[] = [ rect ];
        this.graph.addCells(c);
    }

    handleAddClick = () => {
        this.addRect('New Object', 50, 50);
    }

    addLink = () => {
        var link2 = new joint.dia.Link({
            source: { x: 10, y: 380 },
            target: { x: 350, y: 380 },
            attrs: {
                '.connection': { stroke: '#E74C3C', 'stroke-width': 3 },
                // '.marker-source': { stroke: '#E74C3C', fill: '#E74C3C', d: 'M 10 0 L 0 5 L 10 10 z' },
                // '.marker-target': { stroke: '#E74C3C', fill: '#E74C3C', d: 'M 10 0 L 0 5 L 10 10 z' },
            }
        });

        this.graph.addCells([link2]);

    }

    render() {
        return (
                <Grid
                    container={true}
                    direction="row"
                    justify="flex-start"
                    alignItems="stretch"
                    spacing={1}
                >
                    <Grid item={true} xs={4}>
                        <Paper square={true}>
                            {/* Standard button */}
                            <Button onClick={this.handleAddClick} variant={'contained'} color={'primary'}>Add rect</Button>{' '}

                            <Button onClick={this.addLink} variant={'contained'} color={'secondary'}>Add link</Button>{' '}
                            <div onDragOver={(e) => this.onDragOver(e)} onDrop={(e) => { this.onDrop(e, 'DIAGRAM'); }}>
                                {/* <div ref={(c) => this.placeholder = c as HTMLDivElement}/> */}
                            </div>
                            {/* <div ref={(c) => this.visualization = c as HTMLDivElement}/> */}
                        </Paper>
                    </Grid>
                    <Grid item={true} xs={5}>
                        <div ref={(c) => this.placeholder = c as HTMLDivElement}/>
                    </Grid>
                    <Grid item={true} xs={3}>
                        <Paper square={true}>                          
                        <BOListContainer/>                       
                        </Paper>
                    </Grid>
                </Grid>
        );
    }
}

export default Diagram;
