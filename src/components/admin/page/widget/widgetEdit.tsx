import * as React from 'react';

import HTMLEditorView from '../HTMLEditor/HTMLEditor';
import { Widget } from './types';

interface Props {
    wid: string;     // If === null, new widget
    type?: string;  // If new === true
    name?: string;  // if new === true
    save: boolean;  // from false => true, call saveFunc(state) and close...
    onSave: (widget: Widget) => void;
}

export class WidgetEdit extends React.Component<Props> {

    render() {
        
        // tslint:disable-next-line:no-console
        console.log('########### WidgetEdit RE-render,,,,,');
        
        switch (this.props.type) {
            case 'HTML':
                return (
                    <HTMLEditorView widgetId={this.props.wid} save={this.props.save} onSave={this.props.onSave}/>
                );
            default:
                return <div>Type not implemented...</div>;
        }
    }
}