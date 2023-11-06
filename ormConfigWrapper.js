const { DataSource } = require("typeorm");
const ds = new DataSource(require("./ormconfig"));
module.exports = { ds };