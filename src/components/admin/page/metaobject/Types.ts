// export enum MOPropType { ATTRIBUTE, RELATION }

export type MOAttributeItemType = {
    name: string;
    type: string;
};

export type MORelationItemType = {
    oppositeName: string;
    oppositeObject: { name: string };
    multiplicity: number;
    
};

export type MOPropertiesType = {
    name: string;
    attributes?: MOAttributeItemType[];
    outgoingRelations?: MORelationItemType[];
};

export type MOEditType = {
    metaObjects: MOPropertiesType[];
};