
export type BizAttributeType = {
    id: string;
    metaAttribute: { 
        id: string;
        name: string 
    }
    value: string;
};

export type BizRelationsType = {
    id: string;
    oppositeObject: {
        id: string;
        name: string;

    }
    metaRelation: {
        id: string;
        oppositeName: string;
        multiplicity: string;
        oppositeRelation: {
          id: string;
        }
    }
};

export type BOEditType = {
    id: string;
    name: string;
    state: string;
    metaObject: { 
        id: string;
        name: string 
    };
    bizAttributes: BizAttributeType[];
    outgoingRelations: BizRelationsType[];
};

export type BizObjectsType = {
    allBusinessObjects: BOEditType[];
};

export interface MOResponse {
    MetaObject: { 
        id: string,
        name: string,
        attributes: {
            id: string;
            name: string;
        }[],
        outgoingRelations: {
            id: string;
            oppositeName: string;
            oppositeObject: {
                name: string;
                businessObjects: {
                    id: string;
                    name: string
                }[]
            }
            multiplicity: string
        }[]
    };
}
