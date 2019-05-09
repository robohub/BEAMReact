/*! Rappid v2.4.0 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2015 client IO

 2019-01-24 

This Source Code Form is subject to the terms of the Rappid Trial License
, v. 2.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_v2.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/

import * as joint from '../../../../vendor/rappid';

import * as _ from 'lodash';
import { StencilService } from './stencil-service';
import { ToolbarService } from './toolbar-service';
import { InspectorService } from './inspector-service';
import { HaloService } from './halo-service';
import { KeyboardService } from './keyboard-service';
import * as appShapes from '../shapes/app-shapes';

import gql from 'graphql-tag';
import { client } from '../../../..';
import { ApolloQueryResult } from 'apollo-client';

const saveMutation = gql`
mutation saveDiagram($id: ID, $dia: Json) {
    upsertDiagram(
        where: {id: $id}
        create: {diagramData: $dia}
        update: {diagramData: $dia}
    ) {
        id
        diagramData
}
`;

const getQuery = gql`
query getDiagram($id:ID) {
    diagram(
        where: {id: $id}
    ) {
        id
        diagramData
    }
}
`;

class KitchenSinkService {

    el: Element;

    graph: joint.dia.Graph;
    paper: joint.dia.Paper;
    paperScroller: joint.ui.PaperScroller;

    commandManager: joint.dia.CommandManager;
    snaplines: joint.ui.Snaplines;
    clipboard: joint.ui.Clipboard;
    selection: joint.ui.Selection;
    navigator: joint.ui.Navigator;

    stencilService: StencilService;
    toolbarService: ToolbarService;
    inspectorService: InspectorService;
    haloService: HaloService;
    keyboardService: KeyboardService;

    constructor(
        el: Element,
        stencilService: StencilService,
        toolbarService: ToolbarService,
        inspectorService: InspectorService,
        haloService: HaloService,
        keyboardService: KeyboardService
    ) {
        this.el = el;

        // apply current joint js theme
        // tslint:disable-next-line:no-unused-expression
        new joint.mvc.View({ el: this.el });

        this.stencilService = stencilService;
        this.toolbarService = toolbarService;
        this.inspectorService = inspectorService;
        this.haloService = haloService;
        this.keyboardService = keyboardService;
    }

    startRappid() {

        joint.setTheme('material');

        this.initializePaper();
        this.initializeStencil();
        this.initializeSelection();
        this.initializeHaloAndInspector();
        this.initializeNavigator();
        this.initializeToolbar();
        this.initializeKeyboardShortcuts();
        // this.initializeTooltips();
    }

    initializePaper() {

        const graph = this.graph = new joint.dia.Graph({}, {
            cellNamespace: appShapes
        });

        // tslint:disable-next-line:no-any
        graph.on('add', (cell: joint.dia.Cell, collection: any, opt: any) => {
            if (opt.stencil) { this.inspectorService.create(cell); }
        });

        this.commandManager = new joint.dia.CommandManager({ graph: graph });

        const paper = this.paper = new joint.dia.Paper({
            width: 800,
            height: 800,
            gridSize: 10,
            drawGrid: true,
            model: graph,
            cellViewNamespace: appShapes,
            defaultLink: <joint.dia.Link> new appShapes.app.Link()
        });

        paper.on('blank:mousewheel', _.partial(this.onMousewheel, null), this);
        paper.on('cell:mousewheel', this.onMousewheel.bind(this));

        paper.on('element:pointerdblclick', function(elementView: { model: joint.dia.Element }) {        
            var currentElement = elementView.model;
            alert('Double click on ' + currentElement.attributes.id);
        });

        this.snaplines = new joint.ui.Snaplines({ paper: paper });

        const paperScroller = this.paperScroller = new joint.ui.PaperScroller({
            paper,
            autoResizePaper: true,
            cursor: 'grab'
        });

        this.renderPlugin('.paper-container', paperScroller);
        paperScroller.render().center();

    }

    initializeStencil() {

        this.stencilService.create(this.paperScroller, this.snaplines);
        this.renderPlugin('.stencil-container', this.stencilService.stencil);
        this.stencilService.setShapes();
    }

    initializeSelection() {

        this.clipboard = new joint.ui.Clipboard();
        this.selection = new joint.ui.Selection({ paper: this.paper });
        const keyboard = this.keyboardService.keyboard;

        // Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
        // Otherwise, initiate paper pan.
        this.paper.on('blank:pointerdown', (evt: JQuery.Event, x: number, y: number) => {

            if (keyboard.isActive('shift', evt)) {
                this.selection.startSelecting(evt);
            } else {
                this.selection.cancelSelection();
                this.paperScroller.startPanning(evt);
            }
        });

        this.paper.on('element:pointerdown', (elementView: joint.dia.ElementView, evt: JQuery.Event) => {

            // Select an element if CTRL/Meta key is pressed while the element is clicked.
            if (keyboard.isActive('ctrl meta', evt)) {
                this.selection.collection.add(elementView.model);
            }

        });

        this.selection.on('selection-box:pointerdown', (elementView: joint.dia.ElementView, evt: JQuery.Event) => {

            // Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
            if (keyboard.isActive('ctrl meta', evt)) {
                this.selection.collection.remove(elementView.model);
            }

        },
                          this);
    }

    initializeHaloAndInspector() {

        this.paper.on('element:pointerup link:options', (cellView: joint.dia.CellView) => {

            const cell = cellView.model;

            if (!this.selection.collection.contains(cell)) {

                if (cell.isElement()) {

                    new joint.ui.FreeTransform({
                        cellView,
                        allowRotation: false,
                        preserveAspectRatio: !!cell.get('preserveAspectRatio'),
                        allowOrthogonalResize: cell.get('allowOrthogonalResize') !== false
                    }).render();

                    this.haloService.create(cellView);
                    this.selection.collection.reset([]);
                    this.selection.collection.add(cell, { silent: true });
                }

                this.inspectorService.create(cell);
            }
        });
    }

    initializeNavigator() {

        const navigator = this.navigator = new joint.ui.Navigator({
            width: 240,
            height: 115,
            paperScroller: this.paperScroller,
            zoom: false,
            paperOptions: {
                elementView: appShapes.NavigatorElementView,
                linkView: appShapes.NavigatorLinkView,
                cellViewNamespace: { /* no other views are accessible in the navigator */ }
            }
        });

        this.renderPlugin('.navigator-container', navigator);
    }

    initializeToolbar() {

        this.toolbarService.create(this.commandManager, this.paperScroller);

        this.toolbarService.toolbar.on({
            'svg:pointerclick': this.openAsSVG.bind(this),
            'png:pointerclick': this.openAsPNG.bind(this),
            'fullscreen:pointerclick': joint.util.toggleFullScreen.bind(joint.util, document.body),
            'to-front:pointerclick': this.selection.collection.invoke.bind(this.selection.collection, 'toFront'),
            'to-back:pointerclick': this.selection.collection.invoke.bind(this.selection.collection, 'toBack'),
            'layout:pointerclick': this.layoutDirectedGraph.bind(this),
            'snapline:change': this.changeSnapLines.bind(this),
            'clear:pointerclick': this.graph.clear.bind(this.graph),
            'print:pointerclick': this.paper.print.bind(this.paper),
            'grid-size:change': this.paper.setGridSize.bind(this.paper)
        });

        this.renderPlugin('.toolbar-container', this.toolbarService.toolbar);
    }

    changeSnapLines(checked: boolean) {

        if (checked) {
            this.snaplines.startListening();
            this.stencilService.stencil.options.snaplines = this.snaplines;
        } else {
            this.snaplines.stopListening();
            this.stencilService.stencil.options.snaplines = null;
        }
    }

    initializeKeyboardShortcuts() {

        this.keyboardService.create(
            this.graph, this.clipboard, this.selection, this.paperScroller, this.commandManager);
    }

    initializeTooltips(): joint.ui.Tooltip {

        return new joint.ui.Tooltip({
            rootTarget: document.body,
            target: '[data-tooltip]',
            direction: joint.ui.Tooltip.TooltipArrowPosition.Auto,
            padding: 10
        });
    }

    openAsSVG() {

        this.paper.toSVG((svg: string) => {
            new joint.ui.Lightbox({
                image: 'data:image/svg+xml,' + encodeURIComponent(svg),
                downloadable: true,
                fileName: 'Rappid'
            }).open();
        },               { preserveDimensions: true, convertImagesToDataUris: true });
    }

    openAsPNG() {

        this.paper.toPNG((dataURL: string) => {
            new joint.ui.Lightbox({
                image: dataURL,
                downloadable: true,
                fileName: 'Rappid'
            }).open();
        },               { padding: 10 });
    }

    onMousewheel(cellView: joint.dia.CellView, evt: JQuery.Event, ox: number, oy: number, delta: number) {

        if (this.keyboardService.keyboard.isActive('alt', evt)) {
            evt.preventDefault();
            this.paperScroller.zoom(delta * 0.2, { min: 0.2, max: 5, grid: 0.2, ox, oy });
        }
    }

    layoutDirectedGraph() {

        joint.layout.DirectedGraph.layout(this.graph, {
            setVertices: true,
            rankDir: 'TB',
            marginX: 100,
            marginY: 100
        });

        this.paperScroller.centerContent();
    }

    // tslint:disable-next-line:no-any
    renderPlugin(selector: string, plugin: any): void {

        this.el.querySelector(selector).appendChild(plugin.el);
        plugin.render();
    }

    async save() {
        let json = this.graph.toJSON();

        await client.mutate({
            mutation: saveMutation,
            variables: {
                id: 'cjuv91m7ckelh0b22d1tqb3i4',
                dia: json
            }
        });
        // tslint:disable-next-line:no-console
        console.log('Sparade diagram: ' + JSON.stringify(json));

    }

    async load() {
        const result = await client.query({
            query: getQuery,
            variables: {
                id: 'cjuv91m7ckelh0b22d1tqb3i4'
            }
        }) as ApolloQueryResult<{diagram: {diagramData: JSON}}>;
        
        let json = result.data.diagram.diagramData;
        this.graph.fromJSON(json);

        // tslint:disable-next-line:no-console
        console.log('Hämtade diagram: ' + JSON.stringify(json), { space: 2});
    }

    addBusinessObject(x: number, y: number, name: string, id: string, imgSrc: string) {

        var scrollerPos = this.paperScroller.getVisibleArea();

        // tslint:disable-next-line:no-console
        console.log('Paperscroller pos: ' + scrollerPos.x + ', ' + scrollerPos.y);

        let el = new appShapes.rob.BizObject({
            position: {x: x + scrollerPos.x, y: y + scrollerPos.y},
            attrs: {
                label: {
                    text: name
                },
                image: {
                    xlinkHref: imgSrc
                }
            },
            boId: id
        });
        el.addTo(this.graph);
    }

}

export default KitchenSinkService;
