exports.ErrorDo = function (data, name = "Error") {
    const errorDoData = ` | ${data} | ${name}`;
    console.error(errorDoData);
    console.log("==========");
    return errorDoData
}

exports.LogDo = function (data, name = "") {
    const logDoData = ` | ${data} | ${name}`;
    console.log(logDoData);
    console.log("==========");
    return logDoData;
}

exports.EmptyDo = function (data = "") { }