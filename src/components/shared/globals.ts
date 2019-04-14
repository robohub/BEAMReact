// System config application variables
export class SystemConfigVars {
    public static SYSTEM_SETUP_ID = ''; // ID for the system setup "row" in the database

    public static SYSTEMUSER_METAOBJECT_MAPPING = ''; // Equals MO:User. Mapped in system setup config. SYSTEM variable.
    public static SYSTEMUSER_USERID_MA_MAPPING = ''; // Identifies the mapped MO:Users's meta attribute for userid, used when creating SysUser and MO:User...

    // The meta object connection to users, used define the collection of BOs to find user mapped templates
    public static TEMPLATE_CONFIG_METAOBJECT = '';
    // The meta relation connection to users, used define the collection of BOs to find user mapped templates
    public static TEMPLATE_CONFIG_METARELATION = '';
    // The opposite relation of TEMPLATE_CONFIG_METARELATION, used in logic to find user mapped templates
    public static USER_RELATED_METARELATION = '';

    // The relation in which to seek if userid defined in some metaobject to find a mapped template
    public static TEMPLATE_CONFIG_MORELATION = '';
    // Read at system setup config - default user mapped template
    public static DEFAULT_USER_TEMPLATE = '';
    // Mapping from user to template
    public static USER_TEMPLATE_MAP = new Map<string, {id: string, name: string}>();
}

// Login specified application variables
export class LoginVars {
    public static USER_ID = ''; // Set when user logs in, equals unique user name, eg. CDSID for VCC
    public static USER_TEMPLATE_NAME = ''; // The template associated with the logged on user
    public static USER_TEMPLATE_ID = ''; // The template associated with the logged on user
}