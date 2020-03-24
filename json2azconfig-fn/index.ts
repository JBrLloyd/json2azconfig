import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<Context> {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.body == null) {
        context.res = { status: 400 }
        return  context;
    }

    const flattenedSettings = flattenObject(req.body, req.query['prefix']);
    var returnSettings:any;

    switch (req.query['type']) {
        case "appsettings":
            returnSettings = convertToAppSettings(flattenedSettings);
            break;
        case "variablegroup":
            returnSettings = convertToVarGroup(flattenedSettings);
            break;
        default:
            returnSettings = flattenedSettings;
            break;
    }

    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: returnSettings
    };
};

interface IFlattenedSettings {
    key: string;
    value: string;
};

const flattenObject = (obj: Array<any>, prefix: string): Array<IFlattenedSettings> => {
    var flattenedSettings: Array<IFlattenedSettings> = [];

    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;

        if ((typeof obj[i]) == 'object' && obj[i] !== null) {
            var flatObject = flattenObject(obj[i], prefix);

            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                flattenedSettings.push({ key: `${prefix}${i}:${flatObject[x].key}`, value: flatObject[x].value});
            }
        } else {
            flattenedSettings.push({key: prefix + i, value: obj[i]});
        }
    }
    return flattenedSettings;
};

interface IAdoVariable {
    [name: string]: {
        value: string
    };
};

const convertToVarGroup = (flattenedSettings: Array<IFlattenedSettings>): IAdoVariable => {
    let adoVariables: IAdoVariable = {};

    flattenedSettings.forEach(({key, value}) => {
        adoVariables[key] = {
            "value": value
        }
    });

    return adoVariables;
};

interface IAppSetting {
    name: string;
    value: string;
    slotSetting: string;
};

const convertToAppSettings = (flattenedSettings: Array<IFlattenedSettings>): Array<IAppSetting> => {
    var appSettings: Array<IAppSetting> = [];
    
    flattenedSettings.forEach(setting => {
        var appSetting: IAppSetting = {
            name: setting.key,
            value: setting.value,
            slotSetting: "false"
        };

        appSettings.push(appSetting);
    });
    
    return appSettings;
};

export default httpTrigger;