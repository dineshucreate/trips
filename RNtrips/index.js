/**
 * @format
 */
import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';
import MlkitCamera from './src/MlKitCamera';
import GoogleMaps from './src/GoogleMaps';
import VectorIcon from './src/utils/vectorIcons';


const TabNativagator = createBottomTabNavigator({
    Maps: GoogleMaps,
    Camera: MlkitCamera,


},
    {
        tabBarOptions: {
            activeTintColor: '#A7E175',
            inactiveTintColor: 'white',
            style: {
                paddingBottom: 4.5,
                backgroundColor: '#24717B',
                height: 55,
            },
            labelStyle: {
                paddingTop: -2.5,
                fontWeight: '500',
            },
        },
        defaultNavigationOptions: ({ navigation }) => ({
            tabBarIcon: ({ tintColor }) => {
                const { routeName } = navigation.state;
                if (routeName === 'Camera') {
                    iconName = `camera`;
                } else if (routeName === 'Maps') {
                    iconName = `google-maps`;
                }
                return <VectorIcon name={iconName} groupName={'MaterialCommunityIcons'} size={25} color={tintColor} />;
            }
        })
    },

)

const contatiner = createAppContainer(TabNativagator);

AppRegistry.registerComponent(appName, () => contatiner);
