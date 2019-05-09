
export type MetaObjectType = {
    id: string
    name: string
    attributes: {
        id: string
        name: string
    }[];
    businessObjects: { id: string; }[]
    outgoingRelations: MetaObjectOutRelsType[]
};

export type MetaObjectOutRelsType = {
    id: string
    oppositeName: string
    oppositeObject: {
        name: string
        businessObjects: {
            id: string
            name: string
            outgoingRelations: {
                id: string
                metaRelation: {
                    id: string
                    multiplicity: string
                }
                oppositeRelation: {
                    id: string

                }
            }[]
        }[]
    }
    multiplicity: string
};

export type MetaRelType = {
    id: string;
    oppositeName: string;
    oppositeRelation: {
        id: string;
        oppositeName: string;
        multiplicity: string;
    }
};

export type AllMRResponse = {
    metaRelations: MetaRelType[];
};

export interface MOResponse {
    metaObject: MetaObjectType;
}

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