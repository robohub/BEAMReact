import * as joint from 'jointjs';

export namespace beam {
    
    export class Process extends joint.dia.Element {
        constructor(attributes?: joint.shapes.GenericAttributes<joint.shapes.basic.RectAttrs>, options?: Object) {
            super(attributes, options);
            this.set('markup', '<g class="rotatable"><g class="scalable"><rect/></g><text/></g>');
        }
        defaults(): Backbone.ObjectHash {
            return joint.util.deepSupplement(
                {                   
                    type: 'beam.Process',
                    attrs: {
                        'rect': { fill: 'white', stroke: 'black', 'follow-scale': true, width: 80, height: 40 },
                        'text': { 'font-size': 14, 'ref-x': .5, 'ref-y': .5, ref: 'rect', 'y-alignment': 'middle', 'x-alignment': 'middle' }
                    },
                    dbId: -1
                },
                joint.dia.Element.prototype.defaults
            );
        }
    }
/* OLD
    export let Organization = joint.dia.Element.extend({

        markup: '<g class="rotatable"><g class="scalable"><rect/></g><text/></g>',
        
        defaults: joint.util.deepSupplement({
        
            type: 'beam.Organization',
            attrs: {
                'rect': { fill: 'white', stroke: 'black', 'follow-scale': true, width: 80, height: 40 },
                'text': { 'font-size': 14, 'ref-x': .5, 'ref-y': .5, ref: 'rect', 'y-alignment': 'middle', 'x-alignment': 'middle' }
            },
            dbId: -1
            
    }, joint.dia.Element.prototype.defaults)
    });
*/

}
