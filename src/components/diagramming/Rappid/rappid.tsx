import * as React from 'react';

import { StencilService } from './services/stencil-service';
import { ToolbarService } from './services/toolbar-service';
import { InspectorService } from './services/inspector-service';
import { HaloService } from './services/halo-service';
import { KeyboardService } from './services/keyboard-service';
import RappidService from './services/kitchensink-service';
import { Button, Drawer } from '@material-ui/core';

import BOListContainer from '../../navigation/navComponents/boListContainer';

interface Props {
}

interface State {
    drawerOpen: boolean;
}

class Rappid extends React.Component<Props, State> {

    rappid: RappidService;

    constructor(props: Props) {
        super(props);
        this.state = ({drawerOpen: false});
    }

    componentDidMount() {

        this.rappid = new RappidService(
            document.getElementById('dia'),
            new StencilService(),
            new ToolbarService(),
            new InspectorService(),
            new HaloService(),
            new KeyboardService()
        );

        this.rappid.startRappid();

        this.rappid.load();
    }

    onSaveClick = () => {
        this.rappid.save();
    }
    onLoadClick = () => {
        this.rappid.load();
    }    
    openBOList = () => {
        this.setState({drawerOpen: true});
    }

    toggleDrawer = (open: boolean) => () => {
        this.setState({
            drawerOpen: !this.state.drawerOpen
        });
    }

    onDragOver = (ev: React.DragEvent<HTMLDivElement>) => {
        ev.dataTransfer.dropEffect = 'copy';
        ev.preventDefault();

    }

    onDrop = (ev: React.DragEvent<HTMLDivElement>, cat: string) => {
        let id = ev.dataTransfer.getData('id');
        let name = ev.dataTransfer.getData('name');
        let imgSrc = ev.dataTransfer.getData('svg');
        if (id !==  '' && name !== '') {
            let body = document.getElementById('appbody');
            let paper = document.getElementById('paper');
            let header = document.getElementById('appheader');

            // tslint:disable-next-line:max-line-length
            this.rappid.addBusinessObject(
                ev.clientX - ev.currentTarget.offsetLeft - paper.offsetLeft,
                ev.clientY - ev.currentTarget.offsetTop - body.offsetTop - header.offsetTop,
                name,
                id,
                imgSrc
            );
        }
    }

    render() {

        return (
            // tslint:disable-next-line:jsx-no-string-ref
            <div id="dia" className="joint-app joint-theme-material" style={{height: '94vh'}}  >
                
                <div id="appheader" className="app-header">
                    <Button color="primary" onClick={e => this.onSaveClick()}>Save</Button>
                    <Button color="secondary" onClick={e => this.onLoadClick()}>Load</Button>
                    <Button color="primary" onClick={e => this.openBOList()}>Add BO</Button>
                
                    {/*<div className="app-title">
                        <h1>Rappid</h1>
        </div>*/}
                    <div className="toolbar-container"/>
                </div>
                <div id="appbody" className="app-body">
                    <div className="stencil-container"/>
                    <div id="paper" className="paper-container"  onDrop={(e) => { this.onDrop(e, 'DIAGRAM'); }} onDragOver={(e) => this.onDragOver(e)}>
                        <Drawer anchor={'left'} open={this.state.drawerOpen} onClose={this.toggleDrawer(false)}>
                            <BOListContainer/>
                        </Drawer>
                    </div>
                    <div className="inspector-container"/>
                    <div className="navigator-container"/>

                </div>
            </div>
        );
    }
}

export default Rappid;
