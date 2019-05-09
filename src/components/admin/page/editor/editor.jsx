///<reference path= "./../../../../../node_modules/react-froala-wysiwyg/lib/index.d.ts" />
import * as $ from 'jquery';
window.$ = $;

// Require Editor JS files.
import 'froala-editor/js/froala_editor.pkgd.min.js';

// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';

// Require Font Awesome.fon
import 'font-awesome/css/font-awesome.css';

import FroalaEditor from 'react-froala-wysiwyg';
import FroalaEditorView from 'react-froala-wysiwyg/FroalaEditorView';

// Include special components if required.
// import FroalaEditorView from 'react-froala-wysiwyg/FroalaEditorView';
// import FroalaEditorA from 'react-froala-wysiwyg/FroalaEditorA';
// import FroalaEditorButton from 'react-froala-wysiwyg/FroalaEditorButton';
// import FroalaEditorImg from 'react-froala-wysiwyg/FroalaEditorImg';
// import FroalaEditorInput from 'react-froala-wysiwyg/FroalaEditorInput';

// ReactDOM.render(<FroalaEditor tag="textarea"/>, document.getElementById('editor'));

import * as React from 'react';

import { client } from '../../../../index';
import gql from 'graphql-tag';
import { Button } from '@material-ui/core';

export const getHTMLWidgets = gql`
query getWidgets {
    widgets(
        where: {type: HTML}
    ) {
        id
        text
    }
}
`;

const saveHMTLWidget = gql`
mutation saveHMTLWidget($id: ID, $html: String, $width: Int) {
    upsertWidget(
        where: {id: $id}
        create: {type: HTML, text: $html, width: $width}
        update: {text: $html, width: $width}
    ) {
        id
    }
}
`;


export default class EditorComponent extends React.Component {
    state = {
        model: 'Example text',
        widgetId: ''
    };

    handleModelChange = (model) => {
        this.setState({
            model: model
        });
    }

    componentDidMount() {
        client.query({
            query: getHTMLWidgets
        }).then(result => {
            console.log('Result:' + result.data.widgets);
            if (result.data.widgets) {
                this.setState({
                    widgetId: result.data.widgets[0].id,
                    model: result.data.widgets[0].text
                });
            }
        });
    }

    saveHTML = () => {
        client.mutate({
            mutation: saveHMTLWidget,
            variables: {
                id: this.state.widgetId,
                html: this.state.model,
                width: 12
            }
        }).then(result => {
            alert('Saved widget ID: ' + result.data.upsertWidget.id)
        });
    }

    render() {
        return (
            <div>
                <Button variant="contained" color="primary" onClick={e => this.saveHTML()}>Save HTML</Button>
                <FroalaEditor
                    model={this.state.model}
                    onModelChange={this.handleModelChange}
                    config={{
                        paragraphStyles: {   // RH these classes are defined in App.css!
                            robclass1: 'Yellow background',
                            robclass2: 'Class 2',
                        }
                    }}
                />
            </div>
        );
    }
}

