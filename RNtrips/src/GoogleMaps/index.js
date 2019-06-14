import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, PermissionsAndroid, StyleSheet, Platform } from 'react-native';
import { Input } from 'react-native-elements';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Modal from 'react-native-modal';
import Geocoder from 'react-native-geocoder';
import SQLite from 'react-native-sqlite-storage';
import VectorIcon from '../utils/vectorIcons';
let { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;

const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const HOME = {
    latitude: 30.6982816,
    longitude: 76.6907806,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
}

const db = SQLite.openDatabase({ name: 'markers.db' });

const TABLE_NAME = 'table_markers';

class GoogleMaps extends React.Component {

    constructor() {
        super();
        this.state = {
            latitude: HOME.latitude,
            longitude: HOME.longitude,
            region: {
                latitude: HOME.latitude,
                longitude: HOME.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            },
            prevLatLng: {},
            address: '',
            markers: [],
            latlngs: [],
            isLongPressed: false,
            latlongTapped: {},
            title: '',
            description: '',
        };
    }
    getMapRegion = () => ({
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    });

    updateRegion = (position) => {
        console.log(`position: ${position}`);

        const { latitude, longitude } = position.coords;
        console.log(`Latlng: ${latitude}   ${longitude}`);

        const newCoordinate = {
            latitude,
            longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
        };
        try {
            if (Platform.OS === "android") {
                if (this.refs.map) {
                    this.refs.map.animateToRegion(newCoordinate, 1000);
                }
            } else {
                region.timing(newCoordinate).start();
            }
            this.setState({
                latitude,
                longitude,
                region: {
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                },
                prevLatLng: newCoordinate,

            });
        } catch (error) {
            console.log(error);

        }

    }


    componentDidMount() {
        PermissionsAndroid.requestMultiple(["android.permission.ACCESS_FINE_LOCATION", 'android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE']).then((resp) => {
            console.log('Response ' + JSON.stringify(resp));

        }).catch((error) => console.log('error:  ' + error)
        );
        // LocationSwitch.isLocationEnabled(
        //     () =>
        //         LocationSwitch.isLocationEnabledwithHigherAccuracy((value) => {
        //             console.log('Values is:  ' + value);
        //             if (!value) {
        //                 this.onEnableLocationPress()
        //             }
        //         })
        //     ,
        //     () => { this.onEnableLocationPress() },
        // );

        navigator.geolocation.getCurrentPosition(position => this.updateRegion(position),
            (error) => console.log(error.message),

        );

        this.fetchAllMarkers();

    }
    fitAllMarkers = () => {

        console.log(">>>   " + JSON.stringify(this.state.latlngs));


        if (this.state.latlngs.length > 0 && this.refs.map !== null) {
            this.refs.map.fitToCoordinates([{ latitude: 33.9260206, longitude: 75.0173499 }, { latitude: 33.949817, longitude: 74.985655 }], {
                edgePadding: 10,
                animated: true,
            });

        }
    }

    onMapLongPress = (event) => {
        const latlng = event.nativeEvent.coordinate;

        this.setState({ isLongPressed: true })
        this.fetchAddressFromLatLong(latlng.latitude, latlng.longitude)
    }

    fetchAddressFromLatLong = (lat, long) => {
        console.log(`lat: ${lat} long: ${long}`)
        var pos = {
            lat: lat,
            lng: long
        };
        Geocoder.geocodePosition(pos).then(res => {
            console.log(`address:   ${res[0].formattedAddress}`);
            this.setState({ address: res[0].formattedAddress, latlongTapped: pos })
        })
            .catch(error => alert(error));
    }

    createTableinDb = () => {

        db.transaction((tx) => {
            console.log('tx>>>>>>>>>>>>>   ' + JSON.stringify(tx));

            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS ${TABLE_NAME}(id INTEGER PRIMARY KEY AUTOINCREMENT,title VARCHAR(25), description VARCHAR(25),latitude REAL(10),longitude REAL(10))`,
                [],
                (tx, res) => {
                    if (res.rows.length === 0) {
                        this.insertIntoTable();

                    }
                }
            );
        });
    }

    insertIntoTable = () => {
        const { title, address, latlongTapped } = this.state;

        db.transaction((tx) => {
            tx.executeSql(
                `INSERT INTO ${TABLE_NAME}(title, description, latitude, longitude) VALUES (?,?,?,?)`, [title, address, latlongTapped.lat, latlongTapped.lng], function (tx, results) {
                    console.log('Results', results.rowsAffected);
                    if (results.rowsAffected > 0) {
                        console.log(`Row Inserted successfully.`);

                    } else {
                        console.log('Failed' + JSON.stringify(results) + '   ' + JSON.stringify(tx));

                    }
                }
            )
        })
    }

    addMarker = () => {
        const { title, address, latlongTapped } = this.state;

        this.setState({
            markers: [...this.state.markers, {
                title: title,
                description: address,
                latlng: {
                    latitude: latlongTapped.lat,
                    longitude: latlongTapped.lng
                }
            }],
            latlngs: [...this.state.latlngs, {
                latitude: latlongTapped.lat,
                longitude: latlongTapped.lng
            }],
            isLongPressed: false
        })
        this.createTableinDb();
    }

    fetchAllMarkers = () => {

        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM ${TABLE_NAME}`, [], (tx, res) => {
                var markers = [];
                var latlngs = [];
                var latlng = {};

                for (var i = 0; i < res.rows.length; i++) {

                    let item = res.rows.item(i)
                    const marker = { title: item.title, description: item.description, latlng: { latitude: item.latitude, longitude: item.longitude } }
                    latlng = {
                        latitude: item.latitude,
                        longitude: item.longitude
                    }
                    markers.push(marker);
                    latlngs.push(latlng)
                }
                this.setState({ markers: markers, latlngs: latlngs })
              //  this.fitAllMarkers();
            });

        })

    }


    markersRender = () => {
        const { markers } = this.state

        console.log(`markers:   ${JSON.stringify(markers)}`);


        return markers.map(marker => (
            <Marker
                ref={'marker'}
                draggable
                title={marker.title}
                description={marker.description}
                coordinate={marker.latlng}


            //  onPress={() => this.fetchAddressFromLatLong(marker.coordinate.lat, marker.coordinate.lng)}
            //   onDragEnd={(e) => this.setState({ region: e.nativeEvent.coordinate, latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude })}

            >
                <VectorIcon name={'star'} groupName={'AntDesign'} size={20} color={'#623456'} />

            </Marker>
        ));
    }

    render() {
        const { isLongPressed, address } = this.state;
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    ref={"map"}
                    style={styles.container}
                    followsUserLocation
                    showsMyLocationButton
                    zoomControlEnabled

                    initialRegion={this.getMapRegion()}
                    showsUserLocation
                    region={this.getMapRegion()}

                    onLongPress={this.onMapLongPress}
                >
                    {this.markersRender()}
                </MapView>

                <Modal
                    isVisible={isLongPressed}
                    backdropOpacity={0.5}
                    animationIn="zoomInDown"
                    animationOut="zoomOutUp"
                    animationInTiming={1000}
                    animationOutTiming={1000}
                    backdropTransitionInTiming={800}
                    backdropTransitionOutTiming={800}
                >
                    <View style={{
                        flexWrap: 'wrap',
                        backgroundColor: 'white',
                        padding: 15,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 8,
                        borderColor: '#24717B',
                    }}>
                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            <View />
                            <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 18 }}>Location details</Text>
                            <TouchableOpacity onPress={() => this.setState({ isLongPressed: false })}>
                                <VectorIcon name={'close'} groupName={'MaterialCommunityIcons'} size={20} color={'black'} />
                            </TouchableOpacity>
                        </View>

                        <Input
                            containerStyle={{ width: '90%', height: 40, justifyContent: 'center', borderRadius: 10, borderColor: '#24717B', borderWidth: 2, backgroundColor: 'white' }}
                            inputStyle={{ fontSize: 15 }}
                            inputContainerStyle={{ borderBottomWidth: 0 }}
                            placeholder={'Title'}
                            onChangeText={(text) => this.setState({ title: text })}
                        />
                        <Input
                            containerStyle={{ width: '90%', height: 80, marginTop: 10, justifyContent: 'flex-start', borderRadius: 10, borderColor: '#24717B', borderWidth: 2, backgroundColor: 'white' }}
                            inputStyle={{ fontSize: 15 }}
                            inputContainerStyle={{ borderBottomWidth: 0 }}
                            value={address}
                            multiline
                            placeholder={'Description'}
                            onChangeText={(text) => this.setState({ description: text })}
                        />
                        <TouchableOpacity
                            style={{ width: 80, height: 45, backgroundColor: '#24717B', marginTop: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}
                            onPress={this.addMarker}>
                            <Text style={{ color: 'white' }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </View >
        );
    }
}




const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        paddingTop: 150,
    },
});

export default GoogleMaps;