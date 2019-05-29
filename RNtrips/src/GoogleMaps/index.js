import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, PermissionsAndroid, StyleSheet, TextInput } from 'react-native';
import { Input } from 'react-native-elements';
import MapView, { PROVIDER_GOOGLE, Marker, MarkerAnimated } from 'react-native-maps';
import Modal from 'react-native-modal';
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
            isLongPressed: false,
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
        PermissionsAndroid.request("android.permission.ACCESS_FINE_LOCATION").then((resp) => {
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
    }

    onMapLongPress = () => {

        this.setState({ isLongPressed: true }, () => { this.state.isLongPressed = false });

    }

    render() {
        const { isLongPressed } = this.state;
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    ref={"map"}
                    style={styles.container}
                    followsUserLocation
                    showsMyLocationButton
                    initialRegion={this.getMapRegion()}
                    showsUserLocation
                    region={this.getMapRegion()}
                    onLongPress={this.onMapLongPress}
                />

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
                        />
                        <Input
                            containerStyle={{ width: '90%', height: 80, marginTop: 10, justifyContent: 'flex-start', borderRadius: 10, borderColor: '#24717B', borderWidth: 2, backgroundColor: 'white' }}
                            inputStyle={{ fontSize: 15 }}
                            inputContainerStyle={{ borderBottomWidth: 0 }}
                            placeholder={'Description'}
                        />
                        <TouchableOpacity
                            style={{ width: 80, height: 45, backgroundColor: '#24717B', marginTop: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => this.setState({ isLongPressed: false })}>
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