module.exports = async function(context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.body == null) {
        return context.res = { status: 400 }
    }

    const flattenedSettings = flattenObject(req.body);
    const appSettings = convertToAppSettings(flattenedSettings);

    context.res = {
        status: 200,
        body: appSettings
    };
};

const flattenObject = (obj) => {
    var flattenedSettings = [];

    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;

        if ((typeof obj[i]) == 'object' && obj[i] !== null) {
            var flatObject = flattenObject(obj[i]);

            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                flattenedSettings.push({key: `${i}:${flatObject[x].key}`, value: flatObject[x].value});
            }
        } else {
            flattenedSettings.push({key: i, value: obj[i]});
        }
    }
    return flattenedSettings;
};

const convertToAppSettings = (flattenedSettings) => {
    var appSettings = [];
    
    flattenedSettings.forEach(setting => {
        var appSetting = {
            name: setting.key,
            value: setting.value,
            slotSetting: "false"
        };

        appSettings.push(appSetting);
    });
    
    return appSettings;
};