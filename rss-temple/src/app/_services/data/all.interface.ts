export interface AllOptions<Field> {
    fields?: Field[];
    search?: string;
    sort?: string;
    returnTotalCount?: boolean;
    sessionToken?: string;
}
