/*! Rappid v2.4.0 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2015 client IO

 2019-01-24 

This Source Code Form is subject to the terms of the Rappid Trial License
, v. 2.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_v2.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/

import * as joint from '../../../../vendor/rappid';
import { memoize } from 'lodash';

export namespace rob {
    export var BO = joint.dia.Element.define('rob.BO',
            { size: { width: 150, height: 100 },
                attrs: { rect: { width: 170, height: 60 }, 
                    '.card': { fill: '#FFFFFF', stroke: '#000000', 'stroke-width': 2, 'pointer-events': 'visiblePainted', rx: 10, ry: 10 },
                    image: { width: 48, height: 48, ref: '.card', 'ref-x': 10, 'ref-y': 5 },
                    '.rank': { 'text-decoration': 'underline', ref: '.card', 'ref-x': .9, 'ref-y': .2, 'font-family': 'Courier New', 'font-size': 14, 'text-anchor': 'end' },
                    '.name': { 'font-weight': '800', ref: '.card', 'ref-x': .9, 'ref-y': .6, 'font-family': 'Courier New', 'font-size': 14, 'text-anchor': 'end' }
                }
            // tslint:disable-next-line:align
            }, { 
                markup: '<g class="rotatable"><g class="scalable"><rect class="card"/><image/></g><text class="rank"/><text class="name"/></g>' 
            }
        );

    export class BizObject extends joint.shapes.standard.EmbeddedImage {
        defaults() {
            return joint.util.defaultsDeep({
                type: 'rob.BizObject',
                size: { width: 150, height: 60 },
                attrs: {
                    root: {
                        dataTooltip: 'Image',
                        dataTooltipPosition: 'left',
                        dataTooltipPositionSelector: '.joint-stencil'
                    },
                    body: {
                        fill: '#ffffff',
                        stroke: '#31d0c6',
                        strokeWidth: 2,
                        strokeDasharray: '0'
                    },
                    label: {
                        text: 'image',
                        fontFamily: 'Roboto Condensed',
                        fontWeight: 'Normal',
                        fontSize: 14,
                        fill: '#222138'
                    }
                },
        
                boId: -1  // RH default for custom attribute
            },                             joint.shapes.standard.EmbeddedImage.prototype.defaults);
        }
    }

}

export namespace app {

    export class CircularModel extends joint.shapes.standard.Ellipse {

        portLabelMarkup = [{
            tagName: 'text',
            selector: 'portLabel'
        }];

        defaults() {

            return joint.util.defaultsDeep({
                type: 'app.CircularModel',
                attrs: {
                    root: {
                        magnet: false
                    }
                },
                ports: {
                    groups: {
                        'in': {
                            markup: [{
                                tagName: 'circle',
                                selector: 'portBody',
                                attributes: {
                                    'r': 10
                                }
                            }],
                            attrs: {
                                portBody: {
                                    magnet: true,
                                    fill: '#61549c',
                                    strokeWidth: 0
                                },
                                portLabel: {
                                    fontSize: 11,
                                    fill: '#61549c',
                                    fontWeight: 800
                                }
                            },
                            position: {
                                name: 'ellipse',
                                args: {
                                    startAngle: 0,
                                    step: 30
                                }
                            },
                            label: {
                                position: {
                                    name: 'radial',
                                    args: null
                                }
                            }
                        },
                        'out': {
                            markup: [{
                                tagName: 'circle',
                                selector: 'portBody',
                                attributes: {
                                    'r': 10
                                }
                            }],
                            attrs: {
                                portBody: {
                                    magnet: true,
                                    fill: '#61549c',
                                    strokeWidth: 0
                                },
                                portLabel: {
                                    fontSize: 11,
                                    fill: '#61549c',
                                    fontWeight: 800
                                }
                            },
                            position: {
                                name: 'ellipse',
                                args: {
                                    startAngle: 180,
                                    step: 30
                                }
                            },
                            label: {
                                position: {
                                    name: 'radial',
                                    args: null
                                }
                            }
                        }
                    }
                }
            },                             joint.shapes.standard.Ellipse.prototype.defaults);
        }
    }

    export class RectangularModel extends joint.shapes.standard.Rectangle {

        portLabelMarkup = [{
            tagName: 'text',
            selector: 'portLabel'
        }];

        defaults() {

            return joint.util.defaultsDeep({
                type: 'app.RectangularModel',
                attrs: {
                    root: {
                        magnet: false
                    }
                },
                ports: {
                    groups: {
                        'in': {
                            markup: [{
                                tagName: 'circle',
                                selector: 'portBody',
                                attributes: {
                                    'r': 10
                                }
                            }],
                            attrs: {
                                portBody: {
                                    magnet: true,
                                    fill: '#61549c',
                                    strokeWidth: 0
                                },
                                portLabel: {
                                    fontSize: 11,
                                    fill: '#61549c',
                                    fontWeight: 800
                                }
                            },
                            position: {
                                name: 'left'
                            },
                            label: {
                                position: {
                                    name: 'left',
                                    args: {
                                        y: 0
                                    }
                                }
                            }
                        },
                        'out': {
                            markup: [{
                                tagName: 'circle',
                                selector: 'portBody',
                                attributes: {
                                    'r': 10
                                }
                            }],
                            position: {
                                name: 'right'
                            },
                            attrs: {
                                portBody: {
                                    magnet: true,
                                    fill: '#61549c',
                                    strokeWidth: 0
                                },
                                portLabel: {
                                    fontSize: 11,
                                    fill: '#61549c',
                                    fontWeight: 800
                                }
                            },
                            label: {
                                position: {
                                    name: 'right',
                                    args: {
                                        y: 0
                                    }
                                }
                            }
                        }
                    }
                }
            },                             joint.shapes.standard.Rectangle.prototype.defaults);
        }
    }

    export class Link extends joint.dia.Link {

        defaultLabel = {
            attrs: {
                rect: {
                    fill: '#ffffff',
                    stroke: '#8f8f8f',
                    strokeWidth: 1,
                    refWidth: 10,
                    refHeight: 10,
                    refX: -5,
                    refY: -5
                }
            }
        };

        // tslint:disable-next-line:no-any
        getDataWidth = memoize(function (d: any) {
            return (new joint.g.Path(d)).bbox().width;
        });

        // tslint:disable-next-line:no-any
        static connectionPoint(line: any, view: any, magnet: any, opt: any, type: any, linkView: any) {
            const markerWidth = linkView.model.getMarkerWidth(type);
            opt = { offset: markerWidth, stroke: true };
            // connection point for UML shapes lies on the root group containg all the shapes components
            const modelType = view.model.get('type');
            if (modelType.indexOf('uml') === 0) { opt.selector = 'root'; }
            // taking the border stroke-width into account
            if (modelType === 'standard.InscribedImage') { opt.selector = 'border'; }
            return joint.connectionPoints.boundary.call(this, line, view, magnet, opt, type, linkView);
        }

        defaults() {
            return joint.util.defaultsDeep({
                router: {
                    name: 'normal'
                },
                connector: {
                    name: 'rounded'
                },
                labels: [],
                attrs: {
                    line: {
                        stroke: '#8f8f8f',
                        strokeDasharray: '0',
                        strokeWidth: 2,
                        fill: 'none',
                        sourceMarker: {
                            type: 'path',
                            d: 'M 0 0 0 0',
                            stroke: 'none'
                        },
                        targetMarker: {
                            type: 'path',
                            d: 'M 0 -5 -10 0 0 5 z',
                            stroke: 'none'
                        }
                    }
                }
            },                             joint.dia.Link.prototype.defaults);
        }

        // tslint:disable-next-line:no-any
        getMarkerWidth(type: any) {
            const d = (type === 'source') ? this.attr('line/sourceMarker/d') : this.attr('line/targetMarker/d');
            return this.getDataWidth(d);
        }
    }
}

export const NavigatorElementView = joint.dia.ElementView.extend({

    body: null,

    markup: [{
        tagName: 'rect',
        selector: 'body',
        attributes: {
            'fill': '#31d0c6'
        }
    }],

    initialize() {
        this.listenTo(this.model, 'change:position', this.translate);
        this.listenTo(this.model, 'change:size', this.resize);
        this.listenTo(this.model, 'change:angle', this.rotate);
    },

    render() {
        const doc = joint.util.parseDOMJSON(this.markup);
        this.body = doc.selectors.body;
        this.el.appendChild(doc.fragment);
        this.update();
    },

    update() {
        const size = this.model.get('size');
        this.body.setAttribute('width', size.width);
        this.body.setAttribute('height', size.height);
        this.updateTransformation();
    }
});

export const NavigatorLinkView = joint.dia.LinkView.extend({

    initialize: joint.util.noop,

    render: joint.util.noop,

    update: joint.util.noop
});

// re-export build-in shapes from rappid
export const basic = joint.shapes.basic;
export const standard = joint.shapes.standard;
export const fsa = joint.shapes.fsa;
export const pn = joint.shapes.pn;
export const erd = joint.shapes.erd;
export const uml = joint.shapes.uml;
export const org = joint.shapes.org;
