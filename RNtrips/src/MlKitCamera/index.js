import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { RNCamera } from 'react-native-camera';
import VectorIcon from '../vectorIcons';
import ImageView from 'react-native-image-view';

const flashOn = 'flash-on';
const flashOff = 'flash-off';

export default class TextRecognition extends React.PureComponent {

    state = {
        value: '',
        gotResult: false,
        isFlash: false,
        flashMode: RNCamera.Constants.FlashMode.off,
        cameraType: RNCamera.Constants.Type.back,
        isImageFullScreen: false,
        canDetectFaces: false,
        isTextRecognise: false,
        isBarcode: false,
        faces: [],
        textBlocks: [],
        images: [{
            source: {
                uri: 'https://cdn.pixabay.com/photo/2017/08/17/10/47/paris-2650808_960_720.jpg',
            },
            title: 'Paris',
            width: 806,
            height: 720,
        }]
    }

    takePicture = async () => {
        if (this.camera) {
            const options = { quality: 0.5, base64: true, skipProcessing: true, forceUpOrientation: true };
            const data = await this.camera.takePictureAsync(options);
            console.log(JSON.stringify(data));

            this.setState({ value: data.uri, images: [{ source: { uri: data.uri }, width: data.width, height: data.height }] })


            // // for on-device (Supports Android and iOS)
            // const deviceTextRecognition = await RNMlKit.deviceTextRecognition(data.uri);
            // //     this.setState({ value: deviceTextRecognition })
            // console.log('Text Recognition On-Device', deviceTextRecognition);

            // this.setState({ value: deviceTextRecognition[0].resultText, gotResult: true })
            // // for cloud (At the moment supports only Android)
            // // const cloudTextRecognition = await RNMlKit.cloudTextRecognition(data.uri);
            // // console.log('Text Recognition Cloud', cloudTextRecognition);
        }
    };

    setFlashOnOff = () => {
        this.setState((prevState) => {
            return {
                isFlash: !prevState.isFlash,
                flashMode: (prevState.isFlash ? RNCamera.Constants.FlashMode.off : RNCamera.Constants.FlashMode.on)
            }
        })
    }

    changeCameraType = () => {
        this.setState((prevState) => {
            return {
                cameraType: prevState.cameraType === RNCamera.Constants.Type.back ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back,
            }
        })
    }

    toggle = value => () => this.setState(prevState => ({ [value]: !prevState[value] }));

    facesDetected = ({ faces }) => faces.length > 0 && this.state.canDetectFaces && this.setState({ faces });


    textRecognized = object => {
        const { textBlocks } = object;
        console.log(JSON.stringify(object));

        object.length > 0 && this.setState({ textBlocks });
    };

    barcodeRecognized = ({ barcodes }) => {
        console.log(JSON.stringify(barcodes));
        barcodes.length > 0 && this.setState({ barcodes })
    };


    renderImageModal = () => {
        return (
            <ImageView
                images={this.state.images}
                imageIndex={0}
                isVisible={this.state.isImageFullScreen}
                onClose={() => { this.setState({ isImageFullScreen: false }) }}
            // renderFooter={(currentImage) => (<View><Text>My footer</Text></View>)}
            />
        );
    }

    renderSmileReaction = (faces) => {

        if (faces.length > 0) {
            if (faces[0].smilingProbability.toFixed(0) == 1) {
                return (
                    <VectorIcon groupName={'Octicons'} name={'smiley'} size={35} color={'white'} />
                );
            } else {
                console.log('Value is 0');
                return (
                    <VectorIcon groupName={'SimpleLineIcons'} name={'emotsmile'} size={35} color={'white'} />
                );
            }
        }
    }


    render() {

        const { isFlash, flashMode, cameraType, value, isImageFullScreen, canDetectFaces, isTextRecognise, isBarcode, faces } = this.state;
        console.log(JSON.stringify(faces));

        return (
            <View style={{ flex: 1 }}>


                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={styles.preview}
                    type={cameraType}
                    flashMode={flashMode}
                    androidCameraPermissionOptions={{
                        title: 'Permission to use camera',
                        message: 'We need your permission to use your camera',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                    // Face recognize
                    faceDetectionLandmarks={
                        RNCamera.Constants.FaceDetection.Landmarks
                            ? RNCamera.Constants.FaceDetection.Landmarks.all
                            : undefined
                    }
                    faceDetectionClassifications={
                        RNCamera.Constants.FaceDetection.Classifications
                            ? RNCamera.Constants.FaceDetection.Classifications.all
                            : undefined
                    }
                    faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.accurate}
                    //   onFacesDetected={this.facesDetected}
                    onFaceDetectionError={(error) => {
                        console.log('error::   ' + error);
                    }}
                    // Text recognize
                    onTextRecognized={isTextRecognise ? this.textRecognized : null}
                    //Barcode
                    onGoogleVisionBarcodesDetected={isBarcode ? this.barcodeRecognized : null}
                    googleVisionBarcodeType={RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.ALL}
                >

                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1, padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={this.toggle('canDetectFaces')}>
                                <VectorIcon name={'face-recognition'} groupName={'MaterialCommunityIcons'} size={35} color={canDetectFaces ? 'white' : 'grey'} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.toggle('isTextRecognise')} >
                                <Text style={{ color: 'white', borderWidth: 2, borderRadius: 5, borderColor: 'white', padding: 10 }}>{!isTextRecognise ? 'Text Recognise' : 'Recognising text...'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.toggle('isBarcode')} >
                                <Text style={{ color: 'white', borderWidth: 2, borderRadius: 5, borderColor: 'white', padding: 10 }}>{!isBarcode ? 'Detect barcode' : 'Detecting barcode'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.setFlashOnOff} >
                                <VectorIcon name={isFlash ? flashOn : flashOff} groupName={'MaterialIcons'} size={25} color={'white'} />
                            </TouchableOpacity>

                        </View>
                        <View style={{ flex: 6.3 }}></View>
                        <View style={{ flex: 1.5, alignItems: 'center' }}>
                            <Text style={{ color: '#ffffff', fontSize: 20 }}>{canDetectFaces && (faces.length > 0 ? 'Face Detected' : 'No Face Detected')}</Text>
                            {
                                canDetectFaces && this.renderSmileReaction(faces)
                            }
                        </View>
                        <View style={{ flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => {
                                this.setState({ isImageFullScreen: !isImageFullScreen })
                            }}>
                                <Image style={{
                                    width: 40, height: 50,
                                    marginBottom: 8, marginLeft: 8
                                }}
                                    source={{ uri: value != '' ? value : 'https://www.chaarat.com/wp-content/uploads/2017/08/placeholder-user.png' }}

                                />
                            </TouchableOpacity>
                            {
                                isImageFullScreen && this.renderImageModal()
                            }
                            <TouchableOpacity style={{
                                width: 70, height: 70, borderRadius: 100, borderColor: 'red', borderWidth: 2,
                                backgroundColor: 'white', marginBottom: 8, alignSelf: 'center'
                            }}
                                activeOpacity={0.7}
                                onPress={this.takePicture}
                            />
                            <TouchableOpacity onPress={this.changeCameraType} style={{ marginRight: 10 }}>
                                <VectorIcon name={'rotate-3d'} groupName={'MaterialCommunityIcons'} size={40} color={'white'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </RNCamera>
            </View >
        );

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',

    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
});