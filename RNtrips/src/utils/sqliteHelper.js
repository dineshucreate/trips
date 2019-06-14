import Sqlite from 'react-native-sqlite-storage';

const dbInstance = null
const dbName = '';
class SqliteHelper {

    constructor(name, dbVersion) {
        super();
        dbName = name
    }

    openDB = () => {
        dbInstance = Sqlite.openDatabase({ name: dbName });
    }

    createTable = (tableName, args) => {

        if (dbInstance == null) {
            this.openDB()
        }
        var columns = '';

        args.map((value, index) => {
            console.log(">>  " + JSON.stringify(value));
            if (index === 0) {
                columns = `${value.columnName} ${value.dataType}`
            } else {
                columns = columns + `, ${value.columnName} ${value.dataType}`
            }

        })
        console.log('Columns:  ' + columns);

        // dbName.transaction((txn) => {
        //     txn.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName}(${columns})`);
        // })

    }


}

export default SqliteHelper;