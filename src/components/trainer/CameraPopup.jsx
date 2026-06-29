import Webcam from "react-webcam";
import { useRef } from "react";

export default function CameraPopup({

onCapture,

onClose

}){

const webcamRef = useRef(null);

const capture = ()=>{

const imageSrc = webcamRef.current.getScreenshot();

onCapture(imageSrc);

};

return(

<div className="camera-overlay">

<div className="camera-card">

<h2>Take Selfie</h2>

<Webcam

audio={false}

ref={webcamRef}

screenshotFormat="image/jpeg"

videoConstraints={{
facingMode:"user"
}}

/>

<div className="camera-buttons">

<button onClick={capture}>

Capture

</button>

<button onClick={onClose}>

Cancel

</button>

</div>

</div>

</div>

);

}