import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import SqliteHelper from '../src/utils/sqliteHelper';


class Demo extends React.Component {
    constructor() {
        super();

        SqliteHelper = new SqliteHelper('TestFields', '1.0.0');
        SqliteHelper.prototype.openDB();
    }

    getEmail = (email) => {
        this.setState({ email: email })
    }
    getpassword = (password) => {
        this.setState({ password: password })
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <TextInput style={{ width: 100, height: 40, color: 'red' }}
                    value={email}
                    onChangeText={this.getEmail}
                />
                <TextInput style={{ width: 100, height: 40, color: 'red' }}
                    value={password}
                    onChangeText={this.getpassword}
                />
                <TouchableOpacity style={{ width: 50, height: 40, backgroundColor: 'blue' }} onPress={() => onClick({ email, password })}>
                    <Text>ADD</Text>
                </TouchableOpacity>
            </View>
        );
    }
}
