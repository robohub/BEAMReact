// export enum MOPropType { ATTRIBUTE, RELATION }

export type MOAttributeItemType = {
    id?: string
    name: string
    type: string
};

export type MORelationItemType = {
    id?: string
    oppositeName: string
    oppositeObject: { id: string; name: string }
    oppositeRelation?: { id: string; oppositeName: string; multiplicity: string }
    multiplicity: string
};

export type MOPropertiesType = {
    id?: string
    name?: string
    attributes?: MOAttributeItemType[]
    outgoingRelations?: MORelationItemType[]
};

export type MOEditType = {
    allMetaObjects: MOPropertiesType[]
    allMetaAttributes?: MOAttributeItemType[]
    // allMetaRelations?: MORelationItemType[]
};