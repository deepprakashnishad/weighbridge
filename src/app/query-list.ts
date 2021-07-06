export class QueryList{

    // Weighbridges
    static readonly GET_WEIGHBRIDGES: string = "Select * from weighbridge";
    
    //Tags
    static readonly INSERT_TAG: string = "INSERT INTO TAGS(tagType, value)";
    static readonly GET_ALL_TAGS: string = "SELECT * FROM TAGS";
    static readonly GET_TAGS_BY_TYPE: string = "SELECT * FROM TAGS WHERE type={tagType}";
}