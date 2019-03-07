
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
    oppositeRelation: {
        id: string
    }
    metaRelation: {
        id: string;
        oppositeName: string;
        multiplicity: string;

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
    businessObjects: BOEditType[];
};

export interface MOResponse {
    metaObject: { 
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

export type MetaRel = {
    id: string;
    oppositeName: string;
    oppositeRelation: {
        id: string;
        oppositeName: string;
        multiplicity: string;
    }
};

export type AllMRResponse = {
    metaRelations: MetaRel[];
};

export type FormAttribute = {
    name: string;
    maid: string;
    bizattrval: string;
};

export type FormRelation = {
    name: string;
    metarelid: string;
    bizrelbizobjs: string | string[];
};

export type FormValues = {
    bizAttributes: FormAttribute[];
    bizRelations: FormRelation[];
};